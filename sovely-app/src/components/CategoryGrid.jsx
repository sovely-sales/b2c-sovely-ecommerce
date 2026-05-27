import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import './CategoryGrid.css';

export default function CategoryGrid() {
  const { categories, loading } = useData();

  if (loading) return <div>Loading categories...</div>;


  return (
    <section className="section category-section" id="categories-section">
      <div className="container">
        <div className="section-header">
          <div>
            <p className="section-label">Browse by</p>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Explore our wide range of product categories</p>
          </div>
          <Link to="/categories" className="btn btn-outline view-all-btn" id="categories-view-all-btn">
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="category-grid">
          {categories.map((cat, idx) => (
            <Link
              to={`/products?category=${cat.name}`}
              className="category-card"
              key={cat._id}
              id={`category-card-${cat.id}`}
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div className="category-img-wrap">
                <img src={cat.image} alt={cat.name} className="category-img" />
                <div className="category-overlay" style={{ background: `${cat.color}22` }} />
              </div>
              <div className="category-info">
                <div className="category-icon" style={{ background: cat.bg }}>
                  <img src={cat.image} alt={cat.name} className="category-icon-img" />
                </div>
                <div>
                  <p className="category-name">{cat.name}</p>
                  <p className="category-count">{cat.count}</p>
                </div>
                <ArrowRight size={16} className="category-arrow" style={{ color: cat.color }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
