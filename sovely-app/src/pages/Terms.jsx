import React from "react";
import {
  ShieldAlert,
  BookOpen,
  UserCheck,
  CreditCard,
  Scale,
} from "lucide-react";
import "./Terms.css";

export default function Terms() {
  return (
    <div className="terms-page container section animate-fadeUp">
      <div className="terms-header text-center">
        <Scale size={48} className="header-icon" />
        <h1>Terms of Service</h1>
        <p className="subtitle">Last updated: June 1, 2026</p>
      </div>

      <div className="terms-content">
        <div className="intro-card glass">
          <BookOpen size={24} className="card-icon" />
          <h3>1. Welcome to Sovely</h3>
          <p>
            Welcome to Sovely. By accessing or using our website, services, and
            mobile applications, you agree to comply with and be bound by these
            Terms of Service. Please read them carefully. If you do not agree to
            these terms, you should not access or use our services.
          </p>
        </div>

        <div className="terms-grid">
          <div className="terms-card glass">
            <UserCheck size={24} className="card-icon" />
            <h3>2. User Accounts</h3>
            <p>
              To access certain features of the platform, you must register for
              an account. You are responsible for maintaining the
              confidentiality of your credentials and for all activities that
              occur under your account. You agree to provide accurate and
              complete registration details.
            </p>
          </div>

          <div className="terms-card glass">
            <CreditCard size={24} className="card-icon" />
            <h3>3. Purchases and Payments</h3>
            <p>
              All purchases made through Sovely are subject to product
              availability. We reserve the right to refuse or cancel any order.
              Payments are processed securely via third-party gateways (e.g.,
              Razorpay). Prices are listed in INR and are subject to change.
            </p>
          </div>

          <div className="terms-card glass">
            <ShieldAlert size={24} className="card-icon" />
            <h3>4. Prohibited Activities</h3>
            <p>
              You agree not to engage in any activity that violates local laws,
              infringes on intellectual property rights, disrupts server
              performance, extracts bulk platform data (scraping), or transmits
              malicious code/software.
            </p>
          </div>

          <div className="terms-card glass">
            <Scale size={24} className="card-icon" />
            <h3>5. Limitation of Liability</h3>
            <p>
              Sovely Technologies Pvt. Ltd. and its affiliates will not be
              liable for any direct, indirect, incidental, or consequential
              damages resulting from your use or inability to use the services,
              products purchased, or platform downtime.
            </p>
          </div>
        </div>

        <div className="outro-card glass text-center">
          <h3>Questions about our Terms?</h3>
          <p>
            If you have any questions regarding these Terms of Service, please
            contact our legal team.
          </p>
          <a href="/contact" className="btn btn-primary">
            Contact Legal Support
          </a>
        </div>
      </div>
    </div>
  );
}
