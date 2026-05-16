import { Link } from "react-router-dom";
import {
  Globe,
  Share2,
  Rss,
  MessageCircle,
  Send,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import sovelLogo from "../assets/sovely-logo.png";
import "./Footer.css";

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products", path: "/products" },
    { label: "Grocery", path: "/products?category=grocery" },
    { label: "Electronics", path: "/products?category=electronics" },
    { label: "Fashion", path: "/products?category=fashion" },
    { label: "Today's Deals", path: "/deals" },
  ],
  Help: [
    { label: "Track Order", path: "/track" },
    { label: "Returns & Refunds", path: "/returns" },
    { label: "Shipping Info", path: "/shipping" },
    { label: "FAQs", path: "/faq" },
    { label: "Contact Us", path: "/contact" },
  ],
  Company: [
    { label: "About Sovely", path: "/about" },
    { label: "Sell on Sovely", path: "/seller" },
    { label: "Careers", path: "/careers" },
    { label: "Press", path: "/press" },
    { label: "Privacy Policy", path: "/privacy" },
  ],
};

const SOCIALS = [
  { icon: Globe, href: "#", label: "Website" },
  { icon: Share2, href: "#", label: "Share" },
  { icon: MessageCircle, href: "#", label: "Chat" },
  { icon: Rss, href: "#", label: "Blog" },
  { icon: Send, href: "#", label: "Telegram" },
];

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      {}
      <div className="container footer-main">
        {}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src={sovelLogo} alt="Sovely" />
          </Link>
          <p className="footer-tagline">
            Sovely – All-in-One Shopping. Your daily needs, premium products,
            and everything in between — delivered fast.
          </p>
          <div className="footer-contact">
            <div className="footer-contact-item">
              <Phone size={14} />
              <span>1800-123-SOVELY</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={14} />
              <span>support@sovely.in</span>
            </div>
            <div className="footer-contact-item">
              <MapPin size={14} />
              <span>Bengaluru, Karnataka, India</span>
            </div>
          </div>
          {}
          <div className="footer-socials">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                className="social-btn"
                aria-label={label}
                id={`social-${label.toLowerCase()}`}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {}
        {Object.entries(FOOTER_LINKS).map(([section, links]) => (
          <div className="footer-col" key={section}>
            <h4 className="footer-col-title">{section}</h4>
            <ul className="footer-link-list">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="footer-link"
                    id={`footer-link-${link.label.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <ArrowRight size={12} />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {}
        <div className="footer-col footer-app">
          <h4 className="footer-col-title">Get the App</h4>
          <p className="footer-app-desc">Shop faster with the Sovely app</p>
          <a href="#" className="app-store-btn" id="footer-appstore-btn">
            <span className="app-icon">🍎</span>
            <div>
              <small>Download on</small>
              <p>App Store</p>
            </div>
          </a>
          <a href="#" className="app-store-btn" id="footer-playstore-btn">
            <span className="app-icon">▶</span>
            <div>
              <small>Get it on</small>
              <p>Google Play</p>
            </div>
          </a>
        </div>
      </div>

      {}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p className="footer-copy">
            © {new Date().getFullYear()} Sovely Technologies Pvt. Ltd. All
            rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
          <div className="footer-payments">
            {["Visa", "Mastercard", "UPI", "Razorpay"].map((p) => (
              <span key={p} className="payment-chip">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
