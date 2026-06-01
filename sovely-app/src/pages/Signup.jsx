import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  ShoppingBag,
  LogIn,
} from "lucide-react";
import { useData } from "../context/DataContext";
import "./Signup.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8014";

export default function Signup() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // FIX: Extract 'user' and 'login' before the useEffect!
  const { user, login } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      // Go back to previous page (like cart/checkout) or home
      const from = location.state?.from || "/";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const endpoint = isLogin ? `${API}/api/login` : `${API}/api/register`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        login(
          { name: data.name, email: data.email, role: data.role || "user" },
          data.token,
        );

        setSuccess(true);
        setTimeout(() => {
          if (data.role === "admin") {
            navigate("/admin");
          } else {
            navigate(location.state?.from || "/");
          }
        }, 1500);
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Connection error. Please check your backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-logo-badge">
            <ShoppingBag size={32} />
          </div>
          <h1>
            Welcome to <span className="text-primary">Sovely</span>
          </h1>
          <p>
            Join thousands of happy shoppers such as Gagan discovering the best deals on
            electronics, fashion, and more.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon">
                <CheckCircle size={18} />
              </div>
              <span>Premium Curated Products</span>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">
                <CheckCircle size={18} />
              </div>
              <span>Lightning Fast Delivery</span>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">
                <CheckCircle size={18} />
              </div>
              <span>24/7 Priority Support</span>
            </div>
          </div>
        </div>
        <div className="auth-visual-bg"></div>
      </div>

      <div className="auth-container">
        <div className="auth-form-card animate-fadeUp">
          <div className="auth-header">
            {success ? (
              <div className="success-lottie animate-scaleIn">
                <CheckCircle size={64} color="var(--primary)" />
                <h2>Success!</h2>
                <p>Welcome back!</p>
              </div>
            ) : (
              <>
                <div className="auth-type-pill">
                  <button
                    className={isLogin ? "active" : ""}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                  <button
                    className={!isLogin ? "active" : ""}
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </div>
                <h2>
                  {isLogin ? "Great to see you again" : "Create your account"}
                </h2>
                <p className="auth-subtitle">
                  {isLogin
                    ? "Enter your credentials to access your account"
                    : "Start your premium shopping journey today"}
                </p>
              </>
            )}
          </div>

          {!success && (
            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="auth-error animate-shake">{error}</div>}

              {!isLogin && (
                <>
                  <div className="input-field">
                    <label>
                      <User size={16} /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Pappu"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="input-field">
                    <label>
                      <User size={16} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              <div className="input-field">
                <label>
                  <Mail size={16} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-field">
                <label>
                  <Lock size={16} /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {isLogin && (
                <div className="auth-extra">
                  <label className="checkbox-label">
                    <input type="checkbox" /> Remember me
                  </label>
                  <button type="button" className="forgot-btn">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="auth-btn btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <div className="loader"></div>
                ) : (
                  <>
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
