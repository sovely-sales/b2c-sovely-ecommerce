import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ProductCard from '../components/ProductCard';
import '../pages/Products.css';
import './Deals.css';
import { Clock } from 'lucide-react';

export default function Deals() {
  const { products, loading } = useData();
  
  if (loading) return <div className="deals-page section container">Loading deals...</div>;

  // Mock deals: products with highest discounts
  const deals = products.filter(p => p.originalPrice > p.price)
    .sort((a, b) => {
      const discountA = (a.originalPrice - a.price) / a.originalPrice;
      const discountB = (b.originalPrice - b.price) / b.originalPrice;
      return discountB - discountA;
    });

  return (
    <div className="deals-page section container">
      <div className="deals-header">
        <h1 className="page-title">Today's Deals</h1>
        <div className="deals-timer">
          <Clock size={20} />
          <span>Ends in: <strong>05:24:12</strong></span>
        </div>
      </div>

      <div className="products-grid-full">
        {deals.map(product => (
          <Link to={`/product/${product.id}`} key={product.id} className="product-link">
            <ProductCard product={product} />
          </Link>
        ))}
      </div>
    </div>
  );
}
