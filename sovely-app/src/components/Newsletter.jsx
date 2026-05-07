import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="newsletter-section" id="newsletter-section">
      <div className="container newsletter-inner">
        <div className="newsletter-left">
          <div className="newsletter-icon-wrap">
            <Mail size={28} />
          </div>
          <div>
            <h2 className="newsletter-title">Stay in the Loop</h2>
            <p className="newsletter-desc">
              Subscribe and get exclusive deals, early access to sales & weekly curated picks — straight to your inbox.
            </p>
          </div>
        </div>

        <div className="newsletter-right">
          {submitted ? (
            <div className="newsletter-success" id="newsletter-success-msg">
              <CheckCircle size={24} />
              <div>
                <p className="success-title">You're in! 🎉</p>
                <p className="success-sub">Check your inbox for a welcome gift.</p>
              </div>
            </div>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit} id="newsletter-form">
              <div className="newsletter-input-wrap">
                <Mail size={16} className="newsletter-input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  id="newsletter-email-input"
                />
              </div>
              <button type="submit" className="btn btn-white newsletter-submit-btn" id="newsletter-submit-btn">
                Subscribe <Send size={15} />
              </button>
            </form>
          )}
          <p className="newsletter-privacy">
            🔒 No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
