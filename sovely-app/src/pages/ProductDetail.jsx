import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading, addToCart } = useData();
  const product = products.find(p => p.id.toString() === id);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    // Add the selected quantity to the global cart
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) return <div className="section container"><div className="empty-state">Loading product details...</div></div>;
  if (!product) return <div className="section container"><div className="empty-state">Product not found. <Link to="/products">Back to products</Link></div></div>;

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="product-detail-page section container">
      <div className="pd-grid">
        {/* Images */}
        <div className="pd-image-section">
          <div className="pd-main-img-wrap">
            <img src={product.image} alt={product.name} className="pd-main-img" />
            {product.badge && <span className="pd-badge" style={{ backgroundColor: product.badgeColor }}>{product.badge}</span>}
          </div>
        </div>

        {/* Info */}
        <div className="pd-info-section">
          <p className="pd-category">{product.category}</p>
          <h1 className="pd-title">{product.name}</h1>
          
          <div className="pd-rating">
            <div className="stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating) ? '#eab308' : 'none'}
                  stroke={i < Math.floor(product.rating) ? '#eab308' : '#d1d5db'}
                />
              ))}
            </div>
            <span className="pd-rating-val">{product.rating}</span>
            <span className="pd-reviews">({product.reviews} reviews)</span>
          </div>

          <div className="pd-price-row">
            <span className="pd-price">{formatPrice(product.price)}</span>
            <span className="pd-original-price">{formatPrice(product.originalPrice)}</span>
            {discount > 0 && <span className="pd-discount">{discount}% OFF</span>}
          </div>

          <p className="pd-desc">
            Experience premium quality with the {product.name}. Carefully crafted for maximum satisfaction and durability. Perfect for your everyday needs.
          </p>

          {/* Actions */}
          <div className="pd-actions">
            <div className="pd-qty">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            <button 
              className={`btn btn-primary pd-cart-btn ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} /> {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>
            
            <button className="btn btn-outline pd-wishlist-btn">
              <Heart size={18} />
            </button>
          </div>

          {/* Trust */}
          <div className="pd-trust">
            <div className="trust-item">
              <Truck size={20} />
              <span>{product.freeDelivery ? 'Free Delivery' : 'Standard Delivery'}</span>
            </div>
            <div className="trust-item">
              <Shield size={20} />
              <span>1 Year Warranty</span>
            </div>
            <div className="trust-item">
              <RotateCcw size={20} />
              <span>30-Day Returns</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
