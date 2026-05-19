import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './HeroBanner.css';

const OFFERS = [
  {
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80',
    title: 'NO HANDLING FEES',
    subtitle: 'FREE SHIPPING ON ORDERS OVER $99.00*',
    cta: 'SHOP COLLECTION'
  },
  {
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=2000&q=80',
    title: 'NEW SEASON ARRIVALS',
    subtitle: 'EXPLORE THE LATEST PREMIUM INTERIOR & ESSENTIALS',
    cta: 'DISCOVER NOW'
  },
  {
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80',
    title: 'LIMITED TIME OFFERS',
    subtitle: 'ENJOY UP TO 40% OFF SELECT ESSENTIALS',
    cta: 'VIEW DEALS'
  }
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % OFFERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent(prev => (prev + 1) % OFFERS.length);
  };

  const prevSlide = () => {
    setCurrent(prev => (prev - 1 + OFFERS.length) % OFFERS.length);
  };

  return (
    <section className="hero-banner-slider" id="hero-section">
      <div className="slider-wrapper" style={{ transform: `translateX(-${current * 100}%)` }}>
        {OFFERS.map((offer, idx) => (
          <div 
            key={idx} 
            className="slide-item" 
            style={{ backgroundImage: `url(${offer.image})` }}
          >
            <div className="slide-overlay">
              <div className="slide-content container">
                <span className="slide-tag">{offer.title}</span>
                <h1 className="slide-title">{offer.subtitle}</h1>
                <button className="slide-cta">{offer.cta} →</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button className="slider-arrow prev" onClick={prevSlide} aria-label="Previous slide">
        <ChevronLeft size={24} />
      </button>
      <button className="slider-arrow next" onClick={nextSlide} aria-label="Next slide">
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="slider-dots">
        {OFFERS.map((_, idx) => (
          <button 
            key={idx} 
            className={`slider-dot ${idx === current ? 'active' : ''}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
