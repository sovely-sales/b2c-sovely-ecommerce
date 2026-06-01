import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Truck, ArrowRight } from 'lucide-react';
import './QuickTrack.css';

export default function QuickTrack() {
  const [orderId, setOrderId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    let cleanId = orderId.trim();
    if (cleanId.startsWith('#')) {
      cleanId = cleanId.substring(1).trim();
    }
    if (cleanId) {
      navigate(`/track?orderId=${encodeURIComponent(cleanId)}`);
    }
  };

  return (
    <section className="quick-track-section">
      <div className="container">
        <div className="quick-track-card glass">
          <div className="quick-track-info">
            <div className="icon-badge">
              <Truck size={24} />
            </div>
            <div className="text-content">
              <h2>Track Your Order</h2>
              <p>Enter your unique Order ID to track your shipment in real-time.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="quick-track-form">
            <div className="quick-track-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Enter Order ID (e.g. 6653a...)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary track-btn">
              <span>Track Status</span>
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
