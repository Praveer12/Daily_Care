import { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Menu, X, Search, Heart, User, ChevronDown } from 'lucide-react';
import { CartContext, WishlistContext } from '../App';
import CartSidebar from './CartSidebar';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { cartCount, isCartOpen, setIsCartOpen } = useContext(CartContext);
  const { wishlistCount } = useContext(WishlistContext);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setIsSearchOpen(false);
  }, [location]);

  const productTypes = [
    { id: 'serum', name: 'Serums', icon: '💧' },
    { id: 'cream', name: 'Creams', icon: '🧴' },
    { id: 'oil', name: 'Oils', icon: '🫒' },
    { id: 'tablet', name: 'Tablets', icon: '💊' },
    { id: 'scrub', name: 'Scrubs', icon: '✨' },
  ];

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Shop' },
    { 
      path: '/products?category=skincare', 
      label: 'Skincare',
      hasDropdown: true,
      dropdownItems: productTypes.filter(t => ['serum', 'cream', 'oil'].includes(t.id))
    },
    { 
      path: '/products?category=haircare', 
      label: 'Haircare',
      hasDropdown: true,
      dropdownItems: productTypes.filter(t => ['serum', 'cream', 'oil'].includes(t.id))
    },
    { 
      path: '/products?category=wellness', 
      label: 'Wellness',
      hasDropdown: true,
      dropdownItems: productTypes.filter(t => ['tablet', 'oil', 'cream'].includes(t.id))
    },
    { path: '/about', label: 'About' },
  ];

  return (
    <>
      <motion.nav
        className={`navbar ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="navbar-container">
          <Link to="/" className="logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">PureGlow</span>
          </Link>

          <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <div
                key={link.path}
                className="nav-item"
                onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown size={14} />}
                </Link>
                
                {link.hasDropdown && activeDropdown === link.label && (
                  <motion.div
                    className="dropdown-menu"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    {link.dropdownItems.map((item) => (
                      <Link
                        key={item.id}
                        to={`/products?category=${link.label.toLowerCase()}&type=${item.id}`}
                        className="dropdown-item"
                      >
                        <span>{item.icon}</span>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                    <Link to={link.path} className="dropdown-item view-all">
                      View All →
                    </Link>
                  </motion.div>
                )}
              </div>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="nav-icon-btn search-btn"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="nav-icon-btn">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="badge wishlist-badge">{wishlistCount}</span>
              )}
            </Link>
            <Link to="/login" className="nav-icon-btn">
              <User size={20} />
            </Link>
            <button
              className="nav-icon-btn cart-btn"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="badge cart-badge">{cartCount}</span>
              )}
            </button>
            <button
              className="menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              className="search-bar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="search-container">
                <Search size={20} />
                <input type="text" placeholder="Search products..." autoFocus />
                <button onClick={() => setIsSearchOpen(false)}>
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
