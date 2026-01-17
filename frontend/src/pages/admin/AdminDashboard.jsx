import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  Bell, LogOut, Plus, Eye, Star, IndianRupee, BarChart3,
  ArrowUpRight, Clock, ArrowLeft, Upload, X
} from 'lucide-react';
import { AdminContext } from '../../App';
import { API_URL } from '../../data/products';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const { notifications, clearNotification } = useContext(AdminContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  
  // Live data states
  const [stats, setStats] = useState({
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    image: '',
    images: [],
    category_id: '',
    product_type: '',
    stock: '',
    is_new: false,
    is_bestseller: false,
    ingredients: '',
    benefits: ''
  });
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch all data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStats(),
      fetchCategories(),
      fetchProducts(),
      fetchOrders(),
      fetchUsers()
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchUserDetails = async (userId) => {
    setLoadingUserDetails(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'name') {
      setProductForm(prev => ({
        ...prev,
        name: value,
        slug: generateSlug(value)
      }));
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
  };

  const handleImageUpload = async (e, isMainImage = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (isMainImage) {
          setProductForm(prev => ({ ...prev, image: data.url }));
        } else {
          setProductForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
        }
      } else {
        const error = await res.json();
        alert(error.detail || 'Upload failed');
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ type: '', text: '' });

    if (!token) {
      setFormMessage({ type: 'error', text: 'Not authenticated. Please login again.' });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: productForm.name,
      slug: productForm.slug,
      description: productForm.description,
      price: parseFloat(productForm.price),
      original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
      image: productForm.image,
      images: productForm.images,
      category_id: parseInt(productForm.category_id),
      product_type: productForm.product_type,
      stock: parseInt(productForm.stock) || 0,
      is_new: productForm.is_new,
      is_bestseller: productForm.is_bestseller,
      ingredients: productForm.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      benefits: productForm.benefits.split(',').map(b => b.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormMessage({ type: 'success', text: 'Product created successfully!' });
        setProductForm({
          name: '', slug: '', description: '', price: '', original_price: '',
          image: '', images: [], category_id: '', product_type: '',
          stock: '', is_new: false, is_bestseller: false, ingredients: '', benefits: ''
        });
        // Refresh data
        await fetchDashboardData();
        setTimeout(() => setActiveTab('products'), 1500);
      } else {
        const error = await res.json();
        setFormMessage({ type: 'error', text: error.detail || 'Failed to create product' });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    onLogout();
    navigate('/admin');
  };

  const topProducts = [...products]
    .sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
    .slice(0, 5);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">🌿</span>
          <span>PureGlow</span>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={20} />
            Products
          </button>
          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingCart size={20} />
            Orders
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            Users
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={20} />
            Analytics
          </button>
          <button
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            Notifications
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{activeTab === 'overview' ? 'Dashboard' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p>Welcome back, Admin</p>
          </div>
          <div className="header-actions">
            <Link to="/" className="view-site-btn" target="_blank">
              <Eye size={18} />
              View Site
            </Link>
          </div>
        </header>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="stat-icon revenue">
                  <IndianRupee size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value">₹{stats.total_revenue?.toLocaleString() || 0}</span>
                  <span className="stat-change positive">
                    <ArrowUpRight size={14} /> Live
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="stat-icon orders">
                  <ShoppingCart size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Orders</span>
                  <span className="stat-value">{stats.total_orders || 0}</span>
                  <span className="stat-change positive">
                    <ArrowUpRight size={14} /> {stats.pending_orders || 0} pending
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="stat-icon visitors">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Users</span>
                  <span className="stat-value">{stats.total_users?.toLocaleString() || 0}</span>
                  <span className="stat-change positive">
                    <ArrowUpRight size={14} /> Live
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="stat-icon products">
                  <Package size={24} />
                </div>
                <div className="stat-info">
                  <span className="stat-label">Total Products</span>
                  <span className="stat-value">{products.length}</span>
                  <span className="stat-change neutral">
                    Active
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Charts & Tables */}
            <div className="dashboard-grid">
              {/* Top Products */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Top Selling Products</h3>
                  <TrendingUp size={20} />
                </div>
                <div className="top-products-list">
                  {products.length === 0 ? (
                    <p style={{textAlign: 'center', padding: '1rem', color: '#888'}}>No products yet</p>
                  ) : (
                    topProducts.map((product, index) => (
                      <div key={product.id} className="top-product-item">
                        <span className="rank">#{index + 1}</span>
                        <img src={product.image} alt={product.name} />
                        <div className="product-info">
                          <span className="name">{product.name}</span>
                          <span className="category">{product.category?.name || product.product_type}</span>
                        </div>
                        <div className="product-stats">
                          <span className="price">₹{product.price}</span>
                          <span className="rating">
                            <Star size={12} fill="#f4c430" color="#f4c430" />
                            {product.rating || 0}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Recent Orders</h3>
                  <Clock size={20} />
                </div>
                <div className="orders-list">
                  {orders.length === 0 ? (
                    <p style={{textAlign: 'center', padding: '1rem', color: '#888'}}>No orders yet</p>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="order-item">
                        <div className="order-info">
                          <span className="order-id">#{order.id}</span>
                          <span className="customer">{order.user?.full_name || 'Guest'}</span>
                        </div>
                        <span className="order-amount">₹{order.total_amount}</span>
                        <span className={`order-status ${order.status}`}>
                          {order.status}
                        </span>
                        <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-content">
            <div className="content-header">
              <h2>Manage Products ({products.length})</h2>
              <button className="add-product-btn" onClick={() => setActiveTab('add-product')}>
                <Plus size={18} />
                Add New Product
              </button>
            </div>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>No products yet. Add your first product!</td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-cell">
                            <img src={product.image} alt={product.name} />
                            <span>{product.name}</span>
                          </div>
                        </td>
                        <td><span className="category-badge">{product.category?.name || '-'}</span></td>
                        <td>{product.product_type || '-'}</td>
                        <td>₹{product.price}</td>
                        <td>{product.stock}</td>
                        <td>
                          <span className={`status-badge ${product.is_new ? 'new' : 'active'}`}>
                            {product.is_new ? 'New' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notifications-content">
            <h2>Recent Notifications</h2>
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell size={48} />
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    className={`notification-item ${notif.type}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="notif-icon">
                      <ShoppingCart size={20} />
                    </div>
                    <div className="notif-content">
                      <p>{notif.message}</p>
                      <span className="notif-time">{notif.time}</span>
                    </div>
                    <button
                      className="dismiss-btn"
                      onClick={() => clearNotification(notif.id)}
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>Products by Category</h3>
                <div className="category-stats">
                  {categories.length === 0 ? (
                    <p style={{color: '#888', textAlign: 'center'}}>No categories yet</p>
                  ) : (
                    categories.map((cat) => {
                      const count = products.filter(p => p.category_id === cat.id || p.category?.id === cat.id).length;
                      const percentage = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
                      return (
                        <div key={cat.id} className="category-bar">
                          <div className="bar-label">
                            <span>{cat.name}</span>
                            <span>{count} ({percentage}%)</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Revenue Overview</h3>
                <div className="revenue-stats">
                  <div className="revenue-item">
                    <span>Total Revenue</span>
                    <span className="amount">₹{stats.total_revenue?.toLocaleString() || 0}</span>
                  </div>
                  <div className="revenue-item">
                    <span>Total Orders</span>
                    <span className="amount">{stats.total_orders || 0}</span>
                  </div>
                  <div className="revenue-item">
                    <span>Pending Orders</span>
                    <span className="amount">{stats.pending_orders || 0}</span>
                  </div>
                  <div className="revenue-item">
                    <span>Avg. Order Value</span>
                    <span className="amount">₹{stats.total_orders > 0 ? Math.round(stats.total_revenue / stats.total_orders).toLocaleString() : 0}</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Store Statistics</h3>
                <div className="visitor-stats">
                  <div className="visitor-item">
                    <span>Total Users</span>
                    <span className="count">{stats.total_users || 0}</span>
                  </div>
                  <div className="visitor-item">
                    <span>Total Products</span>
                    <span className="count">{products.length}</span>
                  </div>
                  <div className="visitor-item">
                    <span>Categories</span>
                    <span className="count">{categories.length}</span>
                  </div>
                  <div className="visitor-item">
                    <span>Out of Stock</span>
                    <span className="count">{products.filter(p => p.stock === 0).length}</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Top Rated Products</h3>
                <div className="rated-products">
                  {[...products].sort((a, b) => b.rating - a.rating).slice(0, 5).map((p) => (
                    <div key={p.id} className="rated-item">
                      <span>{p.name}</span>
                      <span className="rating">
                        <Star size={14} fill="#f4c430" color="#f4c430" />
                        {p.rating}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="content-header">
              <h2>Registered Users ({users.length})</h2>
            </div>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{textAlign: 'center', padding: '2rem'}}>No users yet</td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const userOrders = orders.filter(o => o.user_id === user.id);
                      const totalSpent = userOrders.reduce((sum, o) => sum + o.total_amount, 0);
                      return (
                        <tr 
                          key={user.id} 
                          onClick={() => handleUserClick(user)}
                          style={{ cursor: 'pointer' }}
                          className="user-row"
                        >
                          <td>#{user.id}</td>
                          <td>
                            <div className="user-cell">
                              <span className="user-name">{user.full_name || 'N/A'}</span>
                              {user.is_admin && <span className="admin-tag">Admin</span>}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>{userOrders.length}</td>
                          <td>₹{totalSpent.toLocaleString()}</td>
                          <td>
                            <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-content">
            <h2>All Orders</h2>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No orders yet</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.user?.full_name || order.user?.email || 'Guest'}</td>
                        <td>₹{order.total_amount}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add-product' && (
          <div className="add-product-content">
            <div className="content-header">
              <button className="back-btn" onClick={() => setActiveTab('products')}>
                <ArrowLeft size={18} />
                Back to Products
              </button>
              <h2>Add New Product</h2>
            </div>

            {formMessage.text && (
              <div className={`form-message ${formMessage.type}`}>
                {formMessage.text}
              </div>
            )}

            <form className="product-form" onSubmit={handleProductSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={productForm.slug}
                    onChange={handleProductFormChange}
                    placeholder="auto-generated-slug"
                    readOnly
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    placeholder="Enter product description"
                    rows={4}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    placeholder="999"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    name="original_price"
                    value={productForm.original_price}
                    onChange={handleProductFormChange}
                    placeholder="1299 (for discount display)"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category_id"
                    value={productForm.category_id}
                    onChange={handleProductFormChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Product Type *</label>
                  <select
                    name="product_type"
                    value={productForm.product_type}
                    onChange={handleProductFormChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="serum">Serum</option>
                    <option value="cream">Cream</option>
                    <option value="oil">Oil</option>
                    <option value="tablet">Tablet</option>
                    <option value="scrub">Scrub</option>
                    <option value="lotion">Lotion</option>
                    <option value="mask">Mask</option>
                    <option value="cleanser">Cleanser</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    name="stock"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    placeholder="100"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Main Image *</label>
                  <div className="image-input-group">
                    <input
                      type="url"
                      name="image"
                      value={productForm.image}
                      onChange={handleProductFormChange}
                      placeholder="https://example.com/image.jpg or upload"
                    />
                    <label className="upload-btn">
                      <Upload size={18} />
                      {uploading ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {productForm.image && (
                    <div className="image-preview">
                      <img src={productForm.image} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Additional Images</label>
                  <div className="images-list">
                    {productForm.images.map((img, index) => (
                      <div key={index} className="image-item">
                        <img src={img} alt={`Product ${index + 1}`} />
                        <button type="button" onClick={() => handleRemoveImage(index)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="add-image-btn">
                      <Upload size={18} />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button type="button" className="add-image-btn" onClick={handleAddImage}>
                      <Plus size={18} />
                      Add URL
                    </button>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Ingredients (comma separated)</label>
                  <input
                    type="text"
                    name="ingredients"
                    value={productForm.ingredients}
                    onChange={handleProductFormChange}
                    placeholder="Vitamin C, Hyaluronic Acid, Niacinamide"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Benefits (comma separated)</label>
                  <input
                    type="text"
                    name="benefits"
                    value={productForm.benefits}
                    onChange={handleProductFormChange}
                    placeholder="Brightens skin, Reduces wrinkles, Hydrates"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_new"
                      checked={productForm.is_new}
                      onChange={handleProductFormChange}
                    />
                    Mark as New
                  </label>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_bestseller"
                      checked={productForm.is_bestseller}
                      onChange={handleProductFormChange}
                    />
                    Mark as Bestseller
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setActiveTab('products')}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeUserModal}>
          <motion.div 
            className="user-modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="modal-header">
              <h2>User Details</h2>
              <button className="close-modal" onClick={closeUserModal}>
                <X size={24} />
              </button>
            </div>

            {loadingUserDetails ? (
              <div className="modal-loading">Loading...</div>
            ) : userDetails ? (
              <div className="modal-content">
                {/* User Info */}
                <div className="user-info-section">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{userDetails.user.full_name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{userDetails.user.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{userDetails.user.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className={`status-badge ${userDetails.user.is_active ? 'active' : 'inactive'}`}>
                        {userDetails.user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Role:</span>
                      <span className="info-value">
                        {userDetails.user.is_admin ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Joined:</span>
                      <span className="info-value">
                        {new Date(userDetails.user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {userDetails.user.address && (
                    <div className="info-item full-width">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{userDetails.user.address}</span>
                    </div>
                  )}
                </div>

                {/* Shopping Stats */}
                <div className="shopping-stats-section">
                  <h3>Shopping Statistics</h3>
                  <div className="stats-cards">
                    <div className="stat-mini-card">
                      <span className="stat-mini-label">Total Orders</span>
                      <span className="stat-mini-value">{userDetails.shopping_stats.total_orders}</span>
                    </div>
                    <div className="stat-mini-card">
                      <span className="stat-mini-label">Total Spent</span>
                      <span className="stat-mini-value">₹{userDetails.shopping_stats.total_spent.toLocaleString()}</span>
                    </div>
                    <div className="stat-mini-card">
                      <span className="stat-mini-label">Pending Orders</span>
                      <span className="stat-mini-value">{userDetails.shopping_stats.pending_orders}</span>
                    </div>
                    <div className="stat-mini-card">
                      <span className="stat-mini-label">Completed Orders</span>
                      <span className="stat-mini-value">{userDetails.shopping_stats.completed_orders}</span>
                    </div>
                    <div className="stat-mini-card">
                      <span className="stat-mini-label">Avg Order Value</span>
                      <span className="stat-mini-value">₹{Math.round(userDetails.shopping_stats.average_order_value).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="recent-orders-section">
                  <h3>Recent Orders</h3>
                  {userDetails.recent_orders.length === 0 ? (
                    <p className="no-orders">No orders yet</p>
                  ) : (
                    <div className="orders-list-modal">
                      {userDetails.recent_orders.map((order) => (
                        <div key={order.id} className="order-card-modal">
                          <div className="order-card-header">
                            <span className="order-id">Order #{order.id}</span>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="order-card-body">
                            <div className="order-detail">
                              <span>Amount:</span>
                              <span className="amount">₹{order.total_amount}</span>
                            </div>
                            <div className="order-detail">
                              <span>Items:</span>
                              <span>{order.items_count}</span>
                            </div>
                            <div className="order-detail">
                              <span>Date:</span>
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="order-detail">
                              <span>Payment:</span>
                              <span className={`payment-status ${order.payment_status}`}>
                                {order.payment_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
