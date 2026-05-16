import { Link } from "react-router-dom";
import { Target, Users, ShieldCheck, Heart } from "lucide-react";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      {}
      <section className="about-hero">
        <div className="container">
          <h1>About Sovely</h1>
          <p>Redefining B2C Ecommerce with Trust, Speed, and Quality.</p>
        </div>
      </section>

      {}
      <section className="about-story section container">
        <div className="story-content">
          <h2>Our Story</h2>
          <p>
            Founded in 2026, Sovely started with a simple idea: shopping online
            should be an effortless and delightful experience. We grew tired of
            cluttered interfaces, hidden fees, and unreliable delivery times.
          </p>
          <p>
            Today, Sovely connects thousands of customers with premium brands
            and everyday essentials, offering a seamless platform where quality
            meets convenience. We believe in transparency and putting our
            customers first.
          </p>
        </div>
        <div className="story-image">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
            alt="Our Team"
          />
        </div>
      </section>

      {}
      <section className="about-values section bg-gray">
        <div className="container">
          <h2 className="text-center" style={{ marginBottom: "40px" }}>
            Our Core Values
          </h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <Heart size={32} />
              </div>
              <h3>Customer First</h3>
              <p>
                Everything we build is designed to make your life easier and
                your shopping better.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <ShieldCheck size={32} />
              </div>
              <h3>Trust & Transparency</h3>
              <p>
                No hidden fees. Authentic products. What you see is exactly what
                you get.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <Target size={32} />
              </div>
              <h3>Quality Driven</h3>
              <p>
                We rigorously vet our sellers to ensure you only receive the
                highest quality items.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <Users size={32} />
              </div>
              <h3>Community</h3>
              <p>
                We support local businesses and sustainable practices to build a
                better future.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
