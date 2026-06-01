import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./HeroBanner.css";

const OFFERS = [
  {
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=80",
    title: "SUPER SAVER DEALS",
    subtitle: "FREE SHIPPING ON ORDERS OVER ₹499*",
    cta: "SHOP NOW",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=2000&q=80",
    title: "PREMIUM ACTIVEWEAR & GEAR",
    subtitle: "UP TO 30% OFF ON SPORTS & FITNESS ESSENTIALS",
    cta: "EXPLORE NOW",
  },
  {
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=2000&q=80",
    title: "TRENDING TECH & GADGETS",
    subtitle: "UP TO 50% OFF ON SMARTPHONES & ACCESSORIES",
    cta: "DISCOVER NOW",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % OFFERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % OFFERS.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + OFFERS.length) % OFFERS.length);
  };

  const handleCtaClick = () => {
    const productsSection = document.getElementById("all-products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="hero-banner-slider" id="hero-section">
      <div
        className="slider-wrapper"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {OFFERS.map((offer, idx) => (
          <div
            key={idx}
            className="slide-item"
            style={{ backgroundImage: `url(${offer.image})` }}
          >
            <div className="slide-overlay">
              <div className="container">
                <div className="slide-content-box">
                  <span className="slide-tag">{offer.title}</span>
                  <h1 className="slide-title">{offer.subtitle}</h1>
                  <button className="slide-cta" onClick={handleCtaClick}>
                    {offer.cta} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className="slider-arrow prev"
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="slider-arrow next"
        onClick={nextSlide}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className="slider-dots">
        {OFFERS.map((_, idx) => (
          <button
            key={idx}
            className={`slider-dot ${idx === current ? "active" : ""}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
