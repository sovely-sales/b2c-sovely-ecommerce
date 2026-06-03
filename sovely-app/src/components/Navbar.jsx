import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  Truck,
  MapPin,
  ChevronDown,
  Bell,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
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
    theme,
    toggleTheme,
  } = useData();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <>
      <header className={`main-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-container">
          <div className="nav-left">
            <Link to="/" className="nav-logo">
              <img
                src={sovelyLogo}
                alt="Sovely"
                height="40"
                className="nav-logo-img"
              />
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
                <div className="category-dropdown-menu animate-fadeUp">
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
            <div
              className={`nav-search-section ${showMobileSearch ? "show-mobile" : ""}`}
            >
              <form className="search-bar" onSubmit={handleSearchSubmit}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setSearchInput("")}
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
            </div>
          ) : (
            <div
              className="nav-search-section"
              style={{ visibility: "hidden" }}
            ></div>
          )}

          <div className="nav-actions">
            {}
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user?.role !== "admin" ? (
              <>
                <button
                  className="action-link-text search-toggle-btn show-on-mobile-inline"
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  title="Search"
                >
                  <Search size={20} className="nav-icon" />
                </button>

                <Link
                  to="/wishlist"
                  className="action-link-text"
                  title="Wishlist"
                >
                  <Heart size={20} className="nav-icon" />
                  <span className="hide-on-mobile">Wishlist</span>
                </Link>

                <Link to="/track" className="action-link-text" title="Track Order">
                  <Truck size={20} className="nav-icon" />
                  <span className="hide-on-mobile">Track</span>
                </Link>

                <div className="user-profile-wrap">
                  <button
                    className="action-link-text user-btn-text"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    title={user ? user.name : "Sign In"}
                  >
                    <User size={20} className="nav-icon" />
                    <span className="hide-on-mobile">
                      {user ? user.name : "Sign In"}
                    </span>
                    <ChevronDown size={16} className="hide-on-mobile" />
                  </button>

                  {showProfileMenu && (
                    <div className="profile-dropdown animate-fadeUp">
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
                              navigate("/");
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
                  className="cart-btn-neo"
                  onClick={() => setIsCartOpen(true)}
                  title="Shopping Cart"
                >
                  <ShoppingCart size={18} />
                  <span className="cart-badge-neo">{cartCount}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/admin"
                  className="admin-pill"
                  title="Admin Dashboard"
                >
                  <LayoutDashboard size={18} />
                  <span className="hide-on-mobile">Admin</span>
                </Link>
                <div className="user-profile-wrap">
                  <button
                    className="action-link-text user-btn-text"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    title={user.name}
                  >
                    <User size={20} className="nav-icon" />
                    <span className="hide-on-mobile">{user.name}</span>
                    <ChevronDown size={16} className="hide-on-mobile" />
                  </button>

                  {showProfileMenu && (
                    <div className="profile-dropdown animate-fadeUp">
                      <div className="dropdown-divider"></div>
                      <button
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                          navigate("/");
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
          <p>NO HANDLING FEES - FREE SHIPPING ON ORDERS OVER ₹999*</p>
        </div>
      </div>
    </>
  );
}
