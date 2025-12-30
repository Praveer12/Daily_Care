import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { CartContext, WishlistContext } from '../App';
import './Wishlist.css';

const Wishlist = () => {
  const { addToCart } = useContext(CartContext);
  const { wishlistItems, removeFromWishlist } = useContext(WishlistContext);

  const handleAddToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="wishlist-page empty">
        <div className="container">
          <motion.div
            className="empty-wishlist"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Heart size={80} />
            <h2>Your wishlist is empty</h2>
            <p>Save items you love by clicking the heart icon on products.</p>
            <Link to="/products" className="btn-primary">
              Explore Products
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <motion.div
          className="wishlist-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1><Heart size={32} /> My Wishlist</h1>
          <p>{wishlistItems.length} items saved</p>
        </motion.div>

        <div className="wishlist-grid">
          {wishlistItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="wishlist-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/product/${item.id}`} className="wishlist-image">
                <img src={item.image} alt={item.name} />
              </Link>
              <div className="wishlist-details">
                <span className="wishlist-category">{item.category}</span>
                <Link to={`/product/${item.id}`}>
                  <h3>{item.name}</h3>
                </Link>
                <div className="wishlist-price">
                  <span className="current">₹{item.price}</span>
                  {item.originalPrice && (
                    <span className="original">₹{item.originalPrice}</span>
                  )}
                </div>
                <div className="wishlist-actions">
                  <button
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingBag size={18} />
                    Add to Cart
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
