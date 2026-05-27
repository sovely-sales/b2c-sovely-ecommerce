import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import '../components/CategoryGrid.css'; // Reuse some grid CSS
import './Categories.css';

export default function Categories() {
  const { categories, loading } = useData();
  
  if (loading) return <div className="categories-page section container">Loading categories...</div>;

  return (
    <div className="categories-page section container">
      <div className="page-header">
        <h1 className="page-title">All Categories</h1>
        <p className="page-subtitle">Find exactly what you're looking for</p>
      </div>

      <div className="category-grid-full">
          {categories.map((cat, idx) => (
            <Link
              to={`/products?category=${cat.name}`}
              className="category-card"
              key={cat._id}
              style={{ animationDelay: `${idx * 0.05}s` }}
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
  );
}
