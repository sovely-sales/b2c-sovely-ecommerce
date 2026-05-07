import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Initialize Auth
  useEffect(() => {
    const savedUser = localStorage.getItem('userData');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData, token) => {
    const storageKey = userData.role === 'admin' ? 'adminToken' : 'userToken';
    localStorage.setItem(storageKey, token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  // --- Cart helpers ---
  const updateQuantity = (id, delta) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartDelivery = cartSubtotal > 499 ? 0 : 50;
  const cartTotal = cartSubtotal + cartDelivery;

  useEffect(() => {
    const fetchData = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8014';
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/categories`)
        ]);
        
        if (productsRes.ok && categoriesRes.ok) {
          const productsData = await productsRes.json();
          const categoriesData = await categoriesRes.json();
          
          const mappedProducts = productsData.map(p => ({
            id: p._id || p.id,
            name: p.title || p.name,
            category: p.categoryId || p.category || 'Uncategorized',
            price: p.dropshipBasePrice || p.price || 0,
            originalPrice: p.suggestedRetailPrice || p.originalPrice || p.dropshipBasePrice || 0,
            rating: p.averageRating || p.rating || 0,
            reviews: p.reviewCount || p.reviews || 0,
            badge: p.badge || (p.suggestedRetailPrice > p.dropshipBasePrice ? 'Sale' : null),
            badgeColor: p.badgeColor || '#ef4444',
            image: (p.images && p.images.length > 0) ? p.images[0].url : p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            freeDelivery: p.freeDelivery !== undefined ? p.freeDelivery : false
          }));

          const colors = [
            { color: '#22c55e', bg: '#f0fdf4', icon: '🥦' },
            { color: '#3b82f6', bg: '#eff6ff', icon: '📱' },
            { color: '#ec4899', bg: '#fdf2f8', icon: '👗' },
            { color: '#f97316', bg: '#fff7ed', icon: '🏠' },
            { color: '#a855f7', bg: '#faf5ff', icon: '💄' },
            { color: '#14b8a6', bg: '#f0fdfa', icon: '⚽' },
          ];

          const mappedCategories = categoriesData.map((c, i) => {
            const style = colors[i % colors.length];
            return {
              id: c._id || c.id,
              name: c.name,
              icon: c.icon || style.icon,
              color: c.color || style.color,
              bg: c.bg || style.bg,
              count: c.count || '1,000+ items',
              image: c.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
            };
          });

          setProducts(mappedProducts);
          setCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{
      products, categories, loading,
      cartItems, updateQuantity, removeFromCart, addToCart, clearCart,
      cartSubtotal, cartDelivery, cartTotal,
      user, login, logout
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
