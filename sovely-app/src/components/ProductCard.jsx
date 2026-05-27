import { useState } from 'react';
import { Check, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './ProductCard.css';

// Helper to extract product size/quantity from the title
const extractProductSize = (name) => {
  if (!name) return '1 pc';
  
  // Look for parenthesized expressions like (450 ml), (2kg), (1 Pc), etc.
  const parenMatch = name.match(/\(([^)]*(?:pc|pcs|kg|g|ml|l|ltr|basket|unit|units|pack|packs|gm|gms|oz)[^)]*)\)/i);
  if (parenMatch) {
    return parenMatch[1].trim();
  }
  
  // Look for end-of-string patterns like "1 Pc", "250g", etc.
  const endMatch = name.match(/(?:\b|\s)(\d+\s*(?:pc|pcs|kg|g|ml|l|ltr|basket|unit|units|pack|packs|gm|gms|oz)\b)/i);
  if (endMatch) {
    return endMatch[1].trim();
  }
  
  return '1 pc';
};

// Helper to clean trailing size info from product name to avoid repetition
const cleanProductName = (name) => {
  if (!name) return '';
  return name.replace(/\s*\(?\b\d+\s*(?:pc|pcs|kg|g|ml|l|ltr|basket|unit|units|pack|packs|gm|gms|oz)\b\)?\s*$/i, '').trim();
};

export default function ProductCard({ product }) {
  const { addToCart, setIsCartOpen } = useData();
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
  const formattedPrice = new Intl.NumberFormat('en-IN').format(product.price);
  const formattedOriginalPrice = product.originalPrice ? new Intl.NumberFormat('en-IN').format(product.originalPrice) : null;
  const discountAmount = (product.originalPrice && product.originalPrice > product.price) 
    ? (product.originalPrice - product.price) 
    : 0;

  const rating = product.rating || 4.7;
  const reviewsCount = product.reviews ? new Intl.NumberFormat('en-IN').format(product.reviews) : '3.8k';
  const productSize = extractProductSize(product.name);
  const displayName = cleanProductName(product.name);

  return (
    <Link to={`/product/${product.id}`} className="autorev-product-card" id={`product-card-${product.id}`}>
      
      {/* Product Image Container */}
      <div className="card-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
        
        {/* ADD / ADDED button overlapping the bottom right corner */}
        <button 
          className={`card-add-btn ${added ? 'added' : ''}`}
          onClick={handleQuickAdd}
          disabled={isSoldOut}
        >
          {added ? (
            <>
              <Check size={14} style={{ marginRight: '4px' }} />
              ADDED
            </>
          ) : (
            'ADD'
          )}
        </button>
      </div>

      {/* Info Block */}
      <div className="card-info-wrap">
        
        {/* Price Row */}
        <div className="card-price-row">
          <div className="card-price-badge">
            ₹{formattedPrice}
          </div>
          {formattedOriginalPrice && discountAmount > 0 && (
            <span className="card-original-price">₹{formattedOriginalPrice}</span>
          )}
        </div>

        {/* Discount OFF Row */}
        {discountAmount > 0 && (
          <div className="card-discount-row">
            <span className="card-discount-text">₹{discountAmount} OFF</span>
            <div className="card-discount-line"></div>
          </div>
        )}

        {/* Product Title */}
        <h3 className="card-title" title={product.name}>
          {displayName}
        </h3>
        
        {/* Product Size / Quantity */}
        <div className="card-size">
          {productSize}
        </div>

        {/* Rating and Reviews Row */}
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

