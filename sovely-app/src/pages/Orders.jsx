import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ChevronRight,
  Package,
  Calendar,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import "./Orders.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8014";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API}/api/user/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token, navigate]);

  const formatPrice = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  if (loading)
    return (
      <div className="orders-loading">
        <div className="loader"></div>
      </div>
    );

  return (
    <div className="orders-page container section">
      <div className="orders-header animate-fadeUp">
        <h1 className="page-title">My Orders</h1>
        <p>Track and manage your recent purchases</p>
      </div>

      <div
        className="orders-list animate-fadeUp"
        style={{ animationDelay: "0.1s" }}
      >
        {orders.length === 0 ? (
          <div className="empty-orders glass">
            <ShoppingBag size={48} className="text-muted" />
            <h3>No orders yet</h3>
            <p>
              You haven't placed any orders. Start shopping to see them here!
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/products")}
            >
              Browse Products
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card glass">
              <div className="order-card-header">
                <div className="order-main-info">
                  <div className="order-id-block">
                    <span className="label">Order ID</span>
                    <span className="value">#{order._id.slice(-8)}</span>
                  </div>
                  <div className="order-date-block">
                    <Calendar size={16} />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="order-status-block">
                  <span
                    className={`status-badge ${order.status?.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
                      <strong>{item.name}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-payment-info">
                  <CreditCard size={16} />
                  <span>
                    {order.paymentMethod === "razorpay"
                      ? "Paid via Razorpay"
                      : "Cash on Delivery"}
                  </span>
                </div>
                <div className="order-total-block">
                  <span className="label">Total Amount</span>
                  <span className="total-value">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <button
                  className="btn btn-outline track-btn"
                  onClick={() => navigate("/track")}
                >
                  Track Order <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
