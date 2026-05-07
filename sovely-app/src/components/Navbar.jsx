import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, User, Heart, Menu, X, 
  MapPin, ChevronDown, Bell, LogOut, LayoutDashboard 
} from 'lucide-react';
import sovelyLogo from '../assets/sovely-logo.png';
import { useData } from '../context/DataContext';
import './Navbar.css';

export default function Navbar() {
  const { user, cartItems, logout } = useData();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <div className="nav-top-bar">
        <div className="container">
          <p>🎉 Free delivery on orders above ₹499 | Use code <strong>SOVELY10</strong></p>
          <div className="top-bar-links">
            <Link to="/track">Track Order</Link>
            <Link to="/contact">Support</Link>
          </div>
        </div>
      </div>

      <header className={`main-navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src={sovelyLogo} alt="Sovely" />
          </Link>

          {/* Location & Search (Only for Customers) */}
          {user?.role !== 'admin' && (
            <div className="nav-search-section">
              <button className="location-pill">
                <MapPin size={16} />
                <span>Bengaluru</span>
                <ChevronDown size={14} />
              </button>
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="nav-actions">
            {user?.role !== 'admin' ? (
              <>
                <Link to="/wishlist" className="action-link" title="Wishlist">
                  <Heart size={22} />
                </Link>
                <Link to="/cart" className="cart-link" title="Shopping Cart">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>
              </>
            ) : (
              <Link to="/admin" className="admin-pill">
                <LayoutDashboard size={18} /> Admin Dashboard
              </Link>
            )}

            <div className="user-profile-wrap">
              <button 
                className="user-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {user ? (
                  <div className="user-avatar">{user.name?.[0]}</div>
                ) : (
                  <User size={22} />
                )}
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown glass animate-fadeUp">
                  {user ? (
                    <>
                      <div className="dropdown-user-info">
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link to="/orders" onClick={() => setShowProfileMenu(false)}>My Orders</Link>
                      <Link to="/settings" onClick={() => setShowProfileMenu(false)}>Settings</Link>
                      <div className="dropdown-divider"></div>
                      <button onClick={() => { logout(); setShowProfileMenu(false); navigate('/login'); }} className="logout-item">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setShowProfileMenu(false)}>Sign In</Link>
                      <Link to="/login" onClick={() => setShowProfileMenu(false)}>Create Account</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
