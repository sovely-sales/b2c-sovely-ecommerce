import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  MapPin,
  ChevronDown,
  Bell,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useData } from "../context/DataContext";
import sovelyLogo from "../assets/sovely-logo.png";
import "./Navbar.css";

export default function Navbar() {
  const {
    user,
    cartItems,
    logout,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchFilter,
    setSearchFilter,
    isCartOpen,
    setIsCartOpen,
  } = useData();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const navigate = useNavigate();
  const categoryRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setShowCategoryMenu(false);

    const productsSection = document.getElementById("all-products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header className={`main-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-container">
          {}
          <div className="nav-left">
            <Link to="/" className="nav-logo">
              <img src={sovelyLogo} alt="Sovely" height="40" />
            </Link>
            <div className="nav-categories-wrap" ref={categoryRef}>
              <button
                className="nav-categories-dropdown"
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              >
                <Menu size={20} />
                <span>
                  {selectedCategory === "All" ? "Categories" : selectedCategory}
                </span>
                <ChevronDown
                  size={16}
                  className={showCategoryMenu ? "chevron-rotated" : ""}
                />
              </button>

              {showCategoryMenu && (
                <div className="category-dropdown-menu glass animate-fadeUp">
                  <button
                    className={`cat-item ${selectedCategory === "All" ? "active" : ""}`}
                    onClick={() => handleCategorySelect("All")}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`cat-item ${selectedCategory === cat.name ? "active" : ""}`}
                      onClick={() => handleCategorySelect(cat.name)}
                    >
                      <span className="cat-icon">{cat.icon}</span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {}
          {user?.role !== "admin" ? (
            <div className="nav-search-section">
              <div className="search-bar">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                {searchFilter && (
                  <button
                    className="search-clear"
                    onClick={() => setSearchFilter("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className="nav-search-section"
              style={{ visibility: "hidden" }}
            ></div>
          )}

          {}
          <div className="nav-actions">
            {user?.role !== "admin" ? (
              <>
                <Link to="/wishlist" className="action-link-text">
                  Wishlist
                </Link>

                <div className="user-profile-wrap">
                  <button
                    className="action-link-text user-btn-text"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {user ? user.name : "Sign In"}
                    <ChevronDown size={16} />
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
                          <Link
                            to="/orders"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            Settings
                          </Link>
                          <div className="dropdown-divider"></div>
                          <button
                            onClick={() => {
                              logout();
                              setShowProfileMenu(false);
                              navigate("/login");
                            }}
                            className="logout-item"
                          >
                            <LogOut size={16} /> Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            Sign In
                          </Link>
                          <Link
                            to="/login"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            Create Account
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="cart-link-text"
                  onClick={() => setIsCartOpen(true)}
                >
                  Cart
                  <span className="cart-badge-square">{cartCount}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/admin" className="admin-pill">
                  <LayoutDashboard size={18} /> Admin
                </Link>
                <div className="user-profile-wrap">
                  <button
                    className="action-link-text user-btn-text"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    {user.name}
                    <ChevronDown size={16} />
                  </button>

                  {showProfileMenu && (
                    <div className="profile-dropdown glass animate-fadeUp">
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          navigate("/login");
                        }}
                        className="logout-item"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="nav-secondary-banner">
        <div className="container">
          <p>NO HANDLING FEES - FREE SHIPPING ON ORDERS OVER ₹499*</p>
        </div>
      </div>
    </>
  );
}
