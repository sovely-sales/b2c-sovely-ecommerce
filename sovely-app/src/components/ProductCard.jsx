import { useState, useEffect, useRef, useMemo } from "react";
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
  const timerRef = useRef(null);
  const { addToCart, setIsCartOpen, wishlist, toggleWishlist } = useData();

  // Prevent memory leaks if component unmounts before timeout finishes
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Memoize heavy regex operations so they don't run on every cart update
  const displayName = useMemo(
    () => cleanProductName(product.name),
    [product.name],
  );
  const productSize = useMemo(
    () => extractProductSize(product.name),
    [product.name],
  );

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop navigation to product page

    if (product.stock === 0) return;

    addToCart(product);
    setIsCartOpen(true);
    setAdded(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
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

  return (
    <Link
      to={`/product/${product.id}`}
      className="autorev-product-card"
      id={`product-card-${product.id}`}
    >
      <div className="card-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />

        <button
          className="card-wishlist-btn"
          aria-label="Toggle Wishlist"
          onClick={handleWishlistToggle}
        >
          <Heart
            size={18}
            fill={wishlist.includes(String(product.id)) ? "#ef4444" : "none"}
            color={
              wishlist.includes(String(product.id)) ? "#ef4444" : "#64748b"
            }
          />
        </button>

        {isSoldOut && (
          <div className="card-soldout-overlay">
            <span>OUT OF STOCK</span>
          </div>
        )}

        <button
          className={`card-add-btn ${isSoldOut ? "soldout" : ""} ${added ? "added" : ""}`}
          onClick={isSoldOut ? handleWishlistToggle : handleQuickAdd}
          aria-label={isSoldOut ? "Toggle Wishlist" : added ? "Added to cart" : "Add to cart"}
          style={isSoldOut ? { backgroundColor: wishlist.includes(String(product.id)) ? "#ef4444" : "#f1f5f9", color: wishlist.includes(String(product.id)) ? "#fff" : "#0f172a" } : undefined}
        >
          {isSoldOut ? (
            wishlist.includes(String(product.id)) ? "WISHLISTED" : "WISHLIST"
          ) : added ? (
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
      </div>
    </Link>
  );
}
