import { useLocation, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Filter, LayoutGrid, List } from "lucide-react";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import "./Products.css";

const PAGE_SIZE = 24;

export default function Products() {
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const categoryFilter = queryParams.get("category");

  const { categories, loading: contextLoading } = useData();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      const key = String(c.id || c._id);
      map[key] = c.name;
    });
    return map;
  }, [categories]);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8014";
      try {
        const queryParams = new URLSearchParams({
          limit: PAGE_SIZE,
          skip: 0,
          category: categoryFilter || "",
        });
        const res = await fetch(
          `${API_URL}/api/products?${queryParams.toString()}`,
        );
        if (res.ok && active) {
          const data = await res.json();
          const mapped = data.map((p) => {
            const rawCategory = String(p.categoryId || p.category || "");
            const categoryName =
              categoryMap[rawCategory] || rawCategory || "Uncategorized";
            return {
              id: p._id || p.id,
              name: p.title || p.name,
              category: categoryName,
              categoryId: rawCategory,
              price: p.dropshipBasePrice || p.price || 0,
              originalPrice:
                p.suggestedRetailPrice ||
                p.originalPrice ||
                p.dropshipBasePrice ||
                0,
              rating: p.averageRating || p.rating || 0,
              reviews: p.reviewCount || p.reviews || 0,
              badge:
                p.badge ||
                (p.suggestedRetailPrice > p.dropshipBasePrice ? "Sale" : null),
              badgeColor: p.badgeColor || "#ef4444",
              image:
                p.images && p.images.length > 0
                  ? p.images[0].url
                  : p.image ||
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
              images:
                p.images && p.images.length > 0
                  ? p.images
                  : p.image
                    ? [{ url: p.image }]
                    : [],
              freeDelivery:
                p.freeDelivery !== undefined ? p.freeDelivery : false,
            };
          });
          setProducts(mapped);
          setPage(0);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error("Error fetching products page:", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (!contextLoading && categories.length > 0) {
      fetchProducts();
    }
    return () => {
      active = false;
    };
  }, [categoryFilter, contextLoading, categories, categoryMap]);

  const handleShowMore = async () => {
    const nextPage = page + 1;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8014";
    try {
      const queryParams = new URLSearchParams({
        limit: PAGE_SIZE,
        skip: nextPage * PAGE_SIZE,
        category: categoryFilter || "",
      });
      const res = await fetch(
        `${API_URL}/api/products?${queryParams.toString()}`,
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((p) => {
          const rawCategory = String(p.categoryId || p.category || "");
          const categoryName =
            categoryMap[rawCategory] || rawCategory || "Uncategorized";
          return {
            id: p._id || p.id,
            name: p.title || p.name,
            category: categoryName,
            categoryId: rawCategory,
            price: p.dropshipBasePrice || p.price || 0,
            originalPrice:
              p.suggestedRetailPrice ||
              p.originalPrice ||
              p.dropshipBasePrice ||
              0,
            rating: p.averageRating || p.rating || 0,
            reviews: p.reviewCount || p.reviews || 0,
            badge:
              p.badge ||
              (p.suggestedRetailPrice > p.dropshipBasePrice ? "Sale" : null),
            badgeColor: p.badgeColor || "#ef4444",
            image:
              p.images && p.images.length > 0
                ? p.images[0].url
                : p.image ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
            images:
              p.images && p.images.length > 0
                ? p.images
                : p.image
                  ? [{ url: p.image }]
                  : [],
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false,
          };
        });
        setProducts((prev) => [...prev, ...mapped]);
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error("Error fetching more products page:", error);
    }
  };

  if (loading && products.length === 0)
    return (
      <div className="products-page section container">Loading products...</div>
    );

  return (
    <div className="products-page section container">
      {}
      <div className="b2b-filter-bar">
        <div className="filter-row top-row">
          <div className="filter-dropdowns">
            <div className="custom-select active-select">
              <span>{categoryFilter || "Hardware"}</span>
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
            <button className="clear-btn">
              <Filter size={14} /> Clear
            </button>
            <div className="sort-group">
              <span className="sort-label">SORT</span>
              <div className="custom-select sort-select">
                <span>Latest</span>
                <ChevronDown size={14} />
              </div>
            </div>
            <div className="product-count">
              <span>{products.length}</span>
              <br />
              Products
            </div>
            <div className="view-toggle">
              <button className="view-btn active">
                <LayoutGrid size={16} />
              </button>
              <button className="view-btn">
                <List size={16} />
              </button>
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
        <>
          <div className="products-grid-full">
            {products.map((product) => (
              <div key={product.id} className="product-link">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {hasMore && (
            <div
              className="show-more-container"
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "48px",
              }}
            >
              <button className="show-more-btn" onClick={handleShowMore}>
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
