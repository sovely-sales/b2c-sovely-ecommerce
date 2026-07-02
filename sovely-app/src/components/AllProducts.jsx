import { useMemo, useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import ProductCard from "./ProductCard";
import "./AllProducts.css";

const PAGE_SIZE = 12;

export default function AllProducts() {
  const {
    categories,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchFilter,
  } = useData();

  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("latest");

  const handleApplyFilters = () => {
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setSortOption("latest");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleApplyFilters();
    }
  };

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
    const fetchInitialProducts = async () => {
      setLoadingProducts(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8014";
      try {
        const queryParams = new URLSearchParams({
          limit: PAGE_SIZE,
          skip: 0,
          category: selectedCategory === "All" ? "" : selectedCategory,
          search: searchFilter || "",
          minPrice: appliedMinPrice,
          maxPrice: appliedMaxPrice,
          sort: sortOption,
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
              price: p.price !== undefined ? p.price : (p.dropshipBasePrice || 0) + 30,
              originalPrice: p.originalPrice !== undefined ? p.originalPrice : (p.suggestedRetailPrice || p.dropshipBasePrice || 0) + 30,
              rating: p.averageRating || p.rating || 0,
              reviews: p.reviewCount || p.reviews || 0,
              badge: p.badge || ((p.originalPrice || p.suggestedRetailPrice) > (p.price || p.dropshipBasePrice) ? 'Sale' : null),
              badgeColor: p.badgeColor || '#ef4444',
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
            stock: p.inventory?.stock,
            };
          });
          const sortedList = [...mapped].sort((a, b) => {
            const stockA = a.stock === 0 ? 0 : 1;
            const stockB = b.stock === 0 ? 0 : 1;
            return stockB - stockA;
          });
          setProductsList(sortedList);
          setPage(0);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (error) {
        console.error("Error fetching initial products:", error);
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
  }, [
    selectedCategory,
    searchFilter,
    appliedMinPrice,
    appliedMaxPrice,
    sortOption,
    loading,
    categories,
    categoryMap,
  ]);

  const handleShowMore = async () => {
    const nextPage = page + 1;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8014";
    try {
      const queryParams = new URLSearchParams({
        limit: PAGE_SIZE,
        skip: nextPage * PAGE_SIZE,
        category: selectedCategory === "All" ? "" : selectedCategory,
        search: searchFilter || "",
        minPrice: appliedMinPrice,
        maxPrice: appliedMaxPrice,
        sort: sortOption,
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
            price: p.price !== undefined ? p.price : (p.dropshipBasePrice || 0) + 30,
              originalPrice: p.originalPrice !== undefined ? p.originalPrice : (p.suggestedRetailPrice || p.dropshipBasePrice || 0) + 30,
              rating: p.averageRating || p.rating || 0,
              reviews: p.reviewCount || p.reviews || 0,
              badge: p.badge || ((p.originalPrice || p.suggestedRetailPrice) > (p.price || p.dropshipBasePrice) ? 'Sale' : null),
              badgeColor: p.badgeColor || '#ef4444',
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
            stock: p.inventory?.stock,
          };
        });
        const sortedList = [...mapped].sort((a, b) => {
          const stockA = a.stock === 0 ? 0 : 1;
          const stockB = b.stock === 0 ? 0 : 1;
          return stockB - stockA;
        });
        setProductsList((prev) => [...prev, ...sortedList]);
        setPage(nextPage);
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (error) {
      console.error("Error fetching more products:", error);
    }
  };

  if (loading)
    return (
      <div className="container" style={{ padding: "80px 0" }}>
        Loading categories...
      </div>
    );

  return (
    <section className="section all-products-section" id="all-products-section">
      <div className="container">
        {}
        <div className="products-section-header">
          <h2 className="section-title-autorev">Explore Our Products</h2>
          {!loadingProducts && (
            <span className="products-count">
              Showing {productsList.length} products
            </span>
          )}
        </div>

        {/* Price & Sort Filter Bar */}
        <div className="price-filter-bar">
          <div className="price-filter-section">
            <span className="price-filter-title">Price Range:</span>
            <div className="price-input-wrapper">
              <div className="price-field-group">
                <span className="price-currency">₹</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Min Price"
                />
              </div>
              <span className="price-range-to">to</span>
              <div className="price-field-group">
                <span className="price-currency">₹</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Max Price"
                />
              </div>
              <button className="price-btn-apply" onClick={handleApplyFilters}>
                Apply
              </button>
              {(appliedMinPrice || appliedMaxPrice || minPrice || maxPrice || sortOption !== "latest") && (
                <button className="price-btn-clear" onClick={handleClearFilters}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="sort-select-wrapper">
            <span className="price-filter-title">Sort:</span>
            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Sort products"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="popularity">Top Customer Rating</option>
              <option value="reviews">Most Reviewed</option>
              <option value="nameAsc">Name: A to Z</option>
              <option value="nameDesc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {}
        {loadingProducts && productsList.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "var(--gray-500)",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
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

            {}
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
            <p>
              Try adjusting your search or filter to find what you're looking
              for.
            </p>
            <button
              className="reset-filters-btn"
              onClick={() => {
                setSelectedCategory("All");
                handleClearFilters();
              }}
            >
              Show All Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
