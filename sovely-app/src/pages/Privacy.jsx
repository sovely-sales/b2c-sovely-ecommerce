import React from "react";
import { Eye, Shield, Database, Lock, EyeOff } from "lucide-react";
import "./Privacy.css";

export default function Privacy() {
  return (
    <div className="privacy-page container section animate-fadeUp">
      <div className="privacy-header text-center">
        <Shield size={48} className="header-icon" />
        <h1>Privacy Policy</h1>
        <p className="subtitle">Last updated: June 1, 2026</p>
      </div>

      <div className="privacy-content">
        <div className="intro-card glass">
          <Eye size={24} className="card-icon" />
          <h3>1. Our Privacy Commitment</h3>
          <p>
            At Sovely, we value your trust and are committed to protecting your personal data. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit or shop on our platform.
          </p>
        </div>

        <div className="privacy-grid">
          <div className="privacy-card glass">
            <Database size={24} className="card-icon" />
            <h3>2. Information We Collect</h3>
            <p>
              We collect information you provide directly to us, such as your name, email address, phone number, shipping address, and payment information. We also automatically collect browser types, IP addresses, and device identifiers.
            </p>
          </div>

          <div className="privacy-card glass">
            <Lock size={24} className="card-icon" />
            <h3>3. How We Secure Your Data</h3>
            <p>
              We implement industry-standard encryption protocols (like SSL/TLS) and secure database access systems to guard your personal credentials and financial info. We do not store full credit card/UPI details on our own servers.
            </p>
          </div>

          <div className="privacy-card glass">
            <EyeOff size={24} className="card-icon" />
            <h3>4. Sharing of Information</h3>
            <p>
              We do not sell your personal data. We share details only with trusted service partners (shipping carriers, Razorpay payment gateway) as necessary to process, pack, ship, and complete your orders.
            </p>
          </div>

          <div className="privacy-card glass">
            <Shield size={24} className="card-icon" />
            <h3>5. Your Choices & Rights</h3>
            <p>
              You have the right to request access to the personal data we hold about you, request corrections, or ask for account deletion. You can update your marketing preferences and opt-out of newsletter notifications at any time.
            </p>
          </div>
        </div>

        <div className="outro-card glass text-center">
          <h3>Data Protection Officer</h3>
          <p>Have questions or concerns about your data? Reach out directly to our privacy compliance officer.</p>
          <a href="/contact" className="btn btn-primary">Contact Privacy Team</a>
        </div>
      </div>
    </div>
  );
}
