import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useData } from '../context/DataContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, updateCartQty, cartSubtotal, cartDelivery, cartTotal } = useData();
  const navigate = useNavigate();

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty-state container section animate-fadeUp">
        <div className="empty-card glass">
          <div className="empty-icon-wrapper">
            <ShoppingBag size={48} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet. Discover our latest deals and start shopping!</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
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
        <div className="cart-items-section animate-fadeUp" style={{ animationDelay: '0.1s' }}>
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-card glass">
              <div className="cart-item-img">
                <img src={item.image} alt={item.name} />
              </div>
              
              <div className="cart-item-details">
                <div className="item-header">
                  <Link to={`/product/${item.id}`}><h3>{item.name}</h3></Link>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remove Item">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <p className="item-price-unit">{formatPrice(item.price)} per unit</p>
                
                <div className="item-actions">
                  <div className="qty-picker">
                    <button onClick={() => updateCartQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.id, item.quantity + 1)}>
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

        <aside className="cart-summary-section animate-fadeUp" style={{ animationDelay: '0.2s' }}>
          <div className="summary-card glass">
            <h3>Order Summary</h3>
            
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className={cartDelivery === 0 ? 'free-text' : ''}>
                  {cartDelivery === 0 ? 'FREE' : formatPrice(cartDelivery)}
                </span>
              </div>
              <div className="summary-row promo-row">
                <span>Platform Discount</span>
                <span className="discount-text">- {formatPrice(0)}</span>
              </div>
              <div className="divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
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
