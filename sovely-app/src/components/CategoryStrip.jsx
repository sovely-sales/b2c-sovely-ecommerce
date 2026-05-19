import { useData } from '../context/DataContext';
import './CategoryStrip.css';

export default function CategoryStrip() {
  const { categories, setSelectedCategory } = useData();

  const handleClick = (catName) => {
    setSelectedCategory(catName);
    const el = document.getElementById('all-products-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!categories || categories.length === 0) return null;

  // Show top 12 categories max
  const topCategories = categories.slice(0, 12);

  return (
    <section className="category-strip" id="category-strip">
      <div className="container">
        <div className="strip-scroll">
          {topCategories.map(cat => (
            <button
              key={cat.id}
              className="strip-item"
              onClick={() => handleClick(cat.name)}
            >
              <div className="strip-icon-circle" style={{ background: cat.bg }}>
                <span>{cat.icon}</span>
              </div>
              <span className="strip-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
