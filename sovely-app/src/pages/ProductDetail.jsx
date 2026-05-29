import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProductCard from '../components/ProductCard';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading: contextLoading, addToCart, categories } = useData();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    // 1. Try to find in global context first
    const found = products.find(p => p.id.toString() === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.image);
      setLoading(false);
      return;
    }

    // 2. Otherwise fetch from backend
    const fetchProduct = async () => {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8014';
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
          const categoryMap = {};
          categories.forEach(c => {
            categoryMap[String(c.id || c._id)] = c.name;
          });
          const rawCategory = String(p.categoryId || p.category || '');
          const categoryName = categoryMap[rawCategory] || rawCategory || 'Uncategorized';
          
          const activeImg = (p.images && p.images.length > 0) ? p.images[0].url : p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop';
          
          setProduct({
            id: p._id || p.id,
            name: p.title || p.name,
            category: categoryName,
            categoryId: rawCategory,
            price: (p.dropshipBasePrice || p.price || 0) + 30,
            originalPrice: (p.suggestedRetailPrice || p.originalPrice || p.dropshipBasePrice || 0) + 30,
            rating: p.averageRating || p.rating || 0,
            reviews: p.reviewCount || p.reviews || 0,
            badge: p.badge || (p.suggestedRetailPrice > p.dropshipBasePrice ? 'Sale' : null),
            badgeColor: p.badgeColor || '#ef4444',
            image: activeImg,
            images: (p.images && p.images.length > 0) ? p.images : (p.image ? [{ url: p.image }] : []),
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false
          });
          setActiveImage(activeImg);
        }
      } catch (error) {
        console.error('Error fetching product detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!contextLoading) {
      fetchProduct();
    }
  }, [id, products, contextLoading, categories]);

  // Scroll to top when product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) return <div className="section container"><div className="empty-state">Loading product details...</div></div>;
  if (!product) return <div className="section container"><div className="empty-state">Product not found. <Link to="/products">Back to products</Link></div></div>;

  // Filter recommendations (same category first, exclude current product, fallback to general if less than 8)
  let recommendations = products.filter(p => p.category === product.category && p.id.toString() !== id);
  if (recommendations.length < 8) {
    const additional = products.filter(p => p.id.toString() !== id && !recommendations.some(r => r.id === p.id));
    recommendations = [...recommendations, ...additional].slice(0, 8);
  } else {
    recommendations = recommendations.slice(0, 8);
  }

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="product-detail-page section container">
      <div className="pd-grid">
        {/* Images */}
        <div className="pd-image-section">
          <div className="pd-main-img-wrap">
            <img src={activeImage || product.image} alt={product.name} className="pd-main-img" />
            {product.badge && <span className="pd-badge" style={{ backgroundColor: product.badgeColor }}>{product.badge}</span>}
          </div>
          
          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="pd-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pd-thumb-wrap ${activeImage === img.url ? 'active' : ''}`}
                  onClick={() => setActiveImage(img.url)}
                  type="button"
                >
                  <img src={img.url} alt={`${product.name} thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
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

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="pd-recommendations">
          <h2 className="recommendations-title">You May Also Like</h2>
          <div className="recommendations-scroll-container">
            {recommendations.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
