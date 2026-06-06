import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Heart, Truck, User } from "lucide-react";
import { useData } from "../context/DataContext";
import "./MobileBottomNav.css";

export default function MobileBottomNav() {
  const location = useLocation();
  const { user, wishlist } = useData();

  const currentPath = location.pathname;
  const wishlistCount = wishlist ? wishlist.length : 0;

  const accountPath = user ? "/orders" : "/login";

  const isHomeActive = currentPath === "/";
  const isCategoriesActive = currentPath === "/categories";
  const isWishlistActive = currentPath === "/wishlist";
  const isTrackActive = currentPath === "/track";
  const isAccountActive =
    currentPath === "/login" ||
    currentPath === "/orders" ||
    currentPath === "/settings";

  return (
    <nav className="mobile-bottom-nav">
      <Link
        to="/"
        className={`bottom-nav-item ${isHomeActive ? "active" : ""}`}
      >
        <Home size={22} />
        <span>Home</span>
      </Link>
      <Link
        to="/categories"
        className={`bottom-nav-item ${isCategoriesActive ? "active" : ""}`}
      >
        <LayoutGrid size={22} />
        <span>Categories</span>
      </Link>
      <Link
        to="/wishlist"
        className={`bottom-nav-item ${isWishlistActive ? "active" : ""}`}
      >
        <div className="bottom-nav-icon-wrap">
          <Heart size={22} />
          {wishlistCount > 0 && (
            <span className="bottom-nav-badge">{wishlistCount}</span>
          )}
        </div>
        <span>Wishlist</span>
      </Link>
      <Link
        to="/track"
        className={`bottom-nav-item ${isTrackActive ? "active" : ""}`}
      >
        <Truck size={22} />
        <span>Track</span>
      </Link>
      <Link
        to={accountPath}
        className={`bottom-nav-item ${isAccountActive ? "active" : ""}`}
      >
        <User size={22} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
