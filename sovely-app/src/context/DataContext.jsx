import { createContext, useContext, useState, useEffect } from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("userData");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData, token) => {
    const storageKey = userData.role === "admin" ? "adminToken" : "userToken";
    localStorage.setItem(storageKey, token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userData");
    setUser(null);
  };

  const updateQuantity = (id, delta) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const [coupon, setCoupon] = useState(null);
  const [couponPercent, setCouponPercent] = useState(0);

  // Simple frontend-only coupon management (bypasses backend API)
  const [availableCoupons, setAvailableCoupons] = useState(() => {
    const saved = localStorage.getItem("sovely_coupons");
    if (saved) return JSON.parse(saved);
    return [
      { _id: "1", code: "SAVE10", discountPercent: 10, isActive: true, timesUsed: 0, usageLimit: null, expirationDate: null },
      { _id: "2", code: "WELCOME20", discountPercent: 20, isActive: true, timesUsed: 0, usageLimit: null, expirationDate: null }
    ];
  });

  const saveCoupons = (newCoupons) => {
    setAvailableCoupons(newCoupons);
    localStorage.setItem("sovely_coupons", JSON.stringify(newCoupons));
  };

  const addCoupon = (newCoupon) => {
    const couponToSave = {
      ...newCoupon,
      _id: Date.now().toString(),
      isActive: true,
      timesUsed: 0
    };
    saveCoupons([couponToSave, ...availableCoupons]);
  };

  const toggleCoupon = (id) => {
    saveCoupons(availableCoupons.map(c => c._id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const deleteCoupon = (id) => {
    saveCoupons(availableCoupons.filter(c => c._id !== id));
  };

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  
  const couponDiscount = coupon && couponPercent > 0 ? Math.round(cartSubtotal * (couponPercent / 100)) : 0;
  const cartDelivery = cartSubtotal > 999 ? 0 : 50;
  const cartTotal = cartSubtotal - couponDiscount + cartDelivery;

  useEffect(() => {
    if (user && user.role !== "admin") {
      const fetchWishlist = async () => {
        const token = localStorage.getItem("userToken");
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8014";
        try {
          const res = await fetch(`${API_URL}/api/user/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setWishlist(data);
          }
        } catch (err) {
          console.error("Failed to load wishlist");
        }
      };
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) return;

    const stringId = String(productId);

    setWishlist((prev) =>
      prev.includes(stringId)
        ? prev.filter((id) => id !== stringId)
        : [...prev, stringId],
    );

    const token = localStorage.getItem("userToken");
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8014";

    try {
      await fetch(`${API_URL}/api/user/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: stringId }),
      });
    } catch (err) {
      console.error("Wishlist sync failed");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8014";
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/products?limit=12`),
          fetch(`${API_URL}/api/categories`),
        ]);

        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();

          const categoryMap = {};
          categoriesData.forEach((c) => {
            const key = String(c._id || c.id);
            categoryMap[key] = c.name;
          });

          const mappedProducts = productsData.map((p) => {
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

          const colors = [
            { color: "#22c55e", bg: "#f0fdf4", icon: "🥦" },
            { color: "#3b82f6", bg: "#eff6ff", icon: "📱" },
            { color: "#ec4899", bg: "#fdf2f8", icon: "👗" },
            { color: "#f97316", bg: "#fff7ed", icon: "🏠" },
            { color: "#a855f7", bg: "#faf5ff", icon: "💄" },
            { color: "#14b8a6", bg: "#f0fdfa", icon: "⚽" },
          ];

          const getCategoryImage = (name) => {
            const lower = (name || "").toLowerCase();
            if (lower.includes("sport") || lower.includes("fitness")) {
              return "/sports.png";
            }
            if (lower.includes("garden") || lower.includes("outdoor")) {
              return "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("electronic") ||
              lower.includes("phone") ||
              lower.includes("tech") ||
              lower.includes("gadget") ||
              lower.includes("mobile")
            ) {
              return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("fashion") ||
              lower.includes("apparel") ||
              lower.includes("cloth") ||
              lower.includes("dress") ||
              lower.includes("wear")
            ) {
              return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop";
            }
            if (lower.includes("kitchen") || lower.includes("appliance")) {
              return "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("home") ||
              lower.includes("decor") ||
              lower.includes("furnit") ||
              lower.includes("table") ||
              lower.includes("bath")
            ) {
              return "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("beauty") ||
              lower.includes("personal") ||
              lower.includes("makeup") ||
              lower.includes("cosmetic") ||
              lower.includes("health") ||
              lower.includes("care")
            ) {
              return "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("bag") ||
              lower.includes("wallet") ||
              lower.includes("luggage") ||
              lower.includes("travel") ||
              lower.includes("suitcase")
            ) {
              return "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("car") ||
              lower.includes("motorbike") ||
              lower.includes("vehicle") ||
              lower.includes("auto")
            ) {
              return "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("tool") ||
              lower.includes("hardware") ||
              lower.includes("improve")
            ) {
              return "https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("stationery") ||
              lower.includes("book") ||
              lower.includes("office") ||
              lower.includes("pen")
            ) {
              return "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("baby") ||
              lower.includes("kids") ||
              lower.includes("child")
            ) {
              return "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop";
            }
            if (lower.includes("gift") || lower.includes("present")) {
              return "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&h=400&fit=crop";
            }
            if (
              lower.includes("chocolate") ||
              lower.includes("sweet") ||
              lower.includes("candy")
            ) {
              return "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop";
            }
            if (lower.includes("rakhi") || lower.includes("festiv")) {
              return "https://images.unsplash.com/photo-1626125345510-4603468eedfb?w=400&h=400&fit=crop";
            }
            return "https://images.unsplash.com/photo-1472851294608-062f824d296e?w=400&h=400&fit=crop";
          };

          const mappedCategories = categoriesData.map((c, i) => {
            const style = colors[i % colors.length];
            const catName = c.name || "";
            return {
              id: c._id || c.id,
              name: catName,
              icon: c.icon || style.icon,
              color: c.color || style.color,
              bg: c.bg || style.bg,
              count: c.count || "1,000+ items",
              image: getCategoryImage(catName),
            };
          });

          setProducts(mappedProducts);
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  return (
    <DataContext.Provider
      value={{
        products,
        categories,
        loading,
        cartItems,
        updateQuantity,
        removeFromCart,
        addToCart,
        clearCart,
        cartSubtotal,
        cartDelivery,
        couponDiscount,
        coupon,
        setCoupon,
        setCouponPercent,
        availableCoupons,
        addCoupon,
        toggleCoupon,
        deleteCoupon,
        cartTotal,
        wishlist,
        toggleWishlist,
        user,
        login,
        logout,
        selectedCategory,
        setSelectedCategory,
        searchFilter,
        setSearchFilter,
        isCartOpen,
        setIsCartOpen,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
