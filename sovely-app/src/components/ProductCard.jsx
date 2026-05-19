import { useState } from 'react';
import { Star, Plus, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './ProductCard.css';

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
  
  const rating = product.rating || 4.5; // default for visual since actual data might not have it

  return (
    <Link to={`/product/${product.id}`} className="autorev-product-card" id={`product-card-${product.id}`}>
      
      {/* Top right Add to Cart Button */}
      <button 
        className={`card-add-btn ${added ? 'added' : ''}`}
        onClick={handleQuickAdd}
        disabled={isSoldOut}
      >
        {added ? <Check size={16} /> : <Plus size={16} />}
      </button>

      {/* Image */}
      <div className="card-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>

      {/* Info Block */}
      <div className="card-info-wrap">
        <div className="card-info-top">
          <h3 className="card-title" title={product.name}>{product.name}</h3>
        </div>
        
        <div className="card-info-bottom">
          <span className="card-price">₹{formattedPrice}</span>
          <div className="card-stars">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < Math.floor(rating) ? '#3b82f6' : 'none'}
                stroke={i < Math.floor(rating) ? '#3b82f6' : '#d1d5db'}
                className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick View */}
      <div className="card-quick-view">
        <Eye size={14} />
        <span>QUICK VIEW</span>
      </div>
      
    </Link>
  );
}
