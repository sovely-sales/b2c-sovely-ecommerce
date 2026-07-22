import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  ChevronRight,
  ShoppingBag,
  ShieldCheck,
  Plus,
  CheckCircle,
  Truck,
  Phone,
  Mail,
  User,
  Zap,
  Award,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { useData } from "../context/DataContext";
import "./Checkout.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8014";
const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

export default function Checkout() {
  const {
    cartItems,
    cartTotal,
    cartSubtotal,
    cartDelivery,
    clearCart,
    user,
    couponDiscount,
    coupon,
    availableCoupons,
    setCoupon,
    setCouponPercent,
  } = useData();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    postalCode: "",
    payment: "razorpay",
  });
  const [saveAddress, setSaveAddress] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [showNewForm, setShowNewForm] = useState(true);

  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");
  const orderCompletedRef = useRef(false);

  useEffect(() => {
    if (orderCompletedRef.current) return;
    if (cartItems.length === 0) {
      navigate("/products");
      return;
    }
    if (token) fetchUserData();
  }, [token, cartItems, navigate]);

  const fetchUserData = async () => {
    try {
      const addrRes = await fetch(`${API}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const addrData = await addrRes.json();
      if (Array.isArray(addrData)) {
        setSavedAddresses(addrData);
        if (addrData.length > 0) setShowNewForm(false);
      }
      const orderRes = await fetch(`${API}/api/user/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const orderData = await orderRes.json();
      if (Array.isArray(orderData) && orderData.length > 0)
        setLastOrder(orderData[0]);
    } catch (err) {
      console.error("Failed to fetch user checkout data");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const selectAddress = (addr) => {
    setSelectedAddrId(addr._id || addr.id);
    setForm({
      ...form,
      firstName: addr.firstName || user?.name?.split(" ")[0] || "",
      lastName:
        addr.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
      email: addr.email || user?.email || form.email,
      phone: addr.phone || user?.phone || "",
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
    });
    setShowNewForm(false);
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    if (!couponInput.trim()) return;
    const found = availableCoupons.find(
      (c) => c.code.toUpperCase() === couponInput.trim().toUpperCase(),
    );
    if (found && found.isActive) {
      setCoupon(found);
      setCouponPercent(found.discountType === "fixed" ? 0 : found.discountPercent);
      setCouponInput("");
    } else if (found && !found.isActive)
      setCouponError("This coupon is currently inactive.");
    else setCouponError("Invalid coupon code.");
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponPercent(0);
  };

  const handleQuickFillFromLastOrder = () => {
    if (!lastOrder) return;
    const nameParts = lastOrder.customerName
      ? lastOrder.customerName.split(" ")
      : user?.name?.split(" ") || ["", ""];
    setForm({
      ...form,
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      email: lastOrder.email || user?.email || "",
      phone: lastOrder.phone || user?.phone || "",
      address: lastOrder.address || "",
      city: lastOrder.city || "",
      postalCode: lastOrder.postalCode || "",
    });
    setSelectedAddrId(null);
    setShowNewForm(true);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setOrderError("");
    if (saveAddress && showNewForm && token) {
      try {
        await fetch(`${API}/api/user/address`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
      } catch (err) {
        console.error(err);
      }
    }
    const orderPayload = {
      customerName: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      paymentMethod: form.payment,
      items: cartItems,
      couponCode: coupon?.code || null,
    };
    try {
      const initRes = await fetch(`${API}/api/orders/init`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderPayload),
      });
      const initData = await initRes.json();
      if (!initData.success) throw new Error(initData.message);

      if (form.payment === "razorpay") {
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: initData.rzpOrder.amount,
          currency: "INR",
          name: "Sovely B2C",
          description: "Secure Payment",
          order_id: initData.rzpOrder.id,
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#10b981" },
          handler: async (response) => {
            try {
              const verifyRes = await fetch(`${API}/api/orders/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  dbOrderId: initData.dbOrderId,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                orderCompletedRef.current = true;
                clearCart();
                navigate(`/order-success?orderId=${initData.dbOrderId}`);
              } else {
                setOrderError(
                  "Payment verification failed. Please contact support.",
                );
              }
            } catch (err) {
              setOrderError("Could not verify payment with server.");
            }
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function () {
          setOrderError("Payment failed or cancelled.");
        });
        rzp.open();
      } else {
        orderCompletedRef.current = true;
        clearCart();
        navigate(`/order-success?orderId=${initData.dbOrderId}`);
      }
    } catch (err) {
      setOrderError(err.message || "Failed to initialize order.");
    } finally {
      setPlacing(false);
    }
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const getWhatsAppLink = () => {
    const itemList = cartItems
      .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
      .join("%0A");
    const text = `Hi! I'm on the checkout page of Sovely and want to place an order:%0A%0A${itemList}%0A%0ATotal Amount: ${formatPrice(cartTotal)}%0A%0APlease help me confirm.`;
    return `https://wa.me/919535094003?text=${text}`;
  };

  const handleShareToWhatsApp = async (e) => {
    e.preventDefault();
    const itemListText = cartItems
      .map((item) => `- ${item.name} (Qty: ${item.quantity})`)
      .join("\n");
    const shareText = `Hi! I'm on the checkout page of Sovely and want to place an order:\n\n${itemListText}\n\nTotal Amount: ${formatPrice(cartTotal)}\n\nPlease help me confirm.`;
    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [] }) &&
        cartItems.length > 0
      ) {
        const firstItem = cartItems[0];
        const imgUrl =
          firstItem.image && !firstItem.image.includes("undefined")
            ? firstItem.image
            : null;
        if (imgUrl) {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          const file = new File([blob], "product.jpg", { type: blob.type });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: "Sovely Order Request",
              text: shareText,
              files: [file],
            });
            return;
          }
        }
      }
      window.open(getWhatsAppLink(), "_blank", "noopener,noreferrer");
    } catch (err) {
      window.open(getWhatsAppLink(), "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="checkout-page container section">
      <div className="checkout-header animate-fadeUp">
        <h1>Secure Checkout</h1>
        <p>Complete your purchase in just a few clicks</p>
      </div>

      <div className="checkout-grid">
        <div
          className="checkout-main animate-fadeUp"
          style={{ animationDelay: "0.1s" }}
        >
          <section className="checkout-section glass">
            <div className="section-title">
              <MapPin size={22} />
              <h2>Shipping Address</h2>
            </div>

            {savedAddresses.length > 0 && (
              <div className="address-selection-grid">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id || addr.address}
                    className={`address-card ${selectedAddrId === (addr._id || addr.id) ? "selected" : ""}`}
                    onClick={() => selectAddress(addr)}
                  >
                    <div className="card-check">
                      <CheckCircle size={18} />
                    </div>
                    <strong>
                      {addr.firstName} {addr.lastName}
                    </strong>
                    <p>{addr.address}</p>
                    <p>
                      {addr.city}, {addr.postalCode}
                    </p>
                    <p className="card-phone">{addr.phone}</p>
                  </div>
                ))}
                <div
                  className={`address-card add-new-card ${showNewForm ? "selected" : ""}`}
                  onClick={() => {
                    setShowNewForm(true);
                    setSelectedAddrId(null);
                  }}
                >
                  <Plus size={24} />
                  <span>Add New Address</span>
                </div>
              </div>
            )}

            {showNewForm && (
              <div className="new-address-form animate-slideDown">
                {lastOrder && (
                  <button
                    type="button"
                    className="btn btn-outline quick-fill-btn"
                    onClick={handleQuickFillFromLastOrder}
                  >
                    <Zap size={18} color="#f59e0b" /> Autofill from my last
                    order
                  </button>
                )}
                <div className="form-row">
                  <div className="input-group">
                    <label>First Name</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Last Name</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="input-group full">
                  <label>Street Address</label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="input-group">
                    <label>City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Pincode</label>
                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {token && (
                  <label className="save-check">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                    />
                    Save this address for future use
                  </label>
                )}
              </div>
            )}
          </section>

          <section className="checkout-section glass">
            <div className="section-title">
              <CreditCard size={22} />
              <h2>Payment Method</h2>
            </div>
            <div className="payment-options">
              <div
                className="payment-option active"
                style={{ cursor: "default" }}
              >
                <div className="payment-content">
                  <strong>Razorpay Secure</strong>
                  <span>Pay via Cards, UPI, or Net Banking</span>
                </div>
                <div className="payment-badge">Fast & Secure</div>
              </div>
            </div>
          </section>
          {orderError && (
            <div className="checkout-error-msg animate-shake">{orderError}</div>
          )}
        </div>

        <aside
          className="checkout-sidebar animate-fadeUp"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="summary-card-checkout glass">
            <h3>Order Summary</h3>
            <div className="summary-items-mini">
              {cartItems.map((item) => (
                <div key={item.id} className="mini-item">
                  <img src={item.image} alt="" />
                  <div className="mini-info">
                    <strong>{item.name}</strong>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <div className="mini-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="shipping-upsell-offers-co">
              <h4 className="upsell-title-co">🔥 Special Shipping Offers</h4>
              <div className="upsell-list-co">
                <div className="upsell-item-co">
                  <span className="icon">🚚</span>
                  <div className="text">
                    <strong>Flat ₹50 Shipping</strong>
                    <span>
                      On multiple products with a total weight of up to 500g.
                    </span>
                  </div>
                </div>
                <div className="upsell-item-co">
                  <span className="icon">🎉</span>
                  <div className="text">
                    <strong>FREE Shipping</strong>
                    <span>Get free shipping on all orders above ₹999.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="coupon-section-co">
              <h4 className="coupon-title-co">Apply Coupon</h4>
              {coupon ? (
                <div className="applied-coupon-co">
                  <div className="info">
                    <span className="code">✔ {coupon.code}</span>
                    <span className="discount">
                      (
                      {coupon.discountType === "fixed"
                        ? `${formatPrice(coupon.discountAmount)} OFF`
                        : `${coupon.discountPercent}% OFF`}
                      )
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="remove-btn-co"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="coupon-input-group-co">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter code"
                    />
                    <button onClick={handleApplyCoupon}>Apply</button>
                  </div>
                  {couponError && (
                    <div className="coupon-error-co">{couponError}</div>
                  )}
                </>
              )}
            </div>

            <div className="summary-details">
              <div className="detail-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="detail-row">
                <span>Delivery</span>
                <span>
                  {cartDelivery === 0 ? "FREE" : formatPrice(cartDelivery)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="detail-row discount">
                  <span>Coupon Discount</span>
                  <span>- {formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="divider"></div>
              <div className="detail-row total">
                <span>Total Amount</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary place-order-btn"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                "Processing..."
              ) : (
                <>
                  Place Order <ChevronRight size={18} />
                </>
              )}
            </button>

            <button
              onClick={handleShareToWhatsApp}
              className="whatsapp-checkout-btn"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.63 1.97 14.162.946 11.535.946c-5.438 0-9.863 4.372-9.867 9.802-.001 1.73.463 3.42 1.343 4.926l-1.014 3.705 3.821-.993zm11.272-7.01c-.3-.149-1.772-.864-2.047-.964-.275-.1-.475-.149-.675.15-.2.299-.775.964-.95 1.163-.175.199-.35.224-.65.075-.3-.149-1.265-.462-2.41-1.474-.89-.785-1.49-1.754-1.665-2.052-.175-.299-.019-.461.13-.609.135-.133.3-.349.45-.523.15-.174.2-.299.3-.499.1-.199.05-.374-.025-.524-.075-.15-.675-1.608-.925-2.203-.244-.582-.49-.5-.675-.509-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.772-.717 2.022-1.412.25-.694.25-1.29.175-1.413-.075-.124-.275-.199-.575-.349z" />
              </svg>
              <span>Order On WhatsApp</span>
            </button>

            <div className="our-approach-section">
              <h4>Our Approach</h4>
              <div className="approach-grid">
                <div className="approach-item">
                  <div className="icon-wrap">
                    <Award size={18} />
                  </div>
                  <span>Best Quality</span>
                </div>
                <div className="approach-item">
                  <div className="icon-wrap">
                    <Banknote size={18} />
                  </div>
                  <span>Cash On Delivery</span>
                </div>
                <div className="approach-item">
                  <div className="icon-wrap">
                    <Truck size={18} />
                  </div>
                  <span>Free Shipping</span>
                </div>
                <div className="approach-item">
                  <div className="icon-wrap">
                    <RotateCcw size={18} />
                  </div>
                  <span>Hassle Free Returns</span>
                </div>
              </div>
            </div>

            <div className="safe-checkout-section">
              <h4>Safe Checkout</h4>
              <div className="safe-badges">
                <span>✔ Norton Secured</span>
                <span>🛡️ TRUSTe Privacy</span>
                <span>🔒 VeriSign</span>
                <span>🔒 McAfee Secure</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
