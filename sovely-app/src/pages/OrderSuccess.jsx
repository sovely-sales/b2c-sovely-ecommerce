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

  const steps = ["Placed", "Processing", "Shipped", "Delivered"];
  const getStatusStep = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "pending" || s === "paid") return 0;
    if (s === "processing") return 1;
    if (s === "shipped") return 2;
    if (s === "delivered") return 3;
    return 0;
  };
  const currentStep = getStatusStep(order.status);

  return (
    <div
      className="order-success-page container section"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}
    >
      {}
      <div
        className="success-header-banner"
        style={{
          textAlign: "left",
          marginBottom: "30px",
          borderBottom: "var(--border-thick)",
          paddingBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div
            className="success-icon-wrapper animate-scaleIn"
            style={{
              margin: 0,
              width: "60px",
              height: "60px",
              background: "var(--primary)",
              border: "var(--border-thick)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              boxShadow: "var(--shadow-neo)",
            }}
          >
            <CheckCircle size={32} />
          </div>
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Order Confirmed!
            </h1>
            <p
              className="greeting-text"
              style={{
                fontSize: "1rem",
                margin: "4px 0 0 0",
                textAlign: "left",
              }}
            >
              Thank you, <strong>{order.customerName}</strong>. Your order has
              been received and is being processed.
            </p>
          </div>
        </div>
      </div>

      <div
        className="success-details-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: "40px",
          alignItems: "start",
        }}
      >
        {}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {}
          <div className="items-card glass" style={{ padding: "24px" }}>
            <h3
              style={{
                margin: "0 0 20px 0",
                textTransform: "uppercase",
                fontSize: "1rem",
                fontWeight: 900,
              }}
            >
              Order Status Tracker
            </h3>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                position: "relative",
                padding: "10px 0",
              }}
            >
              {}
              <div
                style={{
                  position: "absolute",
                  top: "26px",
                  left: "40px",
                  right: "40px",
                  height: "4px",
                  background: "#e2e8f0",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: `${(currentStep / 3) * 100}%`,
                    height: "100%",
                    background: "var(--primary)",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>

              {}
              {["Confirmed", "Processing", "Shipped", "Delivered"].map(
                (label, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isActive = idx === currentStep;
                  return (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 2,
                        position: "relative",
                        width: "80px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: isCompleted ? "var(--primary)" : "#fff",
                          border: "3px solid #000",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "900",
                          fontSize: "0.85rem",
                          boxShadow: isActive ? "2px 2px 0px #000" : "none",
                        }}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </div>
                      <span
                        style={{
                          marginTop: "8px",
                          fontSize: "0.75rem",
                          fontWeight: isCompleted ? "900" : "600",
                          textTransform: "uppercase",
                          color: isCompleted
                            ? "var(--text-main)"
                            : "var(--text-muted)",
                          textAlign: "center",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {}
          <div
            className="order-id-card glass"
            style={{
              margin: 0,
              maxWidth: "none",
              textAlign: "left",
              padding: "24px",
            }}
          >
            <span
              className="label"
              style={{
                marginBottom: "8px",
                fontSize: "0.8rem",
                fontWeight: "800",
                letterSpacing: "1px",
                color: "var(--text-muted)",
                display: "block",
              }}
            >
              YOUR ORDER ID
            </span>
            <div
              className="order-id-copy-row"
              style={{
                justifyContent: "flex-start",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <code
                className="order-id-code"
                style={{
                  fontSize: "1.2rem",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-thin)",
                  background: "var(--bg-main)",
                }}
              >
                {order._id}
              </code>
              <button
                className={`copy-btn ${copied ? "copied" : ""}`}
                onClick={handleCopyId}
                style={{
                  borderRadius: "var(--radius-sm)",
                  border: "var(--border-thick)",
                  boxShadow: "var(--shadow-neo-hover)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 18px",
                  fontWeight: "700",
                }}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span
                  style={{
                    fontWeight: 800,
                    textTransform: "uppercase",
                    fontSize: "0.8rem",
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </span>
              </button>
            </div>
            <p
              className="tracking-notice"
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: "var(--text-muted)",
              }}
            >
              Please save this Order ID to track your shipment later.
            </p>
          </div>

          {}
          <div className="items-card glass" style={{ padding: "24px" }}>
            <h3
              style={{
                margin: "0 0 20px 0",
                textTransform: "uppercase",
                fontSize: "1rem",
                fontWeight: 900,
                borderBottom: "var(--border-thin)",
                paddingBottom: "12px",
              }}
            >
              Items Ordered
            </h3>
            <div className="ordered-items-list" style={{ gap: "16px" }}>
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="ordered-item-row"
                  style={{
                    borderBottom:
                      idx === order.items.length - 1
                        ? "none"
                        : "var(--border-thin)",
                    paddingBottom: idx === order.items.length - 1 ? 0 : "16px",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-thumbnail"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "contain",
                      border: "var(--border-thin)",
                      borderRadius: "var(--radius-sm)",
                      background: "#fff",
                      padding: "4px",
                    }}
                  />
                  <div className="item-info" style={{ flex: 1 }}>
                    <strong
                      className="item-name"
                      style={{ fontSize: "0.95rem", fontWeight: 800 }}
                    >
                      {item.name}
                    </strong>
                    <span
                      className="item-qty"
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      Quantity: {item.quantity}
                    </span>
                  </div>
                  <div className="item-price" style={{ textAlign: "right" }}>
                    <span
                      className="unit-price"
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      {formatPrice(item.price)} each
                    </span>
                    <strong
                      className="total-price"
                      style={{ fontSize: "1rem", color: "var(--primary-dark)" }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          {}
          <div className="details-subcard glass" style={{ padding: "24px" }}>
            <div
              className="card-title-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "var(--border-thin)",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <MapPin size={20} className="text-primary" />
              <h4
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  fontWeight: 900,
                }}
              >
                Shipping Details
              </h4>
            </div>
            <div
              className="subcard-content"
              style={{ fontSize: "0.85rem", lineHeight: 1.5 }}
            >
              <strong
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "0.95rem",
                }}
              >
                {order.customerName}
              </strong>
              <p style={{ margin: "0 0 4px 0" }}>{order.address}</p>
              <p style={{ margin: "0 0 12px 0" }}>
                {order.city} - {order.postalCode}
              </p>
              <div
                className="contact-info"
                style={{
                  borderTop: "var(--border-thin)",
                  paddingTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <p style={{ margin: 0 }}>
                  <strong>Phone:</strong> {order.phone || "N/A"}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Email:</strong> {order.email}
                </p>
              </div>
            </div>
          </div>

          {}
          <div className="details-subcard glass" style={{ padding: "24px" }}>
            <div
              className="card-title-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "var(--border-thin)",
                paddingBottom: "12px",
                marginBottom: "16px",
              }}
            >
              <CreditCard size={20} className="text-primary" />
              <h4
                style={{
                  margin: 0,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  fontWeight: 900,
                }}
              >
                Payment Summary
              </h4>
            </div>
            <div className="subcard-content" style={{ fontSize: "0.85rem" }}>
              <div
                className="price-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Subtotal</span>
                <span>
                  {formatPrice(order.total - (order.total >= 999 ? 0 : 50))}
                </span>
              </div>
              <div
                className="price-row"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Delivery</span>
                <span
                  style={{
                    color:
                      order.total >= 999 ? "var(--primary-dark)" : "inherit",
                    fontWeight: order.total >= 999 ? 800 : "normal",
                  }}
                >
                  {order.total >= 999 ? "FREE" : formatPrice(50)}
                </span>
              </div>
              <div className="divider" style={{ margin: "12px 0" }}></div>
              <div
                className="price-row grand-total"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  marginBottom: "16px",
                }}
              >
                <span>Total Paid</span>
                <strong style={{ color: "var(--primary-dark)" }}>
                  {formatPrice(order.total)}
                </strong>
              </div>
              <div
                className="payment-method-badge"
                style={{
                  padding: "10px",
                  background: "var(--bg-main)",
                  border: "var(--border-thin)",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
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

          {}
          <div
            className="details-subcard glass"
            style={{
              padding: "24px",
              background:
                "linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)",
              border: "2px solid #000",
            }}
          >
            <h4
              style={{
                margin: "0 0 16px 0",
                textTransform: "uppercase",
                fontSize: "0.85rem",
                fontWeight: 900,
              }}
            >
              Actions
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <Link
                to={`/track?orderId=${order._id}`}
                className="btn btn-primary track-status-btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  gap: "8px",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                }}
              >
                <span>Track Order Status</span>
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => window.print()}
                className="btn btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  gap: "8px",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                }}
              >
                <Download size={16} />
                <span>Download Invoice</span>
              </button>
              <Link
                to="/products"
                className="btn btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  display: "flex",
                  gap: "8px",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  fontSize: "0.85rem",
                }}
              >
                <ShoppingBag size={16} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Invoice order={order} />
    </div>
  );
}
