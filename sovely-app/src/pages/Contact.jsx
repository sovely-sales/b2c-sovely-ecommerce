import { MapPin, Phone, Mail, Send } from "lucide-react";
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-page section container">
      <div className="page-header text-center" style={{ marginBottom: "50px" }}>
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">
          We're here to help! Reach out to us anytime.
        </p>
      </div>

      <div className="contact-grid">
        {}
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">
              <MapPin size={24} />
            </div>
            <div>
              <h3>Our Office</h3>
              <p>
                123 Sovely Avenue, Tech Park
                <br />
                Bangalore, KA 560001, India
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <Phone size={24} />
            </div>
            <div>
              <h3>Phone</h3>
              <p>
                +91 98765 43210
                <br />
                Mon-Fri, 9am to 6pm
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <Mail size={24} />
            </div>
            <div>
              <h3>Email</h3>
              <p>
                support@sovely.com
                <br />
                sales@sovely.com
              </p>
            </div>
          </div>
        </div>

        {}
        <div className="contact-form-wrapper">
          <h2>Send us a Message</h2>
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-grid">
              <div className="input-group">
                <label>Your Name</label>
                <input type="text" placeholder="John Doe" required />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input type="email" placeholder="john@example.com" required />
              </div>
            </div>
            <div className="input-group">
              <label>Subject</label>
              <input type="text" placeholder="How can we help?" required />
            </div>
            <div className="input-group">
              <label>Message</label>
              <textarea
                rows="5"
                placeholder="Write your message here..."
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary send-btn">
              Send Message <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
