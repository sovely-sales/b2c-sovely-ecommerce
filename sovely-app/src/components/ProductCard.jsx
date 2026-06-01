import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import { Check, Star, Heart } from "lucide-react";
import "./ProductCard.css";

const extractProductSize = (name) => {
  if (!name) return "1 pc";
  const parenMatch = name.match(
    /\(([^)]*(?:pc|pcs|kg|g|ml|l|ltr|basket|unit|units|pack|packs|gm|gms|oz)[^)]*)\)/i,
  );
  if (parenMatch) return parenMatch[1].trim();

  const endMatch = name.match(
    /(?:\b|\s)(\d+\s*(?:pc|pcs|kg|g|ml|l|ltr|basket|unit|units|pack|packs|gm|gms|oz)\b)/i,
  );
  if (endMatch) return endMatch[1].trim();
  return "1 pc";
};

const cleanProductName = (name) => {
  if (!name) return "";
  return name
    .replace(
      /\s*\(?\b\d+\s*(?:pc|pcs|kg|g|ml|l|ltr|basket|unit|units|pack|packs|gm|gms|oz)\b\)?\s*$/i,
      "",
    )
    .trim();
};

export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    addToCart(product);
    setIsCartOpen(true);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isSoldOut = product.stock === 0;
  const formattedPrice = new Intl.NumberFormat("en-IN").format(product.price);
  const formattedOriginalPrice = product.originalPrice
    ? new Intl.NumberFormat("en-IN").format(product.originalPrice)
    : null;
  const discountAmount =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  const rating = product.rating || 4.7;
  const reviewsCount = product.reviews
    ? new Intl.NumberFormat("en-IN").format(product.reviews)
    : "3.8k";
  const productSize = extractProductSize(product.name);
  const displayName = cleanProductName(product.name);
  const { addToCart, setIsCartOpen, wishlist, toggleWishlist } = useData();

  return (
    <Link
      to={`/product/${product.id}`}
      className="autorev-product-card"
      id={`product-card-${product.id}`}
    >
      <div className="card-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        {}
        <button
          className="card-wishlist-btn"
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
        >
          <Heart
            size={18}
            fill={wishlist.includes(String(product.id)) ? "#ef4444" : "none"}
            color={
              wishlist.includes(String(product.id)) ? "#ef4444" : "#64748b"
            }
          />
        </button>
        <button
          className={`card-add-btn ${added ? "added" : ""}`}
          onClick={handleQuickAdd}
          disabled={isSoldOut}
        >
          {added ? (
            <>
              <Check size={14} style={{ marginRight: "4px" }} />
              ADDED
            </>
          ) : (
            "ADD"
          )}
        </button>
      </div>

      <div className="card-info-wrap">
        <div className="card-price-row">
          <div className="card-price-badge">₹{formattedPrice}</div>
          {formattedOriginalPrice && discountAmount > 0 && (
            <span className="card-original-price">
              ₹{formattedOriginalPrice}
            </span>
          )}
        </div>

        {discountAmount > 0 && (
          <div className="card-discount-row">
            <span className="card-discount-text">₹{discountAmount} OFF</span>
            <div className="card-discount-line"></div>
          </div>
        )}

        <h3 className="card-title" title={product.name}>
          {displayName}
        </h3>

        <div className="card-size">{productSize}</div>

        <div className="card-rating-row">
          <div className="card-rating-badge">
            <Star size={14} className="card-star-icon" />
            <span className="card-rating-score">{rating.toFixed(1)}</span>
          </div>
          <span className="card-reviews-count">({reviewsCount})</span>
        </div>
      </div>
    </Link>
  );
}
