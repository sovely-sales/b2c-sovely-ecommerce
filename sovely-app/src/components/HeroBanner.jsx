import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from 'lucide-react';
import './HeroBanner.css';

const TRUST_BADGES = [
  { icon: Truck,       label: 'Free Delivery',    sub: 'Above ₹499' },
  { icon: Shield,      label: 'Secure Payment',   sub: '100% Protected' },
  { icon: RotateCcw,   label: 'Easy Returns',     sub: '30-day policy' },
  { icon: Headphones,  label: '24/7 Support',     sub: 'Always there' },
];

export default function HeroBanner() {
  return (
    <section className="hero" id="hero-section">
      {/* Main Hero */}
      <div className="hero-main">
        {/* Left content */}
        <div className="hero-content animate-fadeUp">
          <div className="badge badge-green hero-badge">
            <span>✨</span> New Arrivals Every Day
          </div>
          <h1 className="hero-title">
            Shop Everything
            <br />
            <span className="hero-title-accent">You Love</span>
            <br />
            All in One Place
          </h1>
          <p className="hero-desc">
            Discover millions of products across groceries, electronics, fashion, beauty & more — delivered fast to your doorstep.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary hero-cta" id="hero-shop-now-btn">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/deals" className="btn hero-outline-btn" id="hero-deals-btn">
              🔥 Today's Deals
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>2M+</strong>
              <span>Customers</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>50K+</strong>
              <span>Products</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>500+</strong>
              <span>Cities</span>
            </div>
          </div>
        </div>

        {/* Right visual */}
        <div className="hero-visual">
          <div className="hero-card hero-card-main animate-float">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=500&fit=crop"
              alt="Shopping lifestyle"
              className="hero-img"
            />
            <div className="hero-card-badge">
              <span>⚡</span> Delivering now in 2hrs
            </div>
          </div>
          {/* Floating mini cards */}
          <div className="hero-float-card hero-float-card--1">
            <span className="float-emoji">🎉</span>
            <div>
              <p className="float-label">Flash Sale</p>
              <p className="float-value">Up to 70% Off</p>
            </div>
          </div>
          <div className="hero-float-card hero-float-card--2">
            <span className="float-emoji">⭐</span>
            <div>
              <p className="float-label">Top Rated</p>
              <p className="float-value">4.8 / 5 Stars</p>
            </div>
          </div>
          <div className="hero-float-card hero-float-card--3">
            <span className="float-emoji">📦</span>
            <div>
              <p className="float-label">Free Delivery</p>
              <p className="float-value">On ₹499+</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="hero-trust">
        <div className="container hero-trust-inner">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div className="trust-item" key={label}>
              <div className="trust-icon">
                <Icon size={22} />
              </div>
              <div>
                <p className="trust-label">{label}</p>
                <p className="trust-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
