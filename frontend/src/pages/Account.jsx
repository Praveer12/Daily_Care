import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Package, Clock, CheckCircle, Truck, XCircle, 
  Mail, Phone, MapPin, Edit2, LogOut, ChevronRight
} from 'lucide-react';
import { AuthContext } from '../App';
import { API_URL } from '../data/products';
import './Account.css';

const Account = () => {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <CheckCircle size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  if (!user) return null;

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Sidebar */}
        <aside className="account-sidebar">
          <div className="user-card">
            <div className="user-avatar">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2>{user.full_name || 'User'}</h2>
            <p>{user.email}</p>
          </div>

          <nav className="account-nav">
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={20} />
              My Orders
              <ChevronRight size={16} />
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={20} />
              Profile Details
              <ChevronRight size={16} />
            </button>
          </nav>

          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="account-main">
          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="orders-section"
            >
              <h1>My Orders</h1>
              
              {/* Order Stats */}
              <div className="order-stats">
                <div className="stat-card">
                  <span className="stat-number">{orders.length}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-card pending">
                  <span className="stat-number">{pendingOrders.length}</span>
                  <span className="stat-label">In Progress</span>
                </div>
                <div className="stat-card completed">
                  <span className="stat-number">{completedOrders.length}</span>
                  <span className="stat-label">Delivered</span>
                </div>
              </div>

              {loading ? (
                <div className="loading">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <Package size={64} />
                  <h3>No orders yet</h3>
                  <p>Start shopping to see your orders here!</p>
                  <button onClick={() => navigate('/products')} className="shop-btn">
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  {/* Active Orders */}
                  {pendingOrders.length > 0 && (
                    <div className="orders-group">
                      <h2>Active Orders</h2>
                      <div className="orders-list">
                        {pendingOrders.map(order => (
                          <div key={order.id} className="order-card">
                            <div className="order-header">
                              <span className="order-id">Order #{order.id}</span>
                              <span className={`order-status ${order.status}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </div>
                            <div className="order-details">
                              <div className="order-info">
                                <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                                <span>Items: {order.items?.length || 0}</span>
                              </div>
                              <div className="order-total">
                                <span>Total</span>
                                <span className="amount">₹{order.total_amount}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Completed Orders */}
                  {completedOrders.length > 0 && (
                    <div className="orders-group">
                      <h2>Delivered Orders</h2>
                      <div className="orders-list">
                        {completedOrders.map(order => (
                          <div key={order.id} className="order-card completed">
                            <div className="order-header">
                              <span className="order-id">Order #{order.id}</span>
                              <span className={`order-status ${order.status}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </div>
                            <div className="order-details">
                              <div className="order-info">
                                <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                                <span>Items: {order.items?.length || 0}</span>
                              </div>
                              <div className="order-total">
                                <span>Total</span>
                                <span className="amount">₹{order.total_amount}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="profile-section"
            >
              <h1>Profile Details</h1>
              
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="profile-name">
                    <h2>{user.full_name || 'User'}</h2>
                    <span className="member-since">
                      Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="profile-details">
                  <div className="detail-item">
                    <Mail size={20} />
                    <div>
                      <label>Email Address</label>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <Phone size={20} />
                    <div>
                      <label>Phone Number</label>
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <MapPin size={20} />
                    <div>
                      <label>Address</label>
                      <span>{user.address || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="account-status">
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active Account' : 'Inactive'}
                  </span>
                  {user.is_admin && (
                    <span className="status-badge admin">Admin</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Account;
