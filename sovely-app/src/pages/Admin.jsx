import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, RefreshCw, Users, Package, DollarSign, 
  Search, ShoppingBag, User, LayoutDashboard, Settings,
  ChevronRight, ArrowUpRight, ArrowDownRight, Bell, Menu, X, CheckCircle, Clock, Truck
} from 'lucide-react';
import './Admin.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8014';

function getToken() { return localStorage.getItem('adminToken'); }
function removeToken() { localStorage.removeItem('adminToken'); localStorage.removeItem('userData'); }

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { state: { from: '/admin' } });
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = ['/api/admin/orders', '/api/admin/users'];
      const [oRes, cRes] = await Promise.all(
        endpoints.map(ep => fetch(`${API}${ep}`, {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        }))
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
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
    window.location.reload();
  };

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    totalUsers: customers.length,
    pendingOrders: orders.filter(o => o.status === 'Pending').length,
  };

  if (!getToken()) return null;

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <div className="brand-logo"><ShoppingBag size={24} /></div>
          <span>Sovely Admin</span>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <ShoppingBag size={20} /> <span>Orders</span>
          </button>
          <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>
            <Users size={20} /> <span>Customers</span>
          </button>
          <div className="nav-divider"></div>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main-wrapper">
        <header className="admin-header-fixed">
          <div className="header-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={22} />
            </button>
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          </div>
          
          <div className="header-right">
            <div className="header-search">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="icon-btn"><Bell size={20} /></button>
            <div className="admin-profile">
              <div className="admin-avatar">{userData.name?.[0] || 'A'}</div>
            </div>
          </div>
        </header>

        <main className="admin-scroll-content">
          <div className="admin-view-container">
            {activeTab === 'dashboard' && (
              <div className="dashboard-view animate-fadeUp">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon purple"><ShoppingBag size={24} /></div>
                    <div className="stat-data">
                      <p>Total Orders</p>
                      <h3>{stats.totalOrders}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon emerald"><DollarSign size={24} /></div>
                    <div className="stat-data">
                      <p>Total Revenue</p>
                      <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon blue"><Users size={24} /></div>
                    <div className="stat-data">
                      <p>Total Customers</p>
                      <h3>{stats.totalUsers}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon amber"><RefreshCw size={24} /></div>
                    <div className="stat-data">
                      <p>Pending Orders</p>
                      <h3>{stats.pendingOrders}</h3>
                    </div>
                  </div>
                </div>

                <div className="dashboard-sections">
                   <div className="card recent-orders">
                      <div className="card-header">
                        <h3>Recent Orders</h3>
                        <button className="btn-text" onClick={() => setActiveTab('orders')}>View All</button>
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
                            {orders.slice(0, 5).map(o => (
                              <tr key={o._id}>
                                <td className="mono">#{o._id.slice(-6)}</td>
                                <td>{o.customerName}</td>
                                <td>₹{o.total?.toLocaleString()}</td>
                                <td><span className={`status-pill ${o.status?.toLowerCase()}`}>{o.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="orders-view animate-fadeUp">
                <div className="view-header">
                  <h3>Order Management</h3>
                  <button className="btn btn-outline btn-sm" onClick={fetchData}>
                    <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
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
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order._id}>
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
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
                        {customers.map(user => (
                          <tr key={user._id}>
                            <td>
                              <div className="td-user-row">
                                <div className="avatar-sm">{user.name?.[0]}</div>
                                <div className="td-user-info">
                                  <strong>{user.name}</strong>
                                  <span className="td-phone">{user.phone || 'No Phone'}</span>
                                </div>
                              </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>{user.savedAddresses?.length || 0} Saved</td>
                            <td><span className="badge-blue">{user.role}</span></td>
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
