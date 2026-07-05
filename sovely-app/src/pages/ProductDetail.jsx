import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Lock,
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

  // Touch Swipe State
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);

    const found = products.find((p) => p.id.toString() === id);
    if (found) {
      setProduct(found);
      setActiveImage(found.image);
      setProductReviews(found.reviewsList || []);
      document.title = `${found.name} | Sovely`;
      setLoading(false);
    }

    const fetchProduct = async () => {
      const API_URL = import.meta.env.VITE_API_URL;
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

          const mappedProduct = {
            id: p._id || p.id,
            name: p.title || p.name,
            category: categoryName,
            categoryId: rawCategory,
            price:
              p.price !== undefined ? p.price : (p.dropshipBasePrice || 0) + 30,
            originalPrice:
              p.originalPrice !== undefined
                ? p.originalPrice
                : (p.suggestedRetailPrice || p.dropshipBasePrice || 0) + 30,
            rating: p.averageRating || p.rating || 0,
            reviews: p.reviewCount || p.reviews || 0,
            badge:
              p.badge ||
              ((p.originalPrice || p.suggestedRetailPrice) >
              (p.price || p.dropshipBasePrice)
                ? "Sale"
                : null),
            badgeColor: p.badgeColor || "#ef4444",
            image: activeImg,
            images:
              p.images && p.images.length > 0
                ? p.images
                : p.image
                  ? [{ url: p.image }]
                  : [],
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false,
            stock: p.inventory?.stock,
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

    if (!contextLoading) fetchProduct();
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

  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (
      !touchStartX ||
      !touchEndX ||
      !product?.images ||
      product.images.length <= 1
    )
      return;
    const distance = touchStartX - touchEndX;
    const currentIndex = product.images.findIndex(
      (img) => img.url === activeImage,
    );

    if (currentIndex === -1) return;

    if (distance > 50) {
      const nextIndex = (currentIndex + 1) % product.images.length;
      setActiveImage(product.images[nextIndex].url);
    }
    if (distance < -50) {
      const prevIndex =
        (currentIndex - 1 + product.images.length) % product.images.length;
      setActiveImage(product.images[prevIndex].url);
    }
  };

  if (loading)
    return (
      <div className="section container pd-loading-state">
        <div className="empty-state">Loading product details...</div>
      </div>
    );

  if (!product)
    return (
      <div className="section container pd-loading-state">
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
    <div className="product-detail-page">
      <div className="pd-grid">
        <div className="pd-image-section">
          <div
            className="pd-main-img-wrap"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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
            {product.stock === 0 && (
              <span className="pd-discount out-of-stock-badge">
                OUT OF STOCK
              </span>
            )}
          </div>

          <p className="pd-desc">
            Experience premium quality with the {product.name}. Carefully
            crafted for maximum satisfaction and durability. Perfect for your
            everyday needs.
          </p>

          <div className="pd-actions">
            {product.stock > 0 && (
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
            )}
            <div
              className={`pd-btn-group ${product.stock === 0 ? "full-width" : ""}`}
            >
              {product.stock > 0 ? (
                <button
                  className={`btn btn-primary pd-cart-btn ${added ? "added" : ""}`}
                  onClick={handleAddToCart}
                  aria-live="polite"
                >
                  <ShoppingCart size={18} className="icon-mr" />
                  {added ? "Added to Cart!" : "Add to Cart"}
                </button>
              ) : (
                <button
                  className={`btn btn-primary pd-cart-btn ${wishlist.includes(String(product.id)) ? "wishlisted-btn" : ""}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-live="polite"
                >
                  <Heart size={18} className="icon-mr" />
                  {wishlist.includes(String(product.id))
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
                </button>
              )}
              {product.stock > 0 && (
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
              )}
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
              <span>Premium Quality</span>
            </div>
            <div className="trust-item">
              <RotateCcw size={20} />
              <span>Easy Returns</span>
            </div>
            <div className="trust-item">
              <Star size={20} />
              <span>Trusted Brands</span>
            </div>
            <div className="trust-item">
              <Lock size={20} />
              <span>Razorpay Secured</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="pd-reviews-section">
        <h2 className="reviews-section-title">Customer Reviews</h2>
        
        <div className="reviews-grid">
          {/* Reviews List */}
          <div className="reviews-list">
            {productReviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to write a review!</p>
            ) : (
              productReviews.map((rev, index) => (
                <div key={rev._id || index} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{rev.userName}</span>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < rev.rating ? "#ec4899" : "none"}
                          color={i < rev.rating ? "#ec4899" : "currentColor"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Review Submission Form */}
          <div className="review-form-container">
            <h3>Share Your Thoughts</h3>
            {user ? (
              productReviews.some((rev) => String(rev.userId) === String(user.id)) ? (
                <div className="already-reviewed-msg">
                  <Lock size={16} className="icon-mr" />
                  You have already reviewed this product.
                </div>
              ) : (
                <form onSubmit={submitReview} className="review-form">
                  <div className="form-group">
                    <label>Rating:</label>
                    <div className="star-rating-input">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setRatingInput(star)}
                          className={`star-btn ${star <= ratingInput ? "active" : ""}`}
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star
                            size={20}
                            fill={star <= ratingInput ? "#ec4899" : "none"}
                            color={star <= ratingInput ? "#ec4899" : "currentColor"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="review-comment">Your Review:</label>
                    <textarea
                      id="review-comment"
                      rows="4"
                      placeholder="Write your review here..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  {submitError && <div className="error-alert">{submitError}</div>}
                  <button
                    type="submit"
                    className="btn btn-primary submit-review-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </form>
              )
            ) : (
              <div className="login-prompt-msg">
                <p>Please log in to write a review for this product.</p>
                <Link to="/login" className="btn btn-outline login-link-btn">
                  Log In / Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

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
