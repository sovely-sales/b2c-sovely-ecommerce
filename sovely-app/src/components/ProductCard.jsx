import { useState } from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useData();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (product.stock === 0) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const increment = (e) => { e.preventDefault(); setQuantity(q => q + 1); };
  const decrement = (e) => { e.preventDefault(); if (quantity > 1) setQuantity(q => q - 1); };

  const isSoldOut = product.stock === 0;
  const formattedPrice = new Intl.NumberFormat('en-IN').format(product.price);
  const formattedOriginal = product.originalPrice && product.originalPrice > product.price
    ? new Intl.NumberFormat('en-IN').format(product.originalPrice)
    : null;
  const discountPct = formattedOriginal
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const rating = product.rating || 0;

  return (
    <Link to={`/product/${product.id}`} className="b2b-product-card" id={`product-card-${product.id}`}>
      {/* Image Container */}
      <div className="b2b-img-wrap">
        <img src={product.image} alt={product.name} className="b2b-main-img" loading="lazy" />

        {isSoldOut && <div className="b2b-badge-soldout" />}
        {discountPct > 0 && !isSoldOut && (
          <div className="b2b-discount-badge">{discountPct}% OFF</div>
        )}

        <div className="b2b-inset-img">
          <img src={product.image} alt="Thumbnail" />
        </div>
      </div>

      {/* Info */}
      <div className="b2b-info-wrap">
        {product.category && (
          <p className="b2b-category">{product.category}</p>
        )}

        <h3 className="b2b-title" title={product.name}>{product.name}</h3>

        {/* Stars */}
        {rating > 0 && (
          <div className="b2b-rating">
            <div className="b2b-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.floor(rating) ? '#eab308' : 'none'}
                  stroke={i < Math.floor(rating) ? '#eab308' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="b2b-rating-val">{rating.toFixed(1)}</span>
            {product.reviews > 0 && (
              <span className="b2b-review-count">({product.reviews})</span>
            )}
          </div>
        )}

        <div className="b2b-price-row">
          <span className="b2b-price">₹{formattedPrice}</span>
          {formattedOriginal && (
            <span className="b2b-original-price">₹{formattedOriginal}</span>
          )}
        </div>

        {/* Controls */}
        <div className="b2b-controls" onClick={e => e.preventDefault()}>
          <div className="b2b-quantity">
            <button onClick={decrement} className="qty-btn" disabled={isSoldOut || quantity <= 1}>−</button>
            <span className="qty-value">{quantity}</span>
            <button onClick={increment} className="qty-btn" disabled={isSoldOut}>+</button>
          </div>

          <button
            className={`b2b-add-btn ${added ? 'added' : ''} ${isSoldOut ? 'sold-out' : ''}`}
            onClick={handleQuickAdd}
            disabled={isSoldOut}
          >
            {added ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  );
}
