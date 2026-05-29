import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ProductCard from '../components/ProductCard';
import '../pages/Products.css';
import './Deals.css';
import { Clock } from 'lucide-react';

export default function Deals() {
  const { categories, loading: contextLoading } = useData();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Build categoryMap for mapping
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      const key = String(c.id || c._id);
      map[key] = c.name;
    });
    return map;
  }, [categories]);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8014';
      try {
        const res = await fetch(`${API_URL}/api/products?deals=true&limit=24`);
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(p => {
            const rawCategory = String(p.categoryId || p.category || '');
            const categoryName = categoryMap[rawCategory] || rawCategory || 'Uncategorized';
            return {
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
              image: (p.images && p.images.length > 0) ? p.images[0].url : p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
              images: (p.images && p.images.length > 0) ? p.images : (p.image ? [{ url: p.image }] : []),
              freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false
            };
          });

          // Sort by highest discount
          mapped.sort((a, b) => {
            const discountA = (a.originalPrice - a.price) / a.originalPrice;
            const discountB = (b.originalPrice - b.price) / b.originalPrice;
            return discountB - discountA;
          });

          setDeals(mapped);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!contextLoading && categories.length > 0) {
      fetchDeals();
    }
  }, [contextLoading, categories, categoryMap]);
  
  if (loading) return <div className="deals-page section container">Loading deals...</div>;

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
          <div key={product.id} className="product-link">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
