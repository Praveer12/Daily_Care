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
                <h3>Sales by Category</h3>
                <div className="category-stats">
                  {['skincare', 'haircare', 'wellness', 'bodycare'].map((cat) => {
                    const count = products.filter(p => p.category === cat).length;
                    const percentage = Math.round((count / products.length) * 100);
                    return (
                      <div key={cat} className="category-bar">
                        <div className="bar-label">
                          <span>{cat}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="analytics-card">
                <h3>Revenue Overview</h3>
                <div className="revenue-stats">
                  <div className="revenue-item">
                    <span>Today</span>
                    <span className="amount">₹12,450</span>
                  </div>
                  <div className="revenue-item">
                    <span>This Week</span>
                    <span className="amount">₹89,320</span>
                  </div>
                  <div className="revenue-item">
                    <span>This Month</span>
                    <span className="amount">₹3,45,670</span>
                  </div>
                  <div className="revenue-item">
                    <span>This Year</span>
                    <span className="amount">₹42,56,890</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Visitor Statistics</h3>
                <div className="visitor-stats">
                  <div className="visitor-item">
                    <span>Page Views</span>
                    <span className="count">45,678</span>
                  </div>
                  <div className="visitor-item">
                    <span>Unique Visitors</span>
                    <span className="count">12,345</span>
                  </div>
                  <div className="visitor-item">
                    <span>Bounce Rate</span>
                    <span className="count">32%</span>
                  </div>
                  <div className="visitor-item">
                    <span>Avg. Session</span>
                    <span className="count">4m 32s</span>
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
    </div>
  );
};

export default AdminDashboard;
