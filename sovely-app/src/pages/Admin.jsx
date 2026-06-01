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
  Bell,
  Menu,
  X,
  CheckCircle,
  Clock,
  Truck,
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

const API = import.meta.env.VITE_API_URL || "http://localhost:8014";

function getToken() {
  return localStorage.getItem("adminToken");
}
function removeToken() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("userData");
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { state: { from: "/admin" } });
      return;
    }
    fetchData();
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
      if (res.ok) {
        setOrders(
          orders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o,
          ),
        );
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate("/");
    window.location.reload();
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
      if (dataMap[dateStr]) {
        dataMap[dateStr].revenue += o.total || 0;
      }
    });

    return Object.values(dataMap);
  };

  const chartData = processChartData();

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    totalUsers: customers.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
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
            className={activeTab === "customers" ? "active" : ""}
            onClick={() => setActiveTab("customers")}
          >
            <Users size={20} /> <span>Customers</span>
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
            <div className="header-search">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="admin-profile">
              <div className="admin-avatar">{userData.name?.[0] || "A"}</div>
            </div>
          </div>
        </header>

        <main className="admin-scroll-content">
          <div className="admin-view-container">
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

                {}
                <div className="dashboard-sections">
                  {}
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
                            tickFormatter={(value) => `₹${value}`}
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

                  {}
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

            {}
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
                                className={`order-row-main ${isExpanded ? 'is-expanded' : ''}`}
                                onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                                style={{ cursor: 'pointer' }}
                              >
                                <td className="mono">#{order._id.slice(-8)}</td>
                                <td>
                                  <div className="td-customer-info">
                                    <span className="customer-name">{order.customerName}</span>
                                    <span className="customer-email">{order.email}</span>
                                    <span className="customer-phone">{order.phone}</span>
                                  </div>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td><strong className="text-primary">₹{order.total?.toLocaleString()}</strong></td>
                                <td>
                                  <span className={`status-pill ${order.status?.toLowerCase()}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <select 
                                      className="status-select"
                                      value={order.status}
                                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                    >
                                      <option value="Pending">Pending</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                </td>
                                <td>
                                  <button 
                                    className="btn-details-toggle"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setExpandedOrderId(isExpanded ? null : order._id);
                                    }}
                                  >
                                    <span className="btn-text">{isExpanded ? 'Hide' : 'View'}</span>
                                    <ChevronDown size={14} className={`toggle-icon ${isExpanded ? 'rotated' : ''}`} />
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="order-details-row" onClick={(e) => e.stopPropagation()}>
                                  <td colSpan="7">
                                    <div className="order-details-expanded animate-slideDown">
                                      <div className="details-grid">
                                        
                                        {/* Products ordered details */}
                                        <div className="details-block products-list-block">
                                          <h4>Products Ordered</h4>
                                          <div className="products-table-wrap">
                                            <table className="products-detail-table">
                                              <thead>
                                                <tr>
                                                  <th>Image</th>
                                                  <th>Product Name</th>
                                                  <th>Price</th>
                                                  <th>Qty</th>
                                                  <th>Subtotal</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {order.items?.map((item, index) => (
                                                  <tr key={index}>
                                                    <td>
                                                      <img src={item.image} alt={item.name} className="admin-product-thumb" />
                                                    </td>
                                                    <td className="product-title-cell">{item.name}</td>
                                                    <td>₹{item.price?.toLocaleString()}</td>
                                                    <td>{item.quantity}</td>
                                                    <td><strong>₹{(item.price * item.quantity)?.toLocaleString()}</strong></td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>

                                        {/* Shipping and Payment details */}
                                        <div className="details-block info-sidebar-block">
                                          <div className="info-section">
                                            <h4>Shipping Address</h4>
                                            <div className="info-content">
                                              <p><strong>Name:</strong> {order.customerName}</p>
                                              <p><strong>Address:</strong> {order.address}</p>
                                              <p><strong>City & Pincode:</strong> {order.city} - {order.postalCode}</p>
                                              <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
                                              <p><strong>Email:</strong> {order.email}</p>
                                            </div>
                                          </div>
                                          <div className="info-section payment-section-info">
                                            <h4>Payment Information</h4>
                                            <div className="info-content">
                                              <p><strong>Method:</strong> {order.paymentMethod === 'razorpay' ? 'Razorpay Secure' : 'Cash on Delivery (COD)'}</p>
                                              <p><strong>Payment ID:</strong> <code className="admin-mono-text">{order.paymentId || 'N/A'}</code></p>
                                              <p><strong>Total Amount:</strong> <strong className="text-primary-dark">₹{order.total?.toLocaleString()}</strong></p>
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

            {}
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
                          <th>Address Count</th>
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
                                <div className="td-user-info">
                                  <strong>{user.name}</strong>
                                  <span className="td-phone">
                                    {user.phone || "No Phone"}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td>{user.savedAddresses?.length || 0} Saved</td>
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
          </div>
        </main>
      </div>
    </div>
  );
}
