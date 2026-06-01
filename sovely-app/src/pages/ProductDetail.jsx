import { useState, useEffect } from "react";
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

  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productReviews, setProductReviews] = useState([]);

  useEffect(() => {
    const found = products.find((p) => p.id.toString() === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.image);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      // RESTORED: Fixed the stripped http://
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8014";

      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const p = await res.json();
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

          setProduct({
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
            image: activeImg,
            images:
              p.images && p.images.length > 0
                ? p.images
                : p.image
                  ? [{ url: p.image }]
                  : [],
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false,
          });
          setProductReviews(p.reviewsList || []);
          setActiveImage(activeImg);
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
    setTimeout(() => setAdded(false), 2000);
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

    // RESTORED: Fixed the stripped http://
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8014";
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
        // Update local rating state to reflect new average
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

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading)
    return (
      <div className="section container">
        <div className="empty-state">Loading product details...</div>
      </div>
    );
  if (!product)
    return (
      <div className="section container">
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
      <div className="pd-grid">
        {}
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

        {}
        <div className="pd-info-section">
          <p className="pd-category">{product.category}</p>
          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating">
            <div className="stars">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < Math.floor(product.rating) ? "#eab308" : "none"}
                  stroke={
                    i < Math.floor(product.rating) ? "#eab308" : "#d1d5db"
                  }
                />
              ))}
            </div>
            <span className="pd-rating-val">{product.rating.toFixed(1)}</span>
            <span className="pd-reviews">({product.reviews} reviews)</span>
          </div>

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
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <div className="pd-btn-group">
              <button
                className={`btn btn-primary pd-cart-btn ${added ? "added" : ""}`}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} style={{ marginRight: "8px" }} />
                {added ? "Added to Cart!" : "Add to Cart"}
              </button>
              <button
                className={`btn btn-outline pd-wishlist-btn ${wishlist.includes(String(product.id)) ? "active" : ""}`}
                onClick={() => toggleWishlist(product.id)}
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

      {}
      <div className="pd-reviews-section">
        <h2 className="reviews-title">Customer Reviews</h2>

        <div className="reviews-grid">
          <div className="review-form-container">
            <h3>Write a Review</h3>
            {user ? (
              <form onSubmit={submitReview} className="review-form">
                <div className="rating-select">
                  <label>Rating</label>
                  <div className="star-rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={24}
                        fill={star <= ratingInput ? "#eab308" : "none"}
                        stroke={star <= ratingInput ? "#eab308" : "#d1d5db"}
                        onClick={() => setRatingInput(star)}
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </div>
                </div>

                <div className="comment-input">
                  <label>Your Review</label>
                  <textarea
                    rows="4"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="What did you think about this product?"
                    required
                  ></textarea>
                </div>

                {submitError && <p className="review-error">{submitError}</p>}

                <button
                  type="submit"
                  className="btn btn-primary submit-review-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="login-prompt">
                <p>
                  Please{" "}
                  <Link
                    to="/login"
                    style={{ color: "var(--primary)", fontWeight: "bold" }}
                  >
                    Sign In
                  </Link>{" "}
                  to write a review.
                </p>
              </div>
            )}
          </div>

          <div className="reviews-list">
            {productReviews.length === 0 ? (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              productReviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <strong>{review.userName}</strong>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="review-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < review.rating ? "#eab308" : "none"}
                        stroke={i < review.rating ? "#eab308" : "#d1d5db"}
                      />
                    ))}
                  </div>
                  <p className="review-text">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {}
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
