import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  RefreshCw,
  Users,
  Package,
  DollarSign,
  Search,
  ShoppingBag,
  User,
  LayoutDashboard,
  Settings,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Bell,
  Menu,
  X,
  CheckCircle,
  Clock,
  Truck,
  Tag,
  Trash2,
  Megaphone,
  Plus,
  Image as ImageIcon,
  Zap,
  Percent,
  Gift,
  Flame,
  Star,
  Heart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Admin.css";
import { useData } from "../context/DataContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8014";

function getToken() {
  return localStorage.getItem("adminToken");
}
function removeToken() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("userData");
}

const DEFAULT_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=80",
    title: "SUPER SAVER DEALS",
    subtitle: "FREE SHIPPING ON ORDERS OVER ₹999*",
    cta: "SHOP NOW",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=2000&q=80",
    title: "PREMIUM ACTIVEWEAR & GEAR",
    subtitle: "UP TO 30% OFF ON SPORTS & FITNESS ESSENTIALS",
    cta: "EXPLORE NOW",
  },
];

const DEFAULT_DEALS = [
  {
    icon: "Zap",
    title: "Flash Sale",
    subtitle: "Up to 60% Off",
    desc: "Ends tonight",
    gradient: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  },
  {
    icon: "Percent",
    title: "Budget Buys",
    subtitle: "Under ₹199",
    desc: "Best value picks",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  },
  {
    icon: "Gift",
    title: "Gift Store",
    subtitle: "Curated Hampers",
    desc: "For every occasion",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  },
  {
    icon: "Flame",
    title: "Trending Now",
    subtitle: "Top Sellers",
    desc: "Most popular items",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
];

const GRADIENT_PRESETS = [
  {
    name: "Sunset (Orange/Red)",
    value: "linear-gradient(135deg, #f97316 0%, #ef4444 100%)",
  },
  {
    name: "Twilight (Purple/Indigo)",
    value: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  },
  {
    name: "Rose (Pink/Rose)",
    value: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
  },
  {
    name: "Forest (Emerald/Green)",
    value: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    name: "Ocean (Cyan/Blue)",
    value: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  },
  {
    name: "Midnight (Slate/Black)",
    value: "linear-gradient(135deg, #475569 0%, #0f172a 100%)",
  },
];

const ICON_OPTIONS = [
  "Zap",
  "Percent",
  "Gift",
  "Flame",
  "Tag",
  "ShoppingBag",
  "Star",
  "Heart",
  "Truck",
];
const ICON_MAP = {
  Zap,
  Percent,
  Gift,
  Flame,
  Tag,
  ShoppingBag,
  Star,
  Heart,
  Truck,
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [editPrices, setEditPrices] = useState({
    price: "",
    originalPrice: "",
  });
  const [savingPriceId, setSavingPriceId] = useState(null);

  const [bulkType, setBulkType] = useState("amount");
  const [bulkValue, setBulkValue] = useState("");
  const [bulkDecreaseValue, setBulkDecreaseValue] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDecreaseLoading, setBulkDecreaseLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);

  const {
    categories,
    products: globalProducts,
  } = useData();
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountPercent: "",
    expirationDate: "",
    usageLimit: "",
  });

  // Marketing State
  const [marketingSubTab, setMarketingSubTab] = useState("promo");

  const [promoConfig, setPromoConfig] = useState({
    tagText: "Limited Offer",
    title: "Mega Sale",
    highlight: "Up to 70% Off",
    desc: "On top electronics, fashion & home décor. Don't miss out!",
    btnText: "Shop Sale",
    btnLink: "/deals",
    imgUrl:
      "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=400&fit=crop",
    tagBg: "#10b981",
  });

  const [slidesConfig, setSlidesConfig] = useState(DEFAULT_SLIDES);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  const [dealsConfig, setDealsConfig] = useState(DEFAULT_DEALS);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/products?limit=250`);
      if (res.ok) {
        const rawProducts = await res.json();

        const catMap = {};
        if (categories && Array.isArray(categories)) {
          categories.forEach((c) => {
            catMap[String(c._id || c.id)] = c.name;
          });
        }

        const mapped = rawProducts.map((p) => {
          const rawCategory = String(p.categoryId || p.category || "");
          const categoryName =
            catMap[rawCategory] || rawCategory || "Uncategorized";

          return {
            _id: p._id,
            id: p.id || p._id,
            name: p.title || p.name || "Unnamed Product",
            category: categoryName,
            categoryId: rawCategory,
            price:
              p.price !== undefined ? p.price : (p.dropshipBasePrice || 0) + 30,
            originalPrice:
              p.originalPrice !== undefined
                ? p.originalPrice
                : (p.suggestedRetailPrice || p.dropshipBasePrice || 0) + 30,
            dropshipBasePrice: p.dropshipBasePrice,
            suggestedRetailPrice: p.suggestedRetailPrice,
            image:
              p.images && p.images.length > 0
                ? p.images[0].url
                : p.image ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
          };
        });

        setProducts(mapped);
      } else {
        console.error("Failed to fetch products:", res.status);
      }
    } catch (err) {
      console.error("Products fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { state: { from: "/admin" } });
      return;
    }
    if (activeTab === "products") {
      fetchProducts();
    } else {
      fetchData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "coupons") {
      fetch(`${API}/api/coupons`)
        .then((res) => res.json())
        .then((data) => setCoupons(data));
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = ["/api/admin/orders", "/api/admin/users"];
      const [oRes, cRes] = await Promise.all(
        endpoints.map((ep) =>
          fetch(`${API}${ep}`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ),
      );

      try {
        const mRes = await fetch(`${API}/api/marketing`);
        if (mRes.ok) {
          const mData = await mRes.json();
          const promoDoc = mData.find((m) => m.section === "promo-banner");
          if (promoDoc && promoDoc.data) setPromoConfig(promoDoc.data);

          const heroDoc = mData.find((m) => m.section === "hero-slideshow");
          if (heroDoc && heroDoc.data) setSlidesConfig(heroDoc.data);

          const dealDoc = mData.find((m) => m.section === "deal-banners");
          if (dealDoc && dealDoc.data) setDealsConfig(dealDoc.data);
        }
      } catch (e) {
        console.error("Marketing config fetch skipped/failed");
      }

      if (oRes.ok && cRes.ok) {
        setOrders(await oRes.json());
        setCustomers(await cRes.json());
      } else if (oRes.status === 401 || cRes.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API}/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok)
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleUpdatePrice = async (e, productId) => {
    e.preventDefault();
    setSavingPriceId(productId);
    try {
      const res = await fetch(`${API}/api/admin/products/${productId}/price`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          price: Number(editPrices.price),
          originalPrice: Number(editPrices.originalPrice),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(
          products.map((p) =>
            p._id === productId || p.id === productId
              ? {
                  ...p,
                  price: data.product.price,
                  originalPrice: data.product.originalPrice,
                }
              : p,
          ),
        );
        setEditingProductId(null);
        alert("Product price updated successfully!");
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update price.");
      }
    } catch (err) {
      console.error("Price update error:", err);
      alert("Network error. Could not update price.");
    } finally {
      setSavingPriceId(null);
    }
  };

  const handleBulkPriceIncrease = async (e) => {
    e.preventDefault();
    if (!bulkValue || isNaN(bulkValue) || Number(bulkValue) <= 0) {
      return alert("Please enter a valid positive number.");
    }
    const val = Number(bulkValue);
    const confirmMsg = `Are you sure you want to increase the B2C price of ALL products by ${
      bulkType === "amount" ? `₹${val}` : `${val}%`
    }?`;
    if (!window.confirm(confirmMsg)) return;

    setBulkLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/products/bulk-price-increase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ type: bulkType, value: val }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Bulk price increase successfully executed!");
        setBulkValue("");
        fetchProducts(); // Refresh products
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update prices.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Could not perform bulk price increase.");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkPriceDecrease = async (e) => {
    e.preventDefault();
    if (!bulkDecreaseValue || isNaN(bulkDecreaseValue) || Number(bulkDecreaseValue) <= 0) {
      return alert("Please enter a valid positive number.");
    }
    const val = Number(bulkDecreaseValue);
    const confirmMsg = `Are you sure you want to DECREASE the B2C price of ALL products by ${
      bulkType === "amount" ? `₹${val}` : `${val}%`
    }?`;
    if (!window.confirm(confirmMsg)) return;

    setBulkDecreaseLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/products/bulk-price-decrease`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ type: bulkType, value: val }),
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Bulk price decrease successfully executed!");
        setBulkDecreaseValue("");
        fetchProducts(); // Refresh products
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to update prices.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Could not perform bulk price decrease.");
    } finally {
      setBulkDecreaseLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/");
    window.location.reload();
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    const payload = {
      code: newCoupon.code.toUpperCase(),
      discountPercent: Number(newCoupon.discountPercent),
    };

    const res = await fetch(`${API}/api/admin/coupons`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      setCoupons([data.coupon, ...coupons]);
      setNewCoupon({ code: "", discountPercent: "", expirationDate: "", usageLimit: "" });
    }
  };

  const handleToggleCoupon = async (id) => {
    const target = coupons.find((c) => c._id === id);
    if (!target) return;
    try {
      const res = await fetch(`${API}/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isActive: !target.isActive }),
      });
      if (res.ok) {
        setCoupons(
          coupons.map((c) =>
            c._id === id ? { ...c, isActive: !target.isActive } : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`${API}/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveMarketingData = async (sectionName, dataPayload) => {
    try {
      const res = await fetch(`${API}/api/admin/marketing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ section: sectionName, data: dataPayload }),
      });
      if (res.ok) alert(`${sectionName} published successfully!`);
      else alert("Failed to save marketing data.");
    } catch (err) {
      alert("Network error. Could not publish.");
    }
  };

  const updateSlide = (index, field, value) => {
    const updated = [...slidesConfig];
    updated[index][field] = value;
    setSlidesConfig(updated);
  };
  const addSlide = () => {
    setSlidesConfig([
      ...slidesConfig,
      {
        title: "NEW SLIDE",
        subtitle: "Catchy subtitle here",
        cta: "SHOP NOW",
        image: "",
      },
    ]);
    setPreviewSlideIdx(slidesConfig.length);
  };
  const removeSlide = (index) => {
    if (slidesConfig.length <= 1)
      return alert("You must have at least one slide.");
    const updated = slidesConfig.filter((_, i) => i !== index);
    setSlidesConfig(updated);
    setPreviewSlideIdx(0);
  };

  const updateDeal = (index, field, value) => {
    const updated = [...dealsConfig];
    updated[index][field] = value;
    setDealsConfig(updated);
  };
  const addDeal = () => {
    if (dealsConfig.length >= 6)
      return alert("Maximum 6 deal banners allowed.");
    setDealsConfig([
      ...dealsConfig,
      {
        icon: "Star",
        title: "New Deal",
        subtitle: "Description",
        desc: "Extra info",
        gradient: GRADIENT_PRESETS[0].value,
      },
    ]);
  };
  const removeDeal = (index) => {
    if (dealsConfig.length <= 1)
      return alert("You need at least one deal banner.");
    setDealsConfig(dealsConfig.filter((_, i) => i !== index));
  };

  const processChartData = () => {
    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      })
      .reverse();
    const dataMap = last7Days.reduce(
      (acc, date) => ({ ...acc, [date]: { name: date, revenue: 0 } }),
      {},
    );
    orders.forEach((o) => {
      const dateStr = new Date(o.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (dataMap[dateStr]) dataMap[dateStr].revenue += o.total || 0;
    });
    return Object.values(dataMap);
  };
  const chartData = processChartData();
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    totalUsers: customers.length,

    pendingOrders: orders.filter((o) =>
      ["Pending", "Pending Payment"].includes(o.status),
    ).length,
  };
  if (!getToken()) return null;
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");

  return (
    <div className="admin-layout">
      {}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">
            <ShoppingBag size={24} />
          </div>
          <span>Sovely Admin</span>
        </div>
        <nav className="sidebar-nav">
          <button
            className={activeTab === "dashboard" ? "active" : ""}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={20} /> <span>Orders</span>
          </button>
          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            <Package size={20} /> {sidebarOpen && <span>Products</span>}
          </button>
          <button
            className={activeTab === "customers" ? "active" : ""}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={20} /> {sidebarOpen && <span>Customers</span>}
          </button>
          <button
            className={activeTab === "coupons" ? "active" : ""}
            onClick={() => setActiveTab("coupons")}
          >
            <Tag size={20} /> {sidebarOpen && <span>Coupons</span>}
          </button>
          <button
            className={activeTab === "marketing" ? "active" : ""}
            onClick={() => setActiveTab("marketing")}
          >
            <Megaphone size={20} /> {sidebarOpen && <span>Marketing</span>}
          </button>
          <div className="nav-divider"></div>
          <button
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            <Settings size={20} /> <span>Settings</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {}
      <div className="admin-main-wrapper">
        <header className="admin-header-fixed">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={22} />
            </button>
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          </div>
          <div className="header-right">
            <div className="admin-profile">
              <div className="admin-avatar">{userData.name?.[0] || "A"}</div>
            </div>
          </div>
        </header>

        <main className="admin-scroll-content">
          <div className="admin-view-container">
            {}
            {activeTab === "dashboard" && (
              <div className="dashboard-view animate-fadeUp">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon purple">
                      <ShoppingBag size={24} />
                    </div>
                    <div className="stat-data">
                      <p>Total Orders</p>
                      <h3>{stats.totalOrders}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon emerald">
                      <DollarSign size={24} />
                    </div>
                    <div className="stat-data">
                      <p>Total Revenue</p>
                      <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon blue">
                      <Users size={24} />
                    </div>
                    <div className="stat-data">
                      <p>Total Customers</p>
                      <h3>{stats.totalUsers}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon amber">
                      <RefreshCw size={24} />
                    </div>
                    <div className="stat-data">
                      <p>Pending Orders</p>
                      <h3>{stats.pendingOrders}</h3>
                    </div>
                  </div>
                </div>
                <div className="dashboard-sections">
                  <div className="card chart-card">
                    <div className="card-header">
                      <h3>Revenue Overview (Last 7 Days)</h3>
                    </div>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient
                              id="colorRevenue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            dy={10}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            tickFormatter={(val) => `₹${val}`}
                            dx={-10}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "4px",
                              border: "3px solid #0f172a",
                              boxShadow: "4px 4px 0px #0f172a",
                              backgroundColor: "#ffffff",
                            }}
                            itemStyle={{ color: "#10b981", fontWeight: "900" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="card recent-orders">
                    <div className="card-header">
                      <h3>Recent Orders</h3>
                      <button
                        className="btn-text"
                        onClick={() => setActiveTab("orders")}
                      >
                        View All
                      </button>
                    </div>
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((o) => (
                            <tr key={o._id}>
                              <td className="mono">#{o._id.slice(-6)}</td>
                              <td>{o.customerName}</td>
                              <td>
                                <strong>₹{o.total?.toLocaleString()}</strong>
                              </td>
                              <td>
                                <span
                                  className={`status-pill ${o.status?.toLowerCase()}`}
                                >
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="orders-view animate-fadeUp">
                <div className="view-header">
                  <h3>Order Management</h3>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={fetchData}
                  >
                    <RefreshCw size={14} className={loading ? "spin" : ""} />{" "}
                    Refresh
                  </button>
                </div>
                <div className="card">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Update Status</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const isExpanded = expandedOrderId === order._id;
                          return (
                            <React.Fragment key={order._id}>
                              <tr
                                className={`order-row-main ${isExpanded ? "is-expanded" : ""}`}
                                onClick={() =>
                                  setExpandedOrderId(
                                    isExpanded ? null : order._id,
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              >
                                <td className="mono">#{order._id.slice(-8)}</td>
                                <td>
                                  <div className="td-customer-info">
                                    <span className="customer-name">
                                      {order.customerName}
                                    </span>
                                    <span className="customer-email">
                                      {order.email}
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleDateString()}
                                </td>
                                <td>
                                  <strong className="text-primary">
                                    ₹{order.total?.toLocaleString()}
                                  </strong>
                                </td>
                                <td>
                                  {}
                                  <span
                                    className={`status-pill ${order.status?.toLowerCase().replace(/\s+/g, "-")}`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <select
                                      className="status-select"
                                      value={order.status}
                                      onChange={(e) =>
                                        handleUpdateStatus(
                                          order._id,
                                          e.target.value,
                                        )
                                      }
                                      disabled={
                                        order.status === "Pending Payment"
                                      }
                                    >
                                      {}
                                      {order.status === "Pending Payment" && (
                                        <option value="Pending Payment">
                                          Pending Payment
                                        </option>
                                      )}
                                      <option value="Pending">
                                        Pending (COD/Paid)
                                      </option>
                                      <option value="Processing">
                                        Processing
                                      </option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">
                                        Delivered
                                      </option>
                                      <option value="Cancelled">
                                        Cancelled
                                      </option>
                                    </select>
                                  </div>
                                </td>
                                <td>
                                  <button className="btn-details-toggle">
                                    <ChevronDown
                                      size={14}
                                      className={`toggle-icon ${isExpanded ? "rotated" : ""}`}
                                    />
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="order-details-row">
                                  <td colSpan={7} style={{ padding: 0 }}>
                                    <div className="order-details-expanded" style={{ padding: "20px 30px", background: "#f8fafc", borderLeft: "4px solid var(--primary)" }}>
                                      <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                                        <div className="details-block">
                                          <h4 style={{ marginBottom: "12px", textTransform: "uppercase", fontSize: "0.85rem", fontWeight: 900 }}>Products in this Order</h4>
                                          <div className="products-table-wrap" style={{ background: "var(--bg-card)", border: "var(--border-thin)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                                            <table className="products-detail-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                              <thead>
                                                <tr style={{ background: "var(--bg-main)", borderBottom: "var(--border-thin)" }}>
                                                  <th style={{ padding: "10px 16px", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase" }}>Product</th>
                                                  <th style={{ padding: "10px 16px", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase" }}>Price</th>
                                                  <th style={{ padding: "10px 16px", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase" }}>Qty</th>
                                                  <th style={{ padding: "10px 16px", fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase" }}>Total</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {order.items?.map((item, idx) => {
                                                  const foundProduct = globalProducts.find(
                                                    (p) => String(p.id || p._id) === String(item.id || item.productId)
                                                  );
                                                  const itemImage = item.image && !item.image.includes("undefined")
                                                    ? item.image
                                                    : (foundProduct?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop");
                                                  const itemTitle = item.name && item.name !== "Product" && item.name !== "undefined"
                                                    ? item.name
                                                    : (foundProduct?.name || foundProduct?.title || "Product");

                                                  return (
                                                    <tr key={idx} style={{ borderBottom: idx === order.items.length - 1 ? "none" : "var(--border-thin)" }}>
                                                      <td style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <img
                                                          src={itemImage}
                                                          alt={itemTitle}
                                                          className="admin-product-thumb"
                                                          style={{ width: "40px", height: "40px", objectFit: "contain", border: "var(--border-thin)", borderRadius: "var(--radius-sm)", background: "#fff" }}
                                                        />
                                                        <span className="product-title-cell" style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>{itemTitle}</span>
                                                      </td>
                                                      <td style={{ padding: "10px 16px", fontSize: "0.85rem", fontWeight: 700 }}>₹{item.price}</td>
                                                      <td style={{ padding: "10px 16px", fontSize: "0.85rem", fontWeight: 700 }}>{item.quantity}</td>
                                                      <td style={{ padding: "10px 16px", fontSize: "0.85rem", fontWeight: 900, color: "var(--primary-dark)" }}>₹{item.price * item.quantity}</td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                        <div className="info-sidebar-block" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                          <div className="info-section" style={{ background: "var(--bg-card)", border: "var(--border-thin)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
                                            <h4 style={{ margin: "0 0 10px 0", borderBottom: "var(--border-thin)", paddingBottom: "6px", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 900 }}>Shipping Details</h4>
                                            <div className="info-content" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                                              <p style={{ margin: "0 0 4px 0" }}><strong>Name:</strong> {order.customerName}</p>
                                              <p style={{ margin: "0 0 4px 0" }}><strong>Address:</strong> {order.address}</p>
                                              <p style={{ margin: "0 0 4px 0" }}><strong>City:</strong> {order.city}</p>
                                              <p style={{ margin: "0 0 4px 0" }}><strong>Postal Code:</strong> {order.postalCode}</p>
                                              <p style={{ margin: "0 0 4px 0" }}><strong>Phone:</strong> {order.phone}</p>
                                              <p style={{ margin: "0 0 0 0" }}><strong>Email:</strong> {order.email}</p>
                                            </div>
                                          </div>
                                          <div className="info-section" style={{ background: "var(--bg-card)", border: "var(--border-thin)", borderRadius: "var(--radius-sm)", padding: "16px" }}>
                                            <h4 style={{ margin: "0 0 10px 0", borderBottom: "var(--border-thin)", paddingBottom: "6px", fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 900 }}>Payment Details</h4>
                                            <div className="info-content" style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                                              <p style={{ margin: "0 0 4px 0" }}><strong>Method:</strong> {order.paymentMethod || "Razorpay"}</p>
                                              <p style={{ margin: "0 0 4px 0" }}><strong>Status:</strong> {order.status}</p>
                                              {order.couponCode && (
                                                <p style={{ margin: "0 0 4px 0" }}><strong>Coupon:</strong> <span style={{ fontFamily: "monospace", background: "var(--bg-main)", padding: "2px 4px", borderRadius: "2px" }}>{order.couponCode}</span></p>
                                              )}
                                              {order.razorpayOrderId && (
                                                <p style={{ margin: "0 0 4px 0" }}><strong>RP Order ID:</strong> <span style={{ fontFamily: "monospace", background: "var(--bg-main)", padding: "2px 4px", borderRadius: "2px", fontSize: "0.75rem" }}>{order.razorpayOrderId}</span></p>
                                              )}
                                              {order.razorpayPaymentId && (
                                                <p style={{ margin: "0 0 0 0" }}><strong>RP Payment ID:</strong> <span style={{ fontFamily: "monospace", background: "var(--bg-main)", padding: "2px 4px", borderRadius: "2px", fontSize: "0.75rem" }}>{order.razorpayPaymentId}</span></p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <div className="orders-view animate-fadeUp">
                <div className="view-header">
                  <h3>Product Inventory & Pricing</h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search products by name or category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "14px",
                        outline: "none",
                        width: "280px",
                        background: "#fff",
                      }}
                    />
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={fetchProducts}
                    >
                      <RefreshCw size={14} className={loading ? "spin" : ""} />{" "}
                      Refresh
                    </button>
                  </div>
                </div>

                <div
                  className="card"
                  style={{
                    marginBottom: "24px",
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 12px 0",
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <DollarSign size={18} style={{ color: "#3b82f6" }} />
                    Bulk Price Adjuster
                  </h4>
                  <p
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: "13px",
                      color: "#64748b",
                    }}
                  >
                    Increase or decrease the B2C price (both Selling Price and Original
                    Price) of ALL products in the inventory instantly by a flat
                    amount or percentage. B2B prices will remain untouched.
                  </p>

                  <div style={{ marginBottom: "16px" }}>
                    <div className="input-group" style={{ margin: 0 }}>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "bold",
                          marginBottom: "6px",
                          display: "block",
                        }}
                      >
                        Adjustment Type
                      </label>
                      <select
                        style={{
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "1.5px solid #cbd5e1",
                          fontSize: "14px",
                          outline: "none",
                          width: "160px",
                          background: "#fff",
                        }}
                        value={bulkType}
                        onChange={(e) => setBulkType(e.target.value)}
                      >
                        <option value="amount">Flat Amount (₹)</option>
                        <option value="percent">Percentage (%)</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "24px",
                      flexWrap: "wrap",
                      alignItems: "flex-end",
                    }}
                  >
                    {/* Increase Section */}
                    <form
                      onSubmit={handleBulkPriceIncrease}
                      style={{
                        display: "flex",
                        gap: "16px",
                        flexWrap: "wrap",
                        alignItems: "flex-end",
                        background: "#fff",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div className="input-group" style={{ margin: 0 }}>
                        <label
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "6px",
                            display: "block",
                            color: "#10b981"
                          }}
                        >
                          Increase Value
                        </label>
                        <input
                          type="number"
                          placeholder={
                            bulkType === "amount" ? "e.g. 50" : "e.g. 10"
                          }
                          value={bulkValue}
                          onChange={(e) => setBulkValue(e.target.value)}
                          min="0.01"
                          step="any"
                          required
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1.5px solid #cbd5e1",
                            fontSize: "14px",
                            outline: "none",
                            width: "140px",
                            background: "#fff",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={bulkLoading}
                        style={{
                          padding: "10px 24px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#10b981",
                          border: "none",
                          fontWeight: "bold",
                          opacity: bulkLoading ? 0.7 : 1
                        }}
                      >
                        {bulkLoading ? "Applying..." : "Apply Increase"}
                      </button>
                    </form>

                    {/* Decrease Section */}
                    <form
                      onSubmit={handleBulkPriceDecrease}
                      style={{
                        display: "flex",
                        gap: "16px",
                        flexWrap: "wrap",
                        alignItems: "flex-end",
                        background: "#fff",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0"
                      }}
                    >
                      <div className="input-group" style={{ margin: 0 }}>
                        <label
                          style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "6px",
                            display: "block",
                            color: "#ef4444"
                          }}
                        >
                          Decrease Value
                        </label>
                        <input
                          type="number"
                          placeholder={
                            bulkType === "amount" ? "e.g. 50" : "e.g. 10"
                          }
                          value={bulkDecreaseValue}
                          onChange={(e) => setBulkDecreaseValue(e.target.value)}
                          min="0.01"
                          step="any"
                          required
                          style={{
                            padding: "8px 12px",
                            borderRadius: "8px",
                            border: "1.5px solid #cbd5e1",
                            fontSize: "14px",
                            outline: "none",
                            width: "140px",
                            background: "#fff",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={bulkDecreaseLoading}
                        style={{
                          padding: "10px 24px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                          opacity: bulkDecreaseLoading ? 0.7 : 1
                        }}
                      >
                        {bulkDecreaseLoading ? "Applying..." : "Apply Decrease"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="card">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Product Details</th>
                          <th>Category</th>
                          <th>B2C Selling Price</th>
                          <th>B2C Original Price</th>
                          <th>B2B Base Price (ReadOnly)</th>
                          <th>B2B Retail Price (ReadOnly)</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter((p) => {
                            const term = productSearch.toLowerCase();
                            return (
                              p.name.toLowerCase().includes(term) ||
                              p.category.toLowerCase().includes(term)
                            );
                          })
                          .map((product) => {
                            const isEditing =
                              editingProductId === (product.id || product._id);
                            return (
                              <tr key={product._id || product.id}>
                                <td>
                                  <div
                                    className="td-user-row"
                                    style={{
                                      display: "flex",
                                      gap: "12px",
                                      alignItems: "center",
                                    }}
                                  >
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "6px",
                                        objectFit: "cover",
                                        border: "1px solid #e2e8f0",
                                      }}
                                    />
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "2px",
                                      }}
                                    >
                                      <strong
                                        style={{
                                          fontSize: "14px",
                                          color: "#0f172a",
                                        }}
                                      >
                                        {product.name}
                                      </strong>
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#64748b",
                                        }}
                                      >
                                        ID: {product.id}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <span
                                    className="badge-blue"
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    {product.category}
                                  </span>
                                </td>
                                <td>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      className="status-select"
                                      style={{ width: "90px", padding: "6px" }}
                                      value={editPrices.price}
                                      onChange={(e) =>
                                        setEditPrices({
                                          ...editPrices,
                                          price: e.target.value,
                                        })
                                      }
                                      min="0"
                                      required
                                    />
                                  ) : (
                                    <strong>
                                      ₹{product.price?.toLocaleString()}
                                    </strong>
                                  )}
                                </td>
                                <td>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      className="status-select"
                                      style={{ width: "90px", padding: "6px" }}
                                      value={editPrices.originalPrice}
                                      onChange={(e) =>
                                        setEditPrices({
                                          ...editPrices,
                                          originalPrice: e.target.value,
                                        })
                                      }
                                      min="0"
                                      required
                                    />
                                  ) : (
                                    <span
                                      style={{
                                        textDecoration: "line-through",
                                        color: "#94a3b8",
                                      }}
                                    >
                                      ₹{product.originalPrice?.toLocaleString()}
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {product.dropshipBasePrice !== undefined
                                      ? `₹${product.dropshipBasePrice.toLocaleString()}`
                                      : "—"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    style={{
                                      color: "#64748b",
                                      fontWeight: "500",
                                    }}
                                  >
                                    {product.suggestedRetailPrice !== undefined
                                      ? `₹${product.suggestedRetailPrice.toLocaleString()}`
                                      : "—"}
                                  </span>
                                </td>
                                <td>
                                  {isEditing ? (
                                    <div
                                      style={{ display: "flex", gap: "8px" }}
                                    >
                                      <button
                                        className="badge-green"
                                        style={{
                                          border: "none",
                                          cursor: "pointer",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          fontWeight: "bold",
                                        }}
                                        onClick={(e) =>
                                          handleUpdatePrice(
                                            e,
                                            product.id || product._id,
                                          )
                                        }
                                        disabled={savingPriceId !== null}
                                      >
                                        {savingPriceId ===
                                        (product.id || product._id)
                                          ? "Saving..."
                                          : "Save"}
                                      </button>
                                      <button
                                        className="badge-gray"
                                        style={{
                                          border: "none",
                                          cursor: "pointer",
                                          padding: "6px 12px",
                                          borderRadius: "6px",
                                          fontWeight: "bold",
                                        }}
                                        onClick={() =>
                                          setEditingProductId(null)
                                        }
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      className="badge-blue"
                                      style={{
                                        border: "none",
                                        cursor: "pointer",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        fontWeight: "bold",
                                      }}
                                      onClick={() => {
                                        setEditingProductId(
                                          product.id || product._id,
                                        );
                                        setEditPrices({
                                          price: product.price || "",
                                          originalPrice:
                                            product.originalPrice || "",
                                        });
                                      }}
                                    >
                                      Edit Price
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "customers" && (
              <div className="customers-view animate-fadeUp">
                <div className="view-header">
                  <h3>Customer Directory</h3>
                </div>
                <div className="card">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Email</th>
                          <th>Joined</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((user) => (
                          <tr key={user._id}>
                            <td>
                              <div className="td-user-row">
                                <div className="avatar-sm">
                                  {user.name?.[0]}
                                </div>
                                <strong>{user.name}</strong>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span className="badge-blue">{user.role}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "coupons" && (
              <div className="coupons-view animate-fadeUp">
                <div className="view-header">
                  <h3>Coupon Management</h3>
                </div>
                <div className="card" style={{ marginBottom: "20px" }}>
                  <form
                    onSubmit={handleCreateCoupon}
                    className="coupon-form"
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      alignItems: "flex-end",
                    }}
                  >
                    <div className="input-group">
                      <label>Coupon Code</label>
                      <input
                        type="text"
                        value={newCoupon.code}
                        onChange={(e) =>
                          setNewCoupon({
                            ...newCoupon,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="input-group">
                      <label>Discount %</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newCoupon.discountPercent}
                        onChange={(e) =>
                          setNewCoupon({
                            ...newCoupon,
                            discountPercent: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ padding: "12px 24px" }}
                    >
                      Add Coupon
                    </button>
                  </form>
                </div>
                <div className="card">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Discount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((coupon) => (
                          <tr key={coupon._id}>
                            <td>
                              <strong>{coupon.code}</strong>
                            </td>
                            <td>{coupon.discountPercent}%</td>
                            <td>
                              <button
                                onClick={() => handleToggleCoupon(coupon._id)}
                                className={`badge-${coupon.isActive ? "green" : "gray"}`}
                                style={{ border: "none", cursor: "pointer" }}
                              >
                                {coupon.isActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteCoupon(coupon._id)}
                                className="btn-icon"
                                style={{
                                  color: "#ef4444",
                                  background: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === "marketing" && (
              <div className="marketing-view animate-fadeUp">
                <div className="view-header">
                  <h3>Marketing & Storefront Designer</h3>
                </div>

                {}
                <div
                  className="marketing-tabs"
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "24px",
                    borderBottom: "1px solid #e2e8f0",
                    paddingBottom: "12px",
                    overflowX: "auto",
                  }}
                >
                  <button
                    onClick={() => setMarketingSubTab("promo")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        marketingSubTab === "promo" ? "#0f172a" : "transparent",
                      color: marketingSubTab === "promo" ? "#fff" : "#64748b",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Promo Poster
                  </button>
                  <button
                    onClick={() => setMarketingSubTab("hero")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        marketingSubTab === "hero" ? "#0f172a" : "transparent",
                      color: marketingSubTab === "hero" ? "#fff" : "#64748b",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Hero Slideshow
                  </button>
                  <button
                    onClick={() => setMarketingSubTab("deals")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      background:
                        marketingSubTab === "deals" ? "#0f172a" : "transparent",
                      color: marketingSubTab === "deals" ? "#fff" : "#64748b",
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    Deal Cards
                  </button>
                </div>

                {}
                {marketingSubTab === "promo" && (
                  <div
                    className="designer-layout animate-fadeUp"
                    style={{
                      display: "flex",
                      gap: "24px",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="card"
                      style={{ flex: "1", minWidth: "300px" }}
                    >
                      <h4>Main Promo Configuration</h4>
                      <div
                        className="form-grid"
                        style={{
                          display: "grid",
                          gap: "16px",
                          marginTop: "16px",
                        }}
                      >
                        <div className="input-group">
                          <label>Tag Text</label>
                          <input
                            type="text"
                            value={promoConfig.tagText}
                            onChange={(e) =>
                              setPromoConfig({
                                ...promoConfig,
                                tagText: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label>Title</label>
                          <input
                            type="text"
                            value={promoConfig.title}
                            onChange={(e) =>
                              setPromoConfig({
                                ...promoConfig,
                                title: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label>Highlight Text</label>
                          <input
                            type="text"
                            value={promoConfig.highlight}
                            onChange={(e) =>
                              setPromoConfig({
                                ...promoConfig,
                                highlight: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="input-group">
                          <label>Description</label>
                          <textarea
                            rows="2"
                            value={promoConfig.desc}
                            onChange={(e) =>
                              setPromoConfig({
                                ...promoConfig,
                                desc: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                          }}
                        >
                          <div className="input-group">
                            <label>Button Text</label>
                            <input
                              type="text"
                              value={promoConfig.btnText}
                              onChange={(e) =>
                                setPromoConfig({
                                  ...promoConfig,
                                  btnText: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="input-group">
                            <label>Button Link</label>
                            <input
                              type="text"
                              value={promoConfig.btnLink}
                              onChange={(e) =>
                                setPromoConfig({
                                  ...promoConfig,
                                  btnLink: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="input-group">
                          <label>Image URL</label>
                          <input
                            type="text"
                            value={promoConfig.imgUrl}
                            onChange={(e) =>
                              setPromoConfig({
                                ...promoConfig,
                                imgUrl: e.target.value,
                              })
                            }
                          />
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            saveMarketingData("promo-banner", promoConfig)
                          }
                          style={{ marginTop: "10px" }}
                        >
                          Publish Poster to Homepage
                        </button>
                      </div>
                    </div>

                    <div
                      className="card"
                      style={{
                        flex: "1.5",
                        minWidth: "400px",
                        background: "#f8fafc",
                      }}
                    >
                      <h4>Live Homepage Preview</h4>
                      <div
                        style={{
                          pointerEvents: "none",
                          marginTop: "16px",
                          transform: "scale(0.85)",
                          transformOrigin: "top left",
                          width: "117%",
                          border: "1px dashed #cbd5e1",
                          borderRadius: "16px",
                          padding: "16px",
                          background: "#fff",
                        }}
                      >
                        <div
                          className="promo-card promo-card--main"
                          style={{ margin: 0 }}
                        >
                          <div className="promo-content">
                            <span
                              className="promo-tag"
                              style={{
                                background: promoConfig.tagBg,
                                color: "#fff",
                              }}
                            >
                              <Tag size={12} style={{ marginRight: "4px" }} />{" "}
                              {promoConfig.tagText}
                            </span>
                            <h2 className="promo-title">
                              {promoConfig.title}
                              <br />
                              <span className="promo-highlight">
                                {promoConfig.highlight}
                              </span>
                            </h2>
                            <p className="promo-desc">{promoConfig.desc}</p>
                            <div
                              className="btn btn-white promo-cta"
                              style={{
                                display: "inline-flex",
                                width: "max-content",
                              }}
                            >
                              {promoConfig.btnText} <ArrowRight size={16} />
                            </div>
                          </div>
                          <div className="promo-visual">
                            <img
                              src={promoConfig.imgUrl}
                              alt="Preview"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/400?text=Invalid+Image";
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {}
                {marketingSubTab === "hero" && (
                  <div
                    className="designer-layout animate-fadeUp"
                    style={{
                      display: "flex",
                      gap: "24px",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      className="card"
                      style={{ flex: "1", minWidth: "300px" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                        }}
                      >
                        <h4>Slideshow Array</h4>
                        <span
                          style={{
                            fontSize: "12px",
                            background: "#e2e8f0",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          {slidesConfig.length} Slides
                        </span>
                      </div>
                      <div
                        className="slides-manager-list"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {slidesConfig.map((slide, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewSlideIdx(idx)}
                            style={{
                              padding: "12px",
                              border: `2px solid ${previewSlideIdx === idx ? "#3b82f6" : "#e2e8f0"}`,
                              borderRadius: "8px",
                              cursor: "pointer",
                              display: "flex",
                              gap: "12px",
                              alignItems: "center",
                              background: "#f8fafc",
                            }}
                          >
                            <div
                              style={{
                                width: "60px",
                                height: "40px",
                                borderRadius: "4px",
                                background: "#cbd5e1",
                                overflow: "hidden",
                                display: "flex",
                                alignItems: "center",
                                justifyItems: "center",
                              }}
                            >
                              {slide.image ? (
                                <img
                                  src={slide.image}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  alt="thumb"
                                />
                              ) : (
                                <ImageIcon size={20} color="#94a3b8" />
                              )}
                            </div>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                              <p
                                style={{
                                  fontWeight: "bold",
                                  margin: 0,
                                  fontSize: "14px",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {slide.title || "Untitled Slide"}
                              </p>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: "12px",
                                  color: "#64748b",
                                }}
                              >
                                Slide #{idx + 1}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSlide(idx);
                              }}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addSlide}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            padding: "12px",
                            background: "#fff",
                            border: "1px dashed #cbd5e1",
                            borderRadius: "8px",
                            color: "#3b82f6",
                            fontWeight: "bold",
                            cursor: "pointer",
                            marginTop: "8px",
                          }}
                        >
                          <Plus size={16} /> Add New Slide
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            saveMarketingData("hero-slideshow", slidesConfig)
                          }
                          style={{ marginTop: "16px", width: "100%" }}
                        >
                          Publish Slideshow to Homepage
                        </button>
                      </div>
                    </div>

                    <div
                      className="card"
                      style={{ flex: "1.5", minWidth: "400px" }}
                    >
                      {slidesConfig[previewSlideIdx] ? (
                        <>
                          <h4 style={{ marginBottom: "16px" }}>
                            Editing Slide #{previewSlideIdx + 1}
                          </h4>
                          <div
                            className="form-grid"
                            style={{ display: "grid", gap: "16px" }}
                          >
                            <div className="input-group">
                              <label>Small Tagline (Title)</label>
                              <input
                                type="text"
                                value={slidesConfig[previewSlideIdx].title}
                                onChange={(e) =>
                                  updateSlide(
                                    previewSlideIdx,
                                    "title",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="input-group">
                              <label>Main Headline (Subtitle)</label>
                              <input
                                type="text"
                                value={slidesConfig[previewSlideIdx].subtitle}
                                onChange={(e) =>
                                  updateSlide(
                                    previewSlideIdx,
                                    "subtitle",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="input-group">
                              <label>Button Text (CTA)</label>
                              <input
                                type="text"
                                value={slidesConfig[previewSlideIdx].cta}
                                onChange={(e) =>
                                  updateSlide(
                                    previewSlideIdx,
                                    "cta",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div className="input-group">
                              <label>Background Image URL</label>
                              <input
                                type="text"
                                value={slidesConfig[previewSlideIdx].image}
                                onChange={(e) =>
                                  updateSlide(
                                    previewSlideIdx,
                                    "image",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              marginTop: "24px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              overflow: "hidden",
                              height: "250px",
                              position: "relative",
                              background: "#0f172a",
                            }}
                          >
                            <img
                              src={slidesConfig[previewSlideIdx].image}
                              alt="Background"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                opacity: 0.7,
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                padding: "32px",
                                background:
                                  "linear-gradient(to right, rgba(0,0,0,0.8), transparent)",
                              }}
                            >
                              <span
                                style={{
                                  color: "#fbbf24",
                                  fontWeight: "bold",
                                  fontSize: "12px",
                                  letterSpacing: "2px",
                                  marginBottom: "8px",
                                }}
                              >
                                {slidesConfig[previewSlideIdx].title}
                              </span>
                              <h2
                                style={{
                                  color: "#fff",
                                  fontSize: "24px",
                                  margin: "0 0 16px 0",
                                  maxWidth: "80%",
                                }}
                              >
                                {slidesConfig[previewSlideIdx].subtitle}
                              </h2>
                              <button
                                style={{
                                  background: "#fff",
                                  color: "#0f172a",
                                  border: "none",
                                  padding: "8px 16px",
                                  fontWeight: "bold",
                                  borderRadius: "4px",
                                  width: "max-content",
                                }}
                              >
                                {slidesConfig[previewSlideIdx].cta} →
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#64748b",
                          }}
                        >
                          Select a slide to edit
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {}
                {marketingSubTab === "deals" && (
                  <div
                    className="designer-layout animate-fadeUp"
                    style={{
                      display: "flex",
                      gap: "24px",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      flexDirection: "column",
                    }}
                  >
                    <div className="card" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                        }}
                      >
                        <h4>Manage Deal Cards</h4>
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            saveMarketingData("deal-banners", dealsConfig)
                          }
                        >
                          Publish Deal Cards
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(280px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        {dealsConfig.map((deal, idx) => {
                          const IconComponent = ICON_MAP[deal.icon] || Zap;
                          return (
                            <div
                              key={idx}
                              style={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                overflow: "hidden",
                                background: "#f8fafc",
                                position: "relative",
                              }}
                            >
                              {}
                              <div
                                style={{
                                  background: deal.gradient,
                                  padding: "20px",
                                  color: "white",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "12px",
                                  minHeight: "140px",
                                  position: "relative",
                                }}
                              >
                                <button
                                  onClick={() => removeDeal(idx)}
                                  style={{
                                    position: "absolute",
                                    top: "12px",
                                    right: "12px",
                                    background: "rgba(0,0,0,0.2)",
                                    border: "none",
                                    color: "white",
                                    width: "28px",
                                    height: "28px",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  <X size={14} />
                                </button>
                                <div
                                  style={{
                                    background: "rgba(255,255,255,0.2)",
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <IconComponent size={20} />
                                </div>
                                <div>
                                  <h3
                                    style={{
                                      margin: 0,
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {deal.title}
                                  </h3>
                                  <p
                                    style={{
                                      margin: "4px 0 0 0",
                                      fontSize: "14px",
                                      opacity: 0.9,
                                    }}
                                  >
                                    {deal.subtitle}
                                  </p>
                                </div>
                              </div>

                              {}
                              <div
                                style={{
                                  padding: "16px",
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "12px",
                                }}
                              >
                                <div className="input-group">
                                  <label style={{ fontSize: "12px" }}>
                                    Icon
                                  </label>
                                  <select
                                    style={{
                                      padding: "8px",
                                      borderRadius: "6px",
                                      border: "1px solid #cbd5e1",
                                    }}
                                    value={deal.icon}
                                    onChange={(e) =>
                                      updateDeal(idx, "icon", e.target.value)
                                    }
                                  >
                                    {ICON_OPTIONS.map((i) => (
                                      <option key={i} value={i}>
                                        {i}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="input-group">
                                  <label style={{ fontSize: "12px" }}>
                                    Title
                                  </label>
                                  <input
                                    type="text"
                                    value={deal.title}
                                    onChange={(e) =>
                                      updateDeal(idx, "title", e.target.value)
                                    }
                                    style={{ padding: "8px" }}
                                  />
                                </div>
                                <div className="input-group">
                                  <label style={{ fontSize: "12px" }}>
                                    Subtitle
                                  </label>
                                  <input
                                    type="text"
                                    value={deal.subtitle}
                                    onChange={(e) =>
                                      updateDeal(
                                        idx,
                                        "subtitle",
                                        e.target.value,
                                      )
                                    }
                                    style={{ padding: "8px" }}
                                  />
                                </div>
                                <div className="input-group">
                                  <label style={{ fontSize: "12px" }}>
                                    Description Tag
                                  </label>
                                  <input
                                    type="text"
                                    value={deal.desc}
                                    onChange={(e) =>
                                      updateDeal(idx, "desc", e.target.value)
                                    }
                                    style={{ padding: "8px" }}
                                  />
                                </div>
                                <div className="input-group">
                                  <label style={{ fontSize: "12px" }}>
                                    Color Preset
                                  </label>
                                  <select
                                    style={{
                                      padding: "8px",
                                      borderRadius: "6px",
                                      border: "1px solid #cbd5e1",
                                    }}
                                    value={deal.gradient}
                                    onChange={(e) =>
                                      updateDeal(
                                        idx,
                                        "gradient",
                                        e.target.value,
                                      )
                                    }
                                  >
                                    {GRADIENT_PRESETS.map((preset) => (
                                      <option
                                        key={preset.name}
                                        value={preset.value}
                                      >
                                        {preset.name}
                                      </option>
                                    ))}
                                    <option value={deal.gradient}>
                                      Custom (Keep Current)
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {}
                        {dealsConfig.length < 6 && (
                          <div
                            onClick={addDeal}
                            style={{
                              border: "2px dashed #cbd5e1",
                              borderRadius: "12px",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: "350px",
                              cursor: "pointer",
                              color: "#64748b",
                              background: "transparent",
                              transition: "all 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.background = "#f1f5f9")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <Plus size={32} style={{ marginBottom: "8px" }} />
                            <strong>Add Deal Card</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
