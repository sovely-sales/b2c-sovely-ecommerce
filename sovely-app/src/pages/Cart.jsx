import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  X
} from "lucide-react";
import { useData } from "../context/DataContext";
import "./Cart.css";

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartSubtotal,
    cartDelivery,
    cartTotal,
    coupon,
    setCoupon,
    setCouponPercent,
    couponDiscount,
    availableCoupons,
  } = useData();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const formatPrice = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    setCouponError("");
    
    const matchedCoupon = availableCoupons.find(c => c.code === couponInput.toUpperCase());
    
    if (!matchedCoupon) {
      setCouponError("Invalid coupon code");
      return;
    }
    if (!matchedCoupon.isActive) {
      setCouponError("Coupon is inactive");
      return;
    }
    if (matchedCoupon.expirationDate && new Date() > new Date(matchedCoupon.expirationDate)) {
      setCouponError("Coupon has expired");
      return;
    }
    if (matchedCoupon.usageLimit && matchedCoupon.timesUsed >= matchedCoupon.usageLimit) {
      setCouponError("Coupon usage limit reached");
      return;
    }

    setCoupon(matchedCoupon.code);
    setCouponPercent(matchedCoupon.discountPercent);
    setCouponError("");
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponPercent(0);
    setCouponInput("");
    setCouponError("");
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state container section animate-fadeUp">
        <div className="empty-card glass">
          <div className="empty-icon-wrapper">
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>
            Looks like you haven't added anything to your cart yet. Discover our
            latest deals and start shopping!
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/products")}
          >
            Explore Products <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page container section">
      <div className="cart-header animate-fadeUp">
        <h1>Shopping Cart</h1>
        <p>You have {cartItems.length} items in your cart</p>
      </div>

      <div className="cart-grid">
        <div
          className="cart-items-section animate-fadeUp"
          style={{ animationDelay: "0.1s" }}
        >
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-card glass">
              <div className="cart-item-img">
                <img src={item.image} alt={item.name} />
              </div>

              <div className="cart-item-details">
                <div className="item-header">
                  <Link to={`/product/${item.id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    title="Remove Item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <p className="item-price-unit">
                  {formatPrice(item.price)} per unit
                </p>

                <div className="item-actions">
                  <div className="qty-picker">
                    {/* Decrease quantity */}
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>

                    {/* Increase quantity */}
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="item-total-price">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside
          className="cart-summary-section animate-fadeUp"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="summary-card glass">
            <h3>Order Summary</h3>

            {/* Coupon Section */}
            <div className="coupon-section">
              {coupon ? (
                <div className="applied-coupon">
                  <div className="coupon-success">
                    <Tag size={16} />
                    <span>Coupon <strong>{coupon}</strong> applied!</span>
                  </div>
                  <button onClick={handleRemoveCoupon} className="remove-coupon-btn">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="coupon-action-group" style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    className="coupon-input-standalone"
                    placeholder="Enter coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    style={{ flex: 1, padding: "12px 16px", border: "2px solid var(--border-color)", borderRadius: "8px", background: "transparent", color: "var(--text-main)", outline: "none", fontWeight: "700" }}
                  />
                  <button 
                    onClick={handleApplyCoupon} 
                    className="btn btn-primary"
                    disabled={couponLoading || !couponInput.trim()}
                    style={{ padding: "0 24px", whiteSpace: "nowrap" }}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <p className="coupon-error">{couponError}</p>}
            </div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className={cartDelivery === 0 ? "free-text" : ""}>
                  {cartDelivery === 0 ? "FREE" : formatPrice(cartDelivery)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div className="summary-row promo-row">
                  <span>Coupon Discount</span>
                  <span className="discount-text">- {formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <button
              className="btn btn-primary checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div className="cart-trust-badges">
              <div className="trust-item">
                <Truck size={16} />
                <span>Fast & Safe Delivery</span>
              </div>
              <div className="trust-item">
                <ShieldCheck size={16} />
                <span>Secure Payments</span>
              </div>
            </div>
          </div>

          <div className="continue-shopping">
            <Link to="/products">← Continue Shopping</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
