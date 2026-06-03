import { Truck, Shield, RotateCcw, Headphones } from "lucide-react";
import "./TrustBar.css";

const BADGES = [
  {
    icon: <Truck size={22} />,
    title: "Free Shipping",
    desc: "On orders above ₹999",
  },
  {
    icon: <RotateCcw size={22} />,
    title: "Easy Returns",
    desc: "7-day return policy",
  },
  {
    icon: <Shield size={22} />,
    title: "Secure Payment",
    desc: "100% secure checkout",
  },
  {
    icon: <Headphones size={22} />,
    title: "24/7 Support",
    desc: "Dedicated help center",
  },
];

export default function TrustBar() {
  return (
    <section className="trust-bar-section">
      <div className="container">
        <div className="trust-bar-grid">
          {BADGES.map((b, i) => (
            <div className="trust-badge" key={i}>
              <div className="trust-icon">{b.icon}</div>
              <div>
                <h4>{b.title}</h4>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
