import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS, STATS } from '../data/appData';
import './Testimonials.css';

export default function Testimonials() {
  return (
    <section className="section testimonials-section" id="testimonials-section">
      <div className="container">

        {/* Stats bar */}
        <div className="stats-bar">
          {STATS.map(stat => (
            <div className="stat-item" key={stat.label}>
              <strong className="stat-value">{stat.value}</strong>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="testimonials-header">
          <p className="section-label">What our customers say</p>
          <h2 className="section-title">Loved by Millions</h2>
          <p className="section-subtitle">Real reviews from real customers across India</p>
        </div>

        {/* Cards */}
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div className="testimonial-card" key={t.id} style={{ animationDelay: `${idx * 0.12}s` }}>
              <Quote size={28} className="testimonial-quote-icon" />
              <p className="testimonial-text">{t.text}</p>
              <div className="testimonial-stars">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < t.rating ? '#eab308' : 'none'}
                    stroke={i < t.rating ? '#eab308' : '#d1d5db'}
                  />
                ))}
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <p className="author-name">{t.name}</p>
                  <p className="author-city">📍 {t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
