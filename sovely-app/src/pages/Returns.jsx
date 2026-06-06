import React from "react";
import {
  RotateCcw,
  AlertTriangle,
  Calendar,
  CreditCard,
  ClipboardCheck,
} from "lucide-react";
import "./Returns.css";

export default function Returns() {
  return (
    <div className="returns-page container section animate-fadeUp">
      <div className="returns-header text-center">
        <RotateCcw size={48} className="header-icon" />
        <h1>Returns & Refunds</h1>
        <p className="subtitle">Easy returns and quick settlements</p>
      </div>

      <div className="returns-content">
        <div className="intro-card glass">
          <ClipboardCheck size={24} className="card-icon" />
          <h3>1. Return Eligibility</h3>
          <p>
            We offer a **7-day return policy** on most items. To be eligible for
            a return, the product must be unused, in its original packaging, and
            accompanied by the invoice. Certain categories (like groceries and
            personal hygiene goods) are non-returnable.
          </p>
        </div>

        <div className="returns-grid">
          <div className="returns-card glass">
            <Calendar size={24} className="card-icon" />
            <h3>2. Return Timeline</h3>
            <p>
              Return requests must be initiated via the "My Orders" tab within 7
              days of delivery. Once approved, our courier will pick up the
              package within 48-72 hours.
            </p>
          </div>

          <div className="returns-card glass">
            <CreditCard size={24} className="card-icon" />
            <h3>3. Refund Process</h3>
            <p>
              After receiving and inspecting your return, we will process your
              refund. For online payments (Razorpay), refunds are settled to the
              original payment source within 5-7 business days. For COD orders,
              we issue bank transfers or wallet credits.
            </p>
          </div>

          <div className="returns-card glass">
            <AlertTriangle size={24} className="card-icon" />
            <h3>4. Damaged or Wrong Items</h3>
            <p>
              If you receive a damaged, expired, or incorrect product, please
              report it to our customer support within 24 hours of delivery. We
              will arrange a free replacement or instant refund.
            </p>
          </div>

          <div className="returns-card glass">
            <RotateCcw size={24} className="card-icon" />
            <h3>5. Cancellation Policy</h3>
            <p>
              You can cancel your order at any time before it has been shipped.
              Go to the "Track Order" or "My Orders" page and click cancel.
              Shipped orders cannot be cancelled and must be returned
              post-delivery.
            </p>
          </div>
        </div>

        <div className="outro-card glass text-center">
          <h3>Need help with a Return?</h3>
          <p>
            Contact our support team to register a dispute or track your refund
            status.
          </p>
          <a href="/contact" className="btn btn-primary">
            Open Return Request
          </a>
        </div>
      </div>
    </div>
  );
}
