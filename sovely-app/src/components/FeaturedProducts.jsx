import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

const TABS = ['All', 'Electronics', 'Fashion', 'Groceries', 'Home & Living', 'Beauty'];

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('All');
  const { products, loading } = useData();

  if (loading) return <div>Loading featured products...</div>;

  const filtered = activeTab === 'All'
    ? products
    : products.filter(p => p.category === activeTab);

  return (
    <section className="section featured-section" id="featured-products-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div>
            <p className="section-label">Hand-picked for you</p>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Curated top picks across all categories</p>
          </div>
          <Link to="/products" className="btn btn-outline view-all-btn" id="featured-view-all-btn">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="filter-tabs" id="product-filter-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'filter-tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
              id={`filter-tab-${tab.replace(/\s+/g,'-').toLowerCase()}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="products-grid">
          {filtered.slice(0, 8).map((product, idx) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              style={{ textDecoration: 'none', animationDelay: `${idx * 0.07}s` }}
            >
              <ProductCard product={product} />
            </Link>
          ))}
        </div>

        {/* Load more */}
        <div className="featured-footer">
          <Link to="/products" className="btn btn-primary load-more-btn" id="load-more-btn">
            Explore All Products <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
