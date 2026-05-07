import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Globe, DollarSign, ArrowRight, 
  Store, LayoutDashboard, Package, LogOut, 
  CheckCircle, AlertCircle, ShoppingBag 
} from 'lucide-react';
import './Seller.css';

const API = 'http://127.0.0.1:8014';

export default function Seller() {
  const [token, setToken] = useState(localStorage.getItem('sellerToken') || null);
  const [view, setView] = useState('landing'); // 'landing' | 'login' | 'register' | 'dashboard'
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', businessName: '', phone: '', gstin: ''
  });

  useEffect(() => {
    if (token) {
      fetchSellerMe();
      setView('dashboard');
    }
  }, [token]);

  const fetchSellerMe = async () => {
    try {
      const res = await fetch(`${API}/api/seller/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSellerData(data);
      } else {
        handleLogout();
      }
    } catch (err) {
      console.error("Fetch me failed", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sellerToken');
    setToken(null);
    setSellerData(null);
    setView('landing');
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/seller/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('sellerToken', data.token);
        setToken(data.token);
        setSellerData(data);
        setView('dashboard');
      } else {
        setError(data.message || 'Invalid login');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/seller/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('sellerToken', data.token);
        setToken(data.token);
        setSellerData(data);
        setView('dashboard');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  /* ────────── RENDER LANDING ────────── */
  if (view === 'landing') {
    return (
      <div className="seller-page">
        <section className="seller-hero">
          <div className="container seller-hero-content">
            <div className="seller-hero-text animate-fadeUp">
              <div className="badge badge-green" style={{ marginBottom: '20px' }}>
                Join 5,000+ Sellers
              </div>
              <h1>Grow Your Business with <span className="hero-title-accent">Sovely</span></h1>
              <p>Start selling to millions of customers. Simple onboarding, low commissions, and 24/7 support.</p>
              <div className="seller-hero-btns">
                <button className="btn btn-primary" onClick={() => setView('register')}>
                  Start Selling Now <ArrowRight size={18} />
                </button>
                <button className="btn btn-outline" onClick={() => setView('login')} style={{ borderColor: 'white', color: 'white' }}>
                  Seller Login
                </button>
              </div>
            </div>
            <div className="seller-hero-img animate-float">
              <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" alt="Dashboard" />
            </div>
          </div>
        </section>

        <section className="seller-benefits section container">
          <div className="text-center" style={{ marginBottom: '60px' }}>
            <h2 className="section-title">Why Sell with Sovely?</h2>
            <p className="section-subtitle">We provide a premium ecosystem for your brand to thrive.</p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><Globe size={32} /></div>
              <h3>India-wide Reach</h3>
              <p>Ship to 20,000+ pincodes with our integrated logistics network.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><DollarSign size={32} /></div>
              <h3>Transparent Payouts</h3>
              <p>Fast 7-day payment cycles directly into your bank account.</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon"><TrendingUp size={32} /></div>
              <h3>Growth Insights</h3>
              <p>Advanced analytics to understand customer behavior and optimize sales.</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ────────── RENDER AUTH ────────── */
  if (view === 'login' || view === 'register') {
    return (
      <div className="seller-auth-container container section">
        <div className="auth-card animate-scaleIn">
          <div className="auth-header">
            <div className="auth-logo"><Store size={28} /></div>
            <h2>{view === 'login' ? 'Seller Login' : 'Create Seller Account'}</h2>
            <p>{view === 'login' ? 'Welcome back to your dashboard' : 'Join the Sovely marketplace today'}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {view === 'login' ? (
            <form onSubmit={onLogin} className="auth-form">
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={loginForm.email} 
                  onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                  placeholder="name@business.com" 
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  value={loginForm.password} 
                  onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="••••••••" 
                />
              </div>
              <button className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Authenticating...' : 'Login to Dashboard'}
              </button>
              <p className="auth-switch">
                Don't have an account? <span onClick={() => setView('register')}>Register here</span>
              </p>
            </form>
          ) : (
            <form onSubmit={onRegister} className="auth-form">
              <div className="form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" required placeholder="John Doe" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>Email</label>
                  <input type="email" required placeholder="john@example.com" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Business Name</label>
                <input type="text" required placeholder="Doe Enterprises" value={registerForm.businessName} onChange={e => setRegisterForm({...registerForm, businessName: e.target.value})} />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input type="password" required placeholder="Minimum 6 characters" value={registerForm.password} onChange={e => setRegisterForm({...registerForm, password: e.target.value})} />
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" placeholder="+91 XXXXX XXXXX" value={registerForm.phone} onChange={e => setRegisterForm({...registerForm, phone: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>GSTIN (Optional)</label>
                  <input type="text" placeholder="22AAAAA0000A1Z5" value={registerForm.gstin} onChange={e => setRegisterForm({...registerForm, gstin: e.target.value})} />
                </div>
              </div>
              <button className="btn btn-primary w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register as Seller'}
              </button>
              <p className="auth-switch">
                Already a seller? <span onClick={() => setView('login')}>Login here</span>
              </p>
            </form>
          )}
          <button className="btn-back" onClick={() => setView('landing')}>← Back to Info</button>
        </div>
      </div>
    );
  }

  /* ────────── RENDER DASHBOARD ────────── */
  return (
    <div className="seller-dashboard">
      <div className="dashboard-sidebar">
        <div className="sidebar-logo">
          <ShoppingBag size={24} />
          <span>Seller Hub</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active"><LayoutDashboard size={20} /> Dashboard</div>
          <div className="nav-item"><Package size={20} /> My Products</div>
          <div className="nav-item"><ShoppingBag size={20} /> Orders</div>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn"><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome back, {sellerData?.businessName || 'Merchant'}</p>
          </div>
          {sellerData?.status === 'pending' && (
            <div className="status-alert warning">
              <AlertCircle size={18} />
              <span>Your account is under review. You can list products but they won't be live until verified.</span>
            </div>
          )}
          {sellerData?.status === 'active' && (
            <div className="status-alert success">
              <CheckCircle size={18} />
              <span>Account Active & Verified</span>
            </div>
          )}
        </header>

        <div className="dashboard-stats">
          <div className="stat-card">
            <span className="stat-label">Total Sales</span>
            <span className="stat-value">₹0</span>
            <span className="stat-change">+0% this month</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Active Orders</span>
            <span className="stat-value">0</span>
            <span className="stat-change">Waiting for pickup</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Inventory</span>
            <span className="stat-value">0</span>
            <span className="stat-change">Products listed</span>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-card">
            <h3>Recent Orders</h3>
            <div className="empty-state">
              <ShoppingBag size={48} />
              <p>No orders yet. Once you list products, orders will appear here.</p>
              <button className="btn btn-primary" style={{ marginTop: '16px' }}>Add Your First Product</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
