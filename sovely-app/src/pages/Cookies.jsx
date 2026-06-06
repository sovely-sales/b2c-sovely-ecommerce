import React from "react";
import { Info, ShieldCheck, Settings, Eye, HelpCircle } from "lucide-react";
import "./Cookies.css";

export default function Cookies() {
  return (
    <div className="cookies-page container section animate-fadeUp">
      <div className="cookies-header text-center">
        <Info size={48} className="header-icon" />
        <h1>Cookie Policy</h1>
        <p className="subtitle">Last updated: June 1, 2026</p>
      </div>

      <div className="cookies-content">
        <div className="intro-card glass">
          <Eye size={24} className="card-icon" />
          <h3>1. What Are Cookies?</h3>
          <p>
            Cookies are small text files stored on your computer or mobile
            device when you browse websites. We use cookies to enable shopping
            cart functionality, remember your category preferences, support user
            logins, and track site metrics.
          </p>
        </div>

        <div className="cookies-grid">
          <div className="cookies-card glass">
            <ShieldCheck size={24} className="card-icon" />
            <h3>2. Essential Cookies</h3>
            <p>
              These cookies are required for core website operations. They
              enable cart storage, secure login state, checkout security tokens,
              and routing integrity. Disabling these cookies will break the main
              shopping experience.
            </p>
          </div>

          <div className="cookies-card glass">
            <Settings size={24} className="card-icon" />
            <h3>3. Functional Cookies</h3>
            <p>
              These are used to recognize you when you return to our website.
              This enables us to personalize our content for you, such as
              greeting you by name, remembering your theme choice (light/dark
              mode), and saving your addresses.
            </p>
          </div>

          <div className="cookies-card glass">
            <Eye size={24} className="card-icon" />
            <h3>4. Analytics & Performance</h3>
            <p>
              We use analytics cookies to count site visitors and observe user
              click paths. This anonymous statistics gatherer allows us to
              optimize load performance and refine page layouts to deliver a
              faster shopping experience.
            </p>
          </div>

          <div className="cookies-card glass">
            <HelpCircle size={24} className="card-icon" />
            <h3>5. Managing Your Cookies</h3>
            <p>
              You can control or disable cookies via your browser preference
              settings. Please note that turning off all cookies will prevent
              you from placing orders or maintaining a persistent cart on
              Sovely.
            </p>
          </div>
        </div>

        <div className="outro-card glass text-center">
          <h3>Manage Preferences</h3>
          <p>
            You can adjust your browser cookie security settings or contact our
            support team for help.
          </p>
          <a href="/contact" className="btn btn-primary">
            Help & Support
          </a>
        </div>
      </div>
    </div>
  );
}
