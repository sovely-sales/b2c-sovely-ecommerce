import { useMemo, useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import ProductCard from './ProductCard';
import './AllProducts.css';

const PAGE_SIZE = 12;

export default function AllProducts() {
  const { 
    categories, loading,
    selectedCategory, setSelectedCategory,
    searchFilter
  } = useData();

  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Build categoryMap for mapping
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(c => {
      const key = String(c.id || c._id);
      map[key] = c.name;
    });
    return map;
  }, [categories]);

  // Fetch initial page when category or search changes
  useEffect(() => {
    let active = true;
    const fetchInitialProducts = async () => {
      setLoadingProducts(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8014';
      try {
        const queryParams = new URLSearchParams({
          limit: PAGE_SIZE,
          skip: 0,
          category: selectedCategory === 'All' ? '' : selectedCategory,
          search: searchFilter || ''
        });
        const res = await fetch(`${API_URL}/api/products?${queryParams.toString()}`);
        if (res.ok && active) {
          const data = await res.json();
          const mapped = data.map(p => {
            const rawCategory = String(p.categoryId || p.category || '');
            const categoryName = categoryMap[rawCategory] || rawCategory || 'Uncategorized';
            return {
              id: p._id || p.id,
              name: p.title || p.name,
              category: categoryName,
              categoryId: rawCategory,
              price: p.dropshipBasePrice || p.price || 0,
              originalPrice: p.suggestedRetailPrice || p.originalPrice || p.dropshipBasePrice || 0,
              rating: p.averageRating || p.rating || 0,
              reviews: p.reviewCount || p.reviews || 0,
              badge: p.badge || (p.suggestedRetailPrice > p.dropshipBasePrice ? 'Sale' : null),
              badgeColor: p.badgeColor || '#ef4444',
              image: (p.images && p.images.length > 0) ? p.images[0].url : p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
              freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false
            };
          });
          setProductsList(mapped);
          setPage(0);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error('Error fetching initial products:', error);
      } finally {
        if (active) setLoadingProducts(false);
      }
    };

    if (!loading && categories.length > 0) {
      fetchInitialProducts();
    }
    return () => {
      active = false;
    };
  }, [selectedCategory, searchFilter, loading, categories, categoryMap]);

  const handleShowMore = async () => {
    const nextPage = page + 1;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8014';
    try {
      const queryParams = new URLSearchParams({
        limit: PAGE_SIZE,
        skip: nextPage * PAGE_SIZE,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        search: searchFilter || ''
      });
      const res = await fetch(`${API_URL}/api/products?${queryParams.toString()}`);
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
            price: p.dropshipBasePrice || p.price || 0,
            originalPrice: p.suggestedRetailPrice || p.originalPrice || p.dropshipBasePrice || 0,
            rating: p.averageRating || p.rating || 0,
            reviews: p.reviewCount || p.reviews || 0,
            badge: p.badge || (p.suggestedRetailPrice > p.dropshipBasePrice ? 'Sale' : null),
            badgeColor: p.badgeColor || '#ef4444',
            image: (p.images && p.images.length > 0) ? p.images[0].url : p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false
          };
        });
        setProductsList(prev => [...prev, ...mapped]);
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching more products:', error);
    }
  };

  if (loading) return <div className="container" style={{ padding: '80px 0' }}>Loading categories...</div>;

  return (
    <section className="section all-products-section" id="all-products-section">
      <div className="container">

        {/* Section Header */}
        <div className="products-section-header">
          <h2 className="section-title-autorev">Explore Our Products</h2>
          {!loadingProducts && (
            <span className="products-count">
              Showing {productsList.length} products
            </span>
          )}
        </div>
        
        {/* Category Filter Tabs */}
        <div className="category-filter-tabs">
          <button
            className={`filter-chip ${selectedCategory === 'All' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('All')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-chip ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
            >
              <span className="chip-icon">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loadingProducts && productsList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--gray-500)', fontSize: '1rem', fontWeight: '600' }}>
            Loading products...
          </div>
        ) : productsList.length > 0 ? (
          <>
            <div className="all-products-grid">
              {productsList.map((product) => (
                <div key={product.id} className="grid-card-wrapper">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            
            {/* Show More Button */}
            {hasMore && (
              <div className="show-more-container">
                <button className="show-more-btn" onClick={handleShowMore}>
                  Show More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products-state">
            <span className="no-products-emoji">🔍</span>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter to find what you're looking for.</p>
            <button className="reset-filters-btn" onClick={() => setSelectedCategory('All')}>
              Show All Products
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
