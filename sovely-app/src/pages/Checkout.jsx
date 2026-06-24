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
  } = useData();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

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
      navigate("/cart");
      return;
    }
    if (token) {
      fetchUserData();
    }
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
      if (Array.isArray(orderData) && orderData.length > 0) {
        setLastOrder(orderData[0]);
      }
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

  // 3. ADDED: Elegant Quick Fill handler
  const handleQuickFillFromLastOrder = () => {
    if (!lastOrder) return;

    // Attempt to split the name from the last order, or fallback to current user profile
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

    // 1. Save new address if requested
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

    // 2. Prepare the complete order payload
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
      // 3. Initialize the order in the DB and create the Razorpay order simultaneously
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
        // 4. Open Razorpay exactly ONCE
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
              // 5. Verify the payment signature directly
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
        rzp.on("payment.failed", function (response) {
          setOrderError("Payment failed or cancelled.");
        });
        rzp.open();
      } else {
        // COD Flow
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

            {}
            {savedAddresses.length > 0 && (
              <div
                className="address-selection-grid"
                style={{ marginBottom: "20px" }}
              >
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

            {}
            {showNewForm && (
              <div className="new-address-form animate-slideDown">
                {}
                {lastOrder && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleQuickFillFromLastOrder}
                    style={{
                      marginBottom: "20px",
                      display: "flex",
                      gap: "8px",
                      alignItems: "center",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Zap size={18} color="#f59e0b" />
                    Autofill from my last order
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
                  <label
                    className="save-check"
                    style={{
                      marginTop: "16px",
                      display: "flex",
                      gap: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
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
                <div
                  className="detail-row"
                  style={{ color: "var(--accent)", fontWeight: "700" }}
                >
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

            <div className="checkout-trust">
              <div className="trust-badge">
                <ShieldCheck size={16} /> 256-bit SSL Secure
              </div>
              <div className="trust-badge">
                <Truck size={16} /> Tracked Delivery
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
