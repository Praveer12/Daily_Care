import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import { products as initialProducts } from './data/products';
import './App.css';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

export const CartContext = createContext();
export const WishlistContext = createContext();
export const AdminContext = createContext();
export const AuthContext = createContext();

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(localStorage.getItem('adminAuth') === 'true');
  const [products, setProducts] = useState(initialProducts);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 425690,
    totalOrders: 1247,
    siteVisitors: 12458,
  });
  
  // User authentication state
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Auth functions
  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', accessToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminAuth');
    setIsAdminAuth(false);
  };

  // Increment visitor count on mount
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      siteVisitors: prev.siteVisitors + 1
    }));
  }, []);

  // Cart functions
  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // Add notification for admin
    const newNotification = {
      id: Date.now(),
      type: 'cart',
      message: `${product.name} was added to cart`,
      time: new Date().toLocaleTimeString(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  // Wishlist functions
  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  // Admin functions
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Math.max(...products.map(p => p.id)) + 1,
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (productId, updates) => {
    setProducts(prev =>
      prev.map(p => p.id === productId ? { ...p, ...updates } : p)
    );
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Protected Route Component
  const ProtectedAdminRoute = ({ children }) => {
    if (!isAdminAuth) {
      return <Navigate to="/admin" replace />;
    }
    return children;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <CartContext.Provider value={{
        cartItems, addToCart, removeFromCart, updateQuantity,
        cartTotal, cartCount, isCartOpen, setIsCartOpen
      }}>
        <WishlistContext.Provider value={{
          wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount
        }}>
          <AdminContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct,
            stats, notifications, clearNotification
          }}>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Admin Routes - No Navbar/Footer */}
                <Route
                  path="/admin"
                  element={
                    isAdminAuth ?
                      <Navigate to="/admin/dashboard" replace /> :
                      <AdminLogin onLogin={() => setIsAdminAuth(true)} />
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedAdminRoute>
                      <AdminDashboard onLogout={() => { setIsAdminAuth(false); logout(); }} />
                    </ProtectedAdminRoute>
                  }
                />

                {/* Public Routes - With Navbar/Footer */}
                <Route
                  path="/*"
                  element={
                    <div className="app">
                      <Navbar />
                      <main>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:category" element={<Products />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/account" element={<Account />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  }
                />
              </Routes>
            </Router>
          </AdminContext.Provider>
        </WishlistContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
