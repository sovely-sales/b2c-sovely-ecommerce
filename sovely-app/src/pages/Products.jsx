import { useLocation, Link } from 'react-router-dom';
import { ChevronDown, Filter, LayoutGrid, List } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');

  const { products: FEATURED_PRODUCTS, loading } = useData();

  if (loading) return <div className="products-page section container">Loading products...</div>;

  const products = categoryFilter 
    ? FEATURED_PRODUCTS.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase() || p.category === categoryFilter)
    : FEATURED_PRODUCTS;

  return (
    <div className="products-page section container">
      
      {/* B2B Filter Bar */}
      <div className="b2b-filter-bar">
        <div className="filter-row top-row">
          <div className="filter-dropdowns">
            <div className="custom-select active-select">
              <span>{categoryFilter || 'Hardware'}</span>
              <ChevronDown size={14} />
            </div>
            <div className="custom-select">
              <span>All Brands</span>
              <ChevronDown size={14} />
            </div>
            <div className="custom-select">
              <span>All Stock Levels</span>
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="filter-actions">
            <button className="clear-btn"><Filter size={14} /> Clear</button>
            <div className="sort-group">
              <span className="sort-label">SORT</span>
              <div className="custom-select sort-select">
                <span>Latest</span>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="product-count">
              <span>{products.length}</span><br/>Products
            </div>
            <div className="view-toggle">
              <button className="view-btn active"><LayoutGrid size={16} /></button>
              <button className="view-btn"><List size={16} /></button>
            </div>
          </div>
        </div>
        <div className="filter-row bottom-row">
          <div className="input-group-inline">
            <input type="text" placeholder="Min ₹" />
            <span className="separator">-</span>
            <input type="text" placeholder="Max ₹" />
          </div>
          <div className="input-group-inline">
            <input type="text" placeholder="Min Kg" />
            <span className="separator">-</span>
            <input type="text" placeholder="Max Kg" />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">No products found in this category.</div>
      ) : (
        <div className="products-grid-full">
          {products.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-link">
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
