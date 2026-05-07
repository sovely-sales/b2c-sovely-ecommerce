import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import './Track.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8014';

export default function Track() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API}/api/orders/track/${orderId.trim()}`);
      const data = await res.json();
      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.message || 'Order not found');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    return steps.indexOf(status) + 1 || 1;
  };

  const statusMap = {
    'Pending': { icon: <Clock />, label: 'Order Placed' },
    'Processing': { icon: <Package />, label: 'Processing' },
    'Shipped': { icon: <Truck />, label: 'On the Way' },
    'Delivered': { icon: <CheckCircle />, label: 'Delivered' }
  };

  return (
    <div className="track-page container section">
      <div className="track-header animate-fadeUp">
        <h1>Track Your Order</h1>
        <p>Enter your order ID to get real-time delivery updates</p>
      </div>

      <div className="track-search-container animate-fadeUp" style={{ animationDelay: '0.1s' }}>
        <form onSubmit={handleTrack} className="track-form glass">
          <div className="search-input-wrap">
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Enter Order ID (e.g. 663a...)" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Track Now'}
          </button>
        </form>
        {error && <p className="track-error animate-shake">{error}</p>}
      </div>

      {order && (
        <div className="track-results animate-scaleIn">
          <div className="track-card glass">
            <div className="order-summary-header">
              <div className="info-item">
                <span className="label">ORDER ID</span>
                <span className="value">#{order._id}</span>
              </div>
              <div className="info-item">
                <span className="label">EXPECTED DELIVERY</span>
                <span className="value">By {new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="track-stepper">
              {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, index) => {
                const currentStep = getStatusStep(order.status);
                const isCompleted = index + 1 < currentStep;
                const isActive = index + 1 === currentStep;
                
                return (
                  <div key={step} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-circle">
                      {isCompleted ? <CheckCircle size={20} /> : index + 1}
                    </div>
                    <span className="step-label">{statusMap[step]?.label || step}</span>
                    {index < 3 && <div className="step-line"></div>}
                  </div>
                );
              })}
            </div>

            <div className="order-details-mini">
              <h3>Order Details</h3>
              <div className="mini-items">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="mini-item">
                    <span>{item.name} × {item.quantity}</span>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
              <div className="mini-total">
                <span>Total Paid</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            <div className="track-footer">
              <p><ShieldCheck size={16} /> Your order is protected by <strong>Sovely Shield</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
