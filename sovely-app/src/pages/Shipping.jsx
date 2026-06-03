import React from "react";
import { Truck, Clock, MapPin, ShieldAlert, BadgePercent } from "lucide-react";
import "./Shipping.css";

export default function Shipping() {
  return (
    <div className="shipping-page container section animate-fadeUp">
      <div className="shipping-header text-center">
        <Truck size={48} className="header-icon" />
        <h1>Shipping & Delivery</h1>
        <p className="subtitle">Fast, reliable, and secure shipping across India</p>
      </div>

      <div className="shipping-content">
        <div className="intro-card glass">
          <BadgePercent size={24} className="card-icon" />
          <h3>1. Delivery Charges</h3>
          <p>
            We offer **FREE shipping** on all orders above **₹999**. For orders under ₹999, a flat shipping charge of **₹50** is applied at checkout. There are no hidden handling fees.
          </p>
        </div>

        <div className="shipping-grid">
          <div className="shipping-card glass">
            <Clock size={24} className="card-icon" />
            <h3>2. Timeline & Days</h3>
            <p>
              Standard orders are delivered within **3 to 5 business days** depending on the location. Metros and large cities typically receive packages within 2 days, while rural and remote areas may take up to 7 days.
            </p>
          </div>

          <div className="shipping-card glass">
            <MapPin size={24} className="card-icon" />
            <h3>3. Coverage Areas</h3>
            <p>
              We deliver to over **20,000 pincodes** across all states and union territories in India. We partner with top-tier courier networks (Delhivery, BlueDart, Xpressbees) to ensure safe and trackable shipments.
            </p>
          </div>

          <div className="shipping-card glass">
            <ShieldAlert size={24} className="card-icon" />
            <h3>4. Shipment Tracking</h3>
            <p>
              Once your package leaves our warehouse, a unique Order ID and courier tracking link is sent via email and SMS. You can also paste your Order ID directly in our homepage tracking bar for real-time delivery status updates.
            </p>
          </div>

          <div className="shipping-card glass">
            <Truck size={24} className="card-icon" />
            <h3>5. Secure Online Payments</h3>
            <p>
              To ensure safety and speed up delivery times, we support prepaid online transactions only (via Razorpay, supporting UPI, credit/debit cards, and net banking). Cash on Delivery (COD) is not accepted.
            </p>
          </div>
        </div>

        <div className="outro-card glass text-center">
          <h3>Need to change your shipping address?</h3>
          <p>Address changes are supported before dispatch. Please contact support as soon as possible.</p>
          <a href="/contact" className="btn btn-primary">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
