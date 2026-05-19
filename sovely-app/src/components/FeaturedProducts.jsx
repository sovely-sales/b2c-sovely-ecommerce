import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import ProductCard from './ProductCard';
import './FeaturedProducts.css';

export default function FeaturedProducts() {
  const { products, loading, addToCart } = useData();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (products && products.length > 0) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  if (loading) return <div className="container">Loading featured products...</div>;
  if (!products || products.length === 0) return null;

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    for (let i = 0; i < qty; i++) {
      addToCart(selectedProduct);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="section featured-section" id="featured-products-section">
      <div className="container">
        
        {/* Title */}
        <h2 className="section-title-autorev">You may also like...</h2>

        <div className="featured-layout-wrapper">
          {/* Left Side: Product Cards Grid */}
          <div className="featured-grid-container">
            <div className="autorev-products-grid">
              {products.slice(0, 3).map((product) => (
                <div 
                  key={product.id} 
                  onMouseEnter={() => setSelectedProduct(product)}
                  onClick={() => setSelectedProduct(product)}
                  className={`grid-item-wrap ${selectedProduct?.id === product.id ? 'active' : ''}`}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Floating/Featured Product Detail Card */}
          {selectedProduct && (
            <div className="featured-preview-panel">
              <div className="preview-card">
                <div className="preview-breadcrumbs">
                  HOME / {selectedProduct.category?.toUpperCase() || 'PRODUCT'} / {selectedProduct.name?.split(' ')[0]?.toUpperCase()}
                </div>
                
                <div className="preview-stock-badge">
                  {selectedProduct.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                </div>

                <div className="preview-image-wrap">
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                </div>

                <div className="preview-details">
                  <div className="preview-category">
                    {selectedProduct.category || 'General'}
                  </div>
                  <h3 className="preview-title">{selectedProduct.name}</h3>
                  
                  <div className="preview-prices">
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="preview-original-price">₹{selectedProduct.originalPrice}</span>
                    )}
                    <span className="preview-price">₹{selectedProduct.price}</span>
                  </div>

                  <div className="preview-actions">
                    <div className="qty-selector-autorev">
                      <span>{qty} BULK</span>
                      <div className="qty-arrows">
                        <button onClick={() => setQty(q => q + 1)}><ChevronUp size={14} /></button>
                        <button onClick={() => setQty(q => q > 1 ? q - 1 : 1)}><ChevronDown size={14} /></button>
                      </div>
                    </div>

                    <button 
                      className={`preview-add-btn ${added ? 'added' : ''}`}
                      onClick={handleAddToCart}
                      disabled={selectedProduct.stock === 0}
                    >
                      {added ? '✓ ADDED' : 'ADD TO CART →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
