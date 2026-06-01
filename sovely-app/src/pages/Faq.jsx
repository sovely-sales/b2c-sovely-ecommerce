import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import "./Faq.css";

const FAQS_DATA = [
  {
    q: "How do I track my order?",
    a: "You can track your order using the 'Track' option in the navbar or homepage. Simply enter your Order ID (with or without the leading '#' symbol) to view real-time delivery status updates and stages."
  },
  {
    q: "What payment options do you support?",
    a: "We support a wide range of secure prepaid online payment options via Razorpay, including major Credit/Debit Cards, Netbanking, and UPI (GPay, PhonePe, Paytm, etc.). We do not support Cash on Delivery (COD)."
  },
  {
    q: "How can I download my invoice?",
    a: "You can download your itemized Tax Invoice directly on the Order Success screen after completing checkout, or at any time by searching your Order ID on the Track Order page and clicking 'Download Invoice'."
  },
  {
    q: "What is your return and exchange policy?",
    a: "We offer a 7-day return window for most physical products, provided they are in unused condition and their original packaging. Groceries and personal hygiene items are non-returnable. Exchanges are free of charge for damaged items."
  },
  {
    q: "Are there any shipping charges?",
    a: "Shipping is absolutely FREE for all orders above ₹499. For orders equal to or below ₹499, a flat shipping and handling charge of ₹50 is applied automatically during checkout."
  },
  {
    q: "Can I sell my products on Sovely?",
    a: "Yes! Businesses and registered suppliers can become partners by going to the 'Sell on Sovely' link in the footer. Simply register with your business name, contact info, and GSTIN to get reviewed by our onboarding team."
  }
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="faq-page container section animate-fadeUp">
      <div className="faq-header text-center">
        <HelpCircle size={48} className="header-icon" />
        <h1>Frequently Asked Questions</h1>
        <p className="subtitle">Find answers to common questions about shopping, payments, and delivery</p>
      </div>

      <div className="faq-list">
        {FAQS_DATA.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="faq-item glass" onClick={() => toggleFaq(idx)}>
              <div className="faq-question-row">
                <h3>{faq.q}</h3>
                <button className="faq-toggle-btn">
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
              {isOpen && (
                <div className="faq-answer-row animate-fadeUp">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="outro-card glass text-center">
        <h3>Still have questions?</h3>
        <p>Our dedicated support team is available 24/7 to resolve your inquiries.</p>
        <a href="/contact" className="btn btn-primary">Submit a Ticket</a>
      </div>
    </div>
  );
}
