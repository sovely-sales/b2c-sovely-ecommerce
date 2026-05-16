import { Link } from "react-router-dom";
import { ArrowRight, Tag, Clock } from "lucide-react";
import "./PromoBanner.css";

export default function PromoBanner() {
  return (
    <section className="promo-section" id="promo-section">
      <div className="container promo-grid">
        {}
        <div className="promo-card promo-card--main" id="promo-main-card">
          <div className="promo-content">
            <span className="promo-tag">
              <Tag size={12} /> Limited Offer
            </span>
            <h2 className="promo-title">
              Mega Sale
              <br />
              <span className="promo-highlight">Up to 70% Off</span>
            </h2>
            <p className="promo-desc">
              On top electronics, fashion & home décor. Don't miss out!
            </p>
            <div className="promo-countdown">
              <Clock size={14} />
              <span>Ends in:</span>
              <div className="countdown-blocks">
                <div className="countdown-block">
                  <span>08</span>
                  <small>Hrs</small>
                </div>
                <div className="countdown-sep">:</div>
                <div className="countdown-block">
                  <span>45</span>
                  <small>Min</small>
                </div>
                <div className="countdown-sep">:</div>
                <div className="countdown-block">
                  <span>20</span>
                  <small>Sec</small>
                </div>
              </div>
            </div>
            <Link
              to="/deals"
              className="btn btn-white promo-cta"
              id="promo-main-cta-btn"
            >
              Shop Sale <ArrowRight size={16} />
            </Link>
          </div>
          <div className="promo-visual">
            <img
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop"
              alt="Sale products"
            />
          </div>
        </div>

        {}
        <div className="promo-right">
          {}
          <div
            className="promo-card promo-card--grocery"
            id="promo-grocery-card"
          >
            <div className="promo-content">
              <span
                className="promo-tag"
                style={{ background: "rgba(34,197,94,0.2)", color: "#15803d" }}
              >
                🥦 Fresh Daily
              </span>
              <h3 className="promo-mini-title">Fresh Groceries</h3>
              <p className="promo-mini-desc">Farm-to-door in 2 hours</p>
              <Link
                to="/products?category=grocery"
                className="promo-mini-link"
                id="promo-grocery-btn"
              >
                Order Now <ArrowRight size={14} />
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop"
              alt="Groceries"
              className="promo-mini-img"
            />
          </div>

          {}
          <div
            className="promo-card promo-card--fashion"
            id="promo-fashion-card"
          >
            <div className="promo-content">
              <span
                className="promo-tag"
                style={{
                  background: "rgba(236,72,153,0.15)",
                  color: "#be185d",
                }}
              >
                👗 New Season
              </span>
              <h3 className="promo-mini-title">Fashion Trends</h3>
              <p className="promo-mini-desc">Latest styles, best prices</p>
              <Link
                to="/products?category=fashion"
                className="promo-mini-link"
                id="promo-fashion-btn"
              >
                Explore <ArrowRight size={14} />
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop"
              alt="Fashion"
              className="promo-mini-img"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
