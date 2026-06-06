import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  Copy,
  Check,
  ArrowRight,
  ShoppingBag,
  MapPin,
  CreditCard,
  ShieldCheck,
  Download,
} from "lucide-react";
import "./OrderSuccess.css";
import Invoice from "../components/Invoice";

const API = import.meta.env.VITE_API_URL || "http://localhost:8014";

export default function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      setError("No Order ID found in URL.");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      let cleanId = orderId.trim();
      if (cleanId.startsWith("#")) {
        cleanId = cleanId.substring(1).trim();
      }
      try {
        const res = await fetch(
          `${API}/api/orders/track/${encodeURIComponent(cleanId)}`,
        );

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          setError(
            "Invalid server response. Please check the ID or try reloading.",
          );
          return;
        }

        const data = await res.json();
        if (res.ok) {
          setOrder(data);
        } else {
          setError(data.message || "Could not retrieve order details.");
        }
      } catch (err) {
        setError("Network error. Please reload the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleCopyId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading) {
    return (
      <div className="order-success-loading">
        <div className="spinner"></div>
        <p>Loading order confirmation details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-error container section">
        <div className="error-card glass animate-fadeUp">
          <h2>Oops! Something went wrong</h2>
          <p>{error || "Unable to load order details."}</p>
          <div className="error-actions">
            <Link to="/" className="btn btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page container section">
      {}
      <div className="success-header-banner animate-fadeUp">
        <div className="success-icon-wrapper animate-scaleIn">
          <CheckCircle size={48} />
        </div>
        <h1>Order Confirmed!</h1>
        <p className="greeting-text">
          Thank you, <strong>{order.customerName}</strong>. Your order is now
          being processed.
        </p>
      </div>

      {}
      <div
        className="order-id-card glass animate-fadeUp"
        style={{ animationDelay: "0.1s" }}
      >
        <span className="label">YOUR ORDER ID</span>
        <div className="order-id-copy-row">
          <code className="order-id-code">{order._id}</code>
          <button
            className={`copy-btn ${copied ? "copied" : ""}`}
            onClick={handleCopyId}
            title="Copy Order ID"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
        <p className="tracking-notice">
          Please save this Order ID to track your shipment later.
        </p>
      </div>

      {}
      <div
        className="success-details-grid animate-fadeUp"
        style={{ animationDelay: "0.2s" }}
      >
        {}
        <div className="items-card glass">
          <h3>Items Ordered</h3>
          <div className="ordered-items-list">
            {order.items?.map((item, idx) => (
              <div key={idx} className="ordered-item-row">
                <img
                  src={item.image}
                  alt={item.name}
                  className="item-thumbnail"
                />
                <div className="item-info">
                  <strong className="item-name">{item.name}</strong>
                  <span className="item-qty">Quantity: {item.quantity}</span>
                </div>
                <div className="item-price">
                  <span className="unit-price">
                    {formatPrice(item.price)} each
                  </span>
                  <strong className="total-price">
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="summary-cards-col">
          {}
          <div className="details-subcard glass">
            <div className="card-title-row">
              <MapPin size={18} />
              <h4>Shipping Details</h4>
            </div>
            <div className="subcard-content">
              <strong>{order.customerName}</strong>
              <p>{order.address}</p>
              <p>
                {order.city} - {order.postalCode}
              </p>
              <div className="contact-info">
                <span>Phone: {order.phone || "N/A"}</span>
                <span>Email: {order.email}</span>
              </div>
            </div>
          </div>

          {}
          <div className="details-subcard glass">
            <div className="card-title-row">
              <CreditCard size={18} />
              <h4>Payment Summary</h4>
            </div>
            <div className="subcard-content">
              <div className="price-row">
                <span>Subtotal</span>
                <span>
                  {formatPrice(order.total - (order.total >= 999 ? 0 : 50))}
                </span>
              </div>
              <div className="price-row">
                <span>Delivery</span>
                <span>{order.total >= 999 ? "FREE" : formatPrice(50)}</span>
              </div>
              <div className="divider"></div>
              <div className="price-row grand-total">
                <span>Total Paid</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
              <div className="payment-method-badge">
                <span>
                  Method:{" "}
                  <strong>
                    {order.paymentMethod === "razorpay"
                      ? "Razorpay Secure"
                      : "Cash on Delivery (COD)"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div
        className="success-actions-footer animate-fadeUp"
        style={{ animationDelay: "0.3s" }}
      >
        <Link
          to={`/track?orderId=${order._id}`}
          className="btn btn-primary track-status-btn"
        >
          <span>Track Order Status</span>
          <ArrowRight size={18} />
        </Link>
        <div className="secondary-buttons">
          <button onClick={() => window.print()} className="btn btn-outline">
            <Download size={18} />
            <span>Download Invoice</span>
          </button>
          <Link to="/" className="btn btn-outline">
            <ShoppingBag size={18} />
            <span>Continue Shopping</span>
          </Link>
          {token && (
            <Link to="/orders" className="btn btn-outline">
              <span>My Orders</span>
            </Link>
          )}
        </div>
        <div className="shield-notice">
          <ShieldCheck size={16} />
          <span>
            Your transaction is covered by the{" "}
            <strong>Sovely Purchase Protection</strong>.
          </span>
        </div>
      </div>
      <Invoice order={order} />
    </div>
  );
}
