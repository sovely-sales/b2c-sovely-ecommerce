import { useLocation, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, Filter, LayoutGrid, List } from "lucide-react";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import "./Products.css";

const PAGE_SIZE = 24;

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Interactive Dropdowns & Inputs state
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState("latest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categoryRef = useRef(null);
  const sortRef = useRef(null);

  const sortLabels = {
    latest: "Latest",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    popularity: "Popularity",
  };

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      const key = String(c.id || c._id);
      map[key] = c.name;
    });
    return map;
  }, [categories]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch products with active filters
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
          minPrice: minPrice || "",
          maxPrice: maxPrice || "",
          sort: sortOption || "latest",
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
              price: (p.dropshipBasePrice || p.price || 0) + 30,
              originalPrice:
                (p.suggestedRetailPrice ||
                  p.originalPrice ||
                  p.dropshipBasePrice ||
                  0) + 30,
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
      // Debounce price input filtering by 300ms
      const timer = setTimeout(() => {
        fetchProducts();
      }, 300);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
    return () => {
      active = false;
    };
  }, [categoryFilter, minPrice, maxPrice, sortOption, contextLoading, categories, categoryMap]);

  const handleShowMore = async () => {
    const nextPage = page + 1;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8014";
    try {
      const queryParams = new URLSearchParams({
        limit: PAGE_SIZE,
        skip: nextPage * PAGE_SIZE,
        category: categoryFilter || "",
        minPrice: minPrice || "",
        maxPrice: maxPrice || "",
        sort: sortOption || "latest",
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
            price: (p.dropshipBasePrice || p.price || 0) + 30,
            originalPrice:
              (p.suggestedRetailPrice ||
                p.originalPrice ||
                p.dropshipBasePrice ||
                0) + 30,
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

  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setSortOption("latest");
    setShowCategoryDropdown(false);
    setShowSortDropdown(false);
    navigate("/products");
  };

  if (loading && products.length === 0)
    return (
      <div className="products-page section container">Loading products...</div>
    );

  return (
    <div className="products-page section container">
      {/* Filter Bar */}
      <div className="retail-filter-bar">
        <div className="filter-row top-row">
          <div className="filter-dropdowns">
            {/* Category Dropdown */}
            <div className="dropdown-container" ref={categoryRef}>
              <div
                className={`custom-select ${categoryFilter ? "active-select" : ""}`}
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowSortDropdown(false);
                }}
              >
                <span>{categoryFilter || "All Categories"}</span>
                <ChevronDown size={14} />
              </div>
              {showCategoryDropdown && (
                <div className="dropdown-menu">
                  <div
                    className={`dropdown-item ${!categoryFilter ? "active" : ""}`}
                    onClick={() => {
                      navigate("/products");
                      setShowCategoryDropdown(false);
                    }}
                  >
                    All Categories
                  </div>
                  {categories.map((c) => (
                    <div
                      key={c.id || c._id}
                      className={`dropdown-item ${categoryFilter === c.name ? "active" : ""}`}
                      onClick={() => {
                        navigate(`/products?category=${encodeURIComponent(c.name)}`);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-actions">
            <button className="clear-btn" onClick={handleClearAll}>
              <Filter size={14} /> Clear
            </button>
            <div className="sort-group">
              <span className="sort-label">SORT</span>
              {/* Sort Dropdown */}
              <div className="dropdown-container" ref={sortRef}>
                <div
                  className="custom-select sort-select"
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <span>{sortLabels[sortOption]}</span>
                  <ChevronDown size={14} />
                </div>
                {showSortDropdown && (
                  <div className="dropdown-menu">
                    {Object.entries(sortLabels).map(([key, value]) => (
                      <div
                        key={key}
                        className={`dropdown-item ${sortOption === key ? "active" : ""}`}
                        onClick={() => {
                          setSortOption(key);
                          setShowSortDropdown(false);
                        }}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                )}
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
            <input
              type="number"
              placeholder="Min ₹"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="separator">-</span>
            <input
              type="number"
              placeholder="Max ₹"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">No products found matching filters.</div>
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
