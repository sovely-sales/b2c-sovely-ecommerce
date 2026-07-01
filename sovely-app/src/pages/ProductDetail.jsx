import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useData } from "../context/DataContext";
import ProductCard from "../components/ProductCard";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams();
  const {
    products,
    loading: contextLoading,
    addToCart,
    categories,
    user,
    wishlist,
    toggleWishlist,
  } = useData();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [productReviews, setProductReviews] = useState([]);

  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const timerRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Reset state when ID changes
    setLoading(true);
    setQuantity(1);

    const found = products.find((p) => p.id.toString() === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.image);
      setProductReviews(found.reviewsList || []);
      document.title = `${found.name} | Sovely`;
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      const API_URL = import.meta.env.VITE_API_URL;

      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
          // ... (Your identical mapping logic)
          const categoryMap = {};
          categories.forEach((c) => {
            categoryMap[String(c.id || c._id)] = c.name;
          });
          const rawCategory = String(p.categoryId || p.category || "");
          const categoryName =
            categoryMap[rawCategory] || rawCategory || "Uncategorized";

          const activeImg =
            p.images && p.images.length > 0
              ? p.images[0].url
              : p.image ||
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";

          const mappedProduct = {
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
            image: activeImg,
            images:
              p.images && p.images.length > 0
                ? p.images
                : p.image
                  ? [{ url: p.image }]
                  : [],
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false,
          };

          setProduct(mappedProduct);
          setProductReviews(p.reviewsList || []);
          setActiveImage(activeImg);
          document.title = `${mappedProduct.name} | Sovely`;
        }
      } catch (error) {
        console.error("Error fetching product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!contextLoading) {
      fetchProduct();
    }
  }, [id, products, contextLoading, categories]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 2000);
  };

  const formatPrice = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setSubmitError("You must be logged in to leave a review.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("userToken");

    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: ratingInput, comment: commentInput }),
      });

      const data = await res.json();
      if (res.ok) {
        setProductReviews(data.product.reviewsList);
        setCommentInput("");
        setRatingInput(5);
        setProduct((prev) => ({
          ...prev,
          rating: data.product.rating,
          reviews: data.product.reviews,
        }));
      } else {
        setSubmitError(data.message || "Failed to submit review");
      }
    } catch (err) {
      setSubmitError("Server error.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (loading)
    return (
      <div
        className="section container"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="empty-state">Loading product details...</div>
      </div>
    );

  if (!product)
    return (
      <div
        className="section container"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="empty-state">
          Product not found. <Link to="/products">Back to products</Link>
        </div>
      </div>
    );

  let recommendations = products.filter(
    (p) => p.category === product.category && p.id.toString() !== id,
  );
  if (recommendations.length < 8) {
    const additional = products.filter(
      (p) =>
        p.id.toString() !== id && !recommendations.some((r) => r.id === p.id),
    );
    recommendations = [...recommendations, ...additional].slice(0, 8);
  } else {
    recommendations = recommendations.slice(0, 8);
  }

  const discount = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100,
  );

  return (
    <div className="product-detail-page section container">
      {}
      <div className="pd-grid">
        <div className="pd-image-section">
          <div className="pd-main-img-wrap">
            <img
              src={activeImage || product.image}
              alt={product.name}
              className="pd-main-img"
            />
            {product.badge && (
              <span
                className="pd-badge"
                style={{ backgroundColor: product.badgeColor }}
              >
                {product.badge}
              </span>
            )}
          </div>

          {product.images && product.images.length > 0 && (
            <div className="pd-thumbnails">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  className={`pd-thumb-wrap ${activeImage === img.url ? "active" : ""}`}
                  onClick={() => setActiveImage(img.url)}
                  type="button"
                  aria-label={`View image ${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info-section">
          <p className="pd-category">{product.category}</p>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-price-row">
            <span className="pd-price">{formatPrice(product.price)}</span>
            <span className="pd-original-price">
              {formatPrice(product.originalPrice)}
            </span>
            {discount > 0 && (
              <span className="pd-discount">{discount}% OFF</span>
            )}
          </div>

          <p className="pd-desc">
            Experience premium quality with the {product.name}. Carefully
            crafted for maximum satisfaction and durability. Perfect for your
            everyday needs.
          </p>

          <div className="pd-actions">
            <div className="pd-qty">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span aria-label="Quantity">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <div className="pd-btn-group">
              <button
                className={`btn btn-primary pd-cart-btn ${added ? "added" : ""}`}
                onClick={handleAddToCart}
                aria-live="polite"
              >
                <ShoppingCart size={18} style={{ marginRight: "8px" }} />
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button
                className={`btn btn-outline pd-wishlist-btn ${wishlist.includes(String(product.id)) ? "active" : ""}`}
                onClick={() => toggleWishlist(product.id)}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={18}
                  fill={
                    wishlist.includes(String(product.id)) ? "#ef4444" : "none"
                  }
                  color={
                    wishlist.includes(String(product.id))
                      ? "#ef4444"
                      : "currentColor"
                  }
                />
              </button>
            </div>
          </div>

          {}
          <div className="pd-trust">
            <div className="trust-item">
              <Truck size={20} />
              <span>
                {product.freeDelivery ? "Free Delivery" : "Standard Delivery"}
              </span>
            </div>
            <div className="trust-item">
              <Shield size={20} />
              <span>1 Year Warranty</span>
            </div>
            <div className="trust-item">
              <RotateCcw size={20} />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pd-reviews-section">{}</div>
      {recommendations.length > 0 && (
        <div className="pd-recommendations">
          <h2 className="recommendations-title">You May Also Like</h2>
          <div className="recommendations-scroll-container">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
