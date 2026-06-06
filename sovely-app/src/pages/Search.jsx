import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import ProductCard from "../components/ProductCard";
import "./Products.css";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8014";
      try {
        const res = await fetch(
          `${API_URL}/api/products?search=${encodeURIComponent(query)}`,
        );
        if (res.ok) {
          const data = await res.json();

          const mappedResults = data.map((p) => ({
            id: p._id || p.id,
            name: p.title || p.name,
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
            image: p.images && p.images.length > 0 ? p.images[0].url : p.image,
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false,
          }));
          setResults(mappedResults);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
    window.scrollTo(0, 0);
  }, [query]);

  return (
    <div
      className="section container animate-fadeUp"
      style={{ minHeight: "70vh" }}
    >
      <div style={{ marginBottom: "40px" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2.5rem",
            textTransform: "uppercase",
            fontWeight: "900",
            marginBottom: "8px",
          }}
        >
          Search Results
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        >
          {loading
            ? "Searching..."
            : `${results.length} results found for "${query}"`}
        </p>
      </div>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "100px 0",
          }}
        >
          <div className="spin">
            <SearchIcon size={40} color="var(--primary)" />
          </div>
        </div>
      ) : results.length === 0 ? (
        <div
          className="glass"
          style={{
            textAlign: "center",
            padding: "80px 20px",
            maxWidth: "600px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <SearchIcon
            size={64}
            style={{ color: "var(--text-muted)", marginBottom: "24px" }}
          />
          <h2
            style={{
              fontSize: "2rem",
              textTransform: "uppercase",
              fontWeight: "900",
              marginBottom: "16px",
            }}
          >
            No products found
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontWeight: "600",
              marginBottom: "32px",
              fontSize: "1.1rem",
            }}
          >
            We couldn't find anything matching "{query}". Try checking your
            spelling or using more general terms.
          </p>
          <Link to="/products" className="btn btn-primary">
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="all-products-grid">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
