import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useData } from "../context/DataContext";
import "./Checkout.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8014";
const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

export default function Checkout() {
  const { cartItems, cartTotal, cartSubtotal, cartDelivery, clearCart } =
    useData();
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
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

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }
    if (token) {
      fetchSavedAddresses();
    }
  }, [token, cartItems, navigate]);

  const fetchSavedAddresses = async () => {
    try {
      const res = await fetch(`${API}/api/user/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setSavedAddresses(data);
        if (data.length > 0) setShowNewForm(false);
      }
    } catch (err) {
      console.error("Failed to fetch addresses");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const selectAddress = (addr) => {
    setSelectedAddrId(addr._id);
    setForm({
      ...form,
      firstName: addr.firstName || "",
      lastName: addr.lastName || "",
      email: addr.email || form.email,
      phone: addr.phone || "",
      address: addr.address,
      city: addr.city,
      postalCode: addr.postalCode,
    });
    setShowNewForm(false);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setOrderError("");

    // 1. Save address if new and requested
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

    if (form.payment === "razorpay") {
      try {
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const orderRes = await fetch(`${API}/api/razorpay/order`, {
          method: "POST",
          headers,
          body: JSON.stringify({ amount: cartTotal }),
        });
        const orderData = await orderRes.json();

        if (!orderData.success) throw new Error(orderData.message);

        const options = {
          key: RAZORPAY_KEY_ID,
          amount: orderData.order.amount,
          currency: "INR",
          name: "Sovely B2C",
          description: "Secure Payment",
          order_id: orderData.order.id,
          handler: async (response) =>
            finalizeOrder(response.razorpay_payment_id),
          prefill: {
            name: `${form.firstName} ${form.lastName}`,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#10b981" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        setOrderError("Payment failed to initialize.");
        setPlacing(false);
      }
    } else {
      finalizeOrder("COD");
    }
  };

  const finalizeOrder = async (paymentId) => {
    const orderPayload = {
      customerName: `${form.firstName} ${form.lastName}`,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      postalCode: form.postalCode,
      paymentMethod: form.payment,
      paymentId: paymentId,
      items: cartItems,
      total: cartTotal,
      status: paymentId === "COD" ? "Pending" : "Paid",
    };

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderPayload),
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        if (token) {
          navigate("/orders");
        } else {
          navigate(`/track?orderId=${data.orderId}`, {
            state: { orderId: data.orderId },
          });
        }
      } else {
        setOrderError(data.message || "Order failed.");
      }
    } catch (err) {
      setOrderError("Finalization error.");
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
          {}
          <section className="checkout-section glass">
            <div className="section-title">
              <MapPin size={22} />
              <h2>Shipping Address</h2>
            </div>

            <div className="address-selection-grid">
              {savedAddresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`address-card ${selectedAddrId === addr._id ? "selected" : ""}`}
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

            {showNewForm && (
              <div className="new-address-form animate-slideDown">
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

          {}
          <section className="checkout-section glass">
            <div className="section-title">
              <CreditCard size={22} />
              <h2>Payment Method</h2>
            </div>
            <div className="payment-options">
              <label
                className={`payment-option ${form.payment === "razorpay" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={form.payment === "razorpay"}
                  onChange={handleChange}
                />
                <div className="payment-content">
                  <strong>Razorpay Secure</strong>
                  <span>Pay via Cards, UPI, or Net Banking</span>
                </div>
                <div className="payment-badge">Fast & Secure</div>
              </label>
              <label
                className={`payment-option ${form.payment === "cod" ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={form.payment === "cod"}
                  onChange={handleChange}
                />
                <div className="payment-content">
                  <strong>Cash on Delivery</strong>
                  <span>Pay when your order arrives</span>
                </div>
              </label>
            </div>
          </section>

          {orderError && (
            <div className="checkout-error-msg animate-shake">{orderError}</div>
          )}
        </div>

        {}
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
