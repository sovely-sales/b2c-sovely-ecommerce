import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import "./Wishlist.css";

export default function Wishlist() {
  const { products, wishlist, user } = useData();

  const wishlistedProducts = products.filter((p) =>
    wishlist.includes(String(p.id || p._id)),
  );

  if (!user) {
    return (
      <div className="wishlist-page container section animate-fadeUp">
        <div className="wishlist-empty glass">
          <Heart size={64} className="empty-icon" />
          <h2>Save your favorites</h2>
          <p>Please sign in to view and manage your wishlist.</p>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page container section">
      <div className="wishlist-header animate-fadeUp">
        <h1>My Wishlist</h1>
        <p>
          {wishlistedProducts.length}{" "}
          {wishlistedProducts.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div
          className="wishlist-empty glass animate-fadeUp"
          style={{ animationDelay: "0.1s" }}
        >
          <Heart size={64} className="empty-icon" />
          <h2>Your wishlist is empty</h2>
          <p>
            Explore our collections and tap the heart to save your favorites for
            later.
          </p>
          <Link to="/products" className="btn btn-primary">
            <ShoppingBag size={18} /> Start Shopping
          </Link>
        </div>
      ) : (
        <div
          className="wishlist-grid animate-fadeUp"
          style={{ animationDelay: "0.2s" }}
        >
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
