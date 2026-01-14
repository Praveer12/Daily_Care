import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Star, Eye } from 'lucide-react';
import { CartContext, WishlistContext } from '../App';
import './ProductCard.css';

const ProductCard = ({ product, index }) => {
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div
      className="product-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`} className="product-link">
        <div className="product-image-wrapper">
          <img src={product.image} alt={product.name} className="product-image" />

          <div className="product-badges">
            {product.is_new && <span className="badge badge-new">New</span>}
            {product.is_bestseller && <span className="badge badge-bestseller">Bestseller</span>}
            {product.original_price && (
              <span className="badge badge-sale">
                -{Math.round((1 - product.price / product.original_price) * 100)}%
              </span>
            )}
          </div>

          <div className="product-actions">
            <button
              className={`action-btn wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlist}
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <Link to={`/product/${product.id}`} className="action-btn quick-view-btn">
              <Eye size={18} />
            </Link>
          </div>

          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            <ShoppingBag size={18} />
            Add to Cart
          </button>
        </div>

        <div className="product-info">
          <span className="product-category">{product.category?.name || product.product_type || 'Product'}</span>
          <h3 className="product-name">{product.name}</h3>

          <div className="product-rating">
            <Star size={14} fill="#f4c430" color="#f4c430" />
            <span>{product.rating || 0}</span>
            <span className="review-count">({product.reviews_count || 0})</span>
          </div>

          <div className="product-price">
            <span className="current-price">₹{product.price}</span>
            {product.original_price && (
              <span className="original-price">₹{product.original_price}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
