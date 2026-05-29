import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import "./CartSidebar.css";

export default function CartSidebar() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartDelivery,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useData();

  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      {}
      <div
        className={`cart-backdrop ${isCartOpen ? "open" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      {}
      <aside className={`cart-sidebar ${isCartOpen ? "open" : ""}`}>
        {}
        <div className="cart-sidebar-header">
          <h2>Your cart ({itemCount})</h2>
          <button
            className="cart-close-btn"
            onClick={() => setIsCartOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {}
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={48} strokeWidth={1} />
            <h3>Your cart is empty</h3>
            <p>Browse our products and add items to get started.</p>
            <button
              className="cart-shop-btn"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-sidebar-item">
                  <div className="cart-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="cart-item-controls">
                      <div className="cart-qty-control">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="cart-item-price">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {}
            <div className="cart-sidebar-footer">
              <div className="cart-totals">
                <div className="cart-total-row">
                  <span>Estimated total</span>
                  <strong>₹{cartTotal.toLocaleString("en-IN")}</strong>
                </div>
                <p className="cart-tax-note">
                  Taxes and shipping calculated at checkout
                </p>
              </div>

              <Link
                to="/checkout"
                className="cart-checkout-btn"
                onClick={() => setIsCartOpen(false)}
              >
                Place Order <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
