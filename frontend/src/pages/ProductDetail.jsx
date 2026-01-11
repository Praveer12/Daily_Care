import { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Minus, Plus, ShoppingBag, Truck, RefreshCw, Shield, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { CartContext, WishlistContext } from '../App';
import ProductCard from '../components/ProductCard';
import { API_URL } from '../data/products';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          // Fetch related products from same category
          const relatedRes = await fetch(`${API_URL}/api/products?category=${data.category?.slug || ''}&limit=4`);
          if (relatedRes.ok) {
            const relatedData = await relatedRes.json();
            setRelatedProducts(relatedData.filter(p => p.id !== data.id).slice(0, 4));
          }
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Check if product is in wishlist
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Generate multiple images for gallery (using same image with different angles simulation)
  const productImages = product ? [
    product.image,
    ...(product.images || []),
  ].filter(Boolean) : [];
  
  // Ensure at least one image
  if (productImages.length === 0 && product) {
    productImages.push(product.image);
  }

  if (loading) {
    return (
      <div className="product-not-found">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <Link to="/products" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category?.slug || ''}`}>{product.category?.name || 'Category'}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>

        {/* Product Main Section */}
        <div className="product-main">
          <motion.div
            className="product-gallery"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="main-image">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImageIndex}
                  src={productImages[activeImageIndex]}
                  alt={`${product.name} - View ${activeImageIndex + 1}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
              {product.isNew && <span className="badge badge-new">New</span>}
              {product.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
              
              {/* Navigation Arrows */}
              <button className="gallery-nav prev" onClick={prevImage}>
                <ChevronLeft size={20} />
              </button>
              <button className="gallery-nav next" onClick={nextImage}>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="thumbnail-strip">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveImageIndex(index)}
                >
                  <img src={img} alt={`Thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="product-info"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="product-category">{product.category?.name || 'Category'}</span>
            <h1>{product.name}</h1>

            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < Math.floor(product.rating || 0) ? '#f4c430' : 'none'}
                    color="#f4c430"
                  />
                ))}
              </div>
              <span>{product.rating || 0}</span>
              <span className="reviews">({product.reviews_count || 0} reviews)</span>
            </div>

            <div className="product-price">
              <span className="current">₹{product.price}</span>
              {product.original_price && (
                <>
                  <span className="original">₹{product.original_price}</span>
                  <span className="discount">
                    Save {Math.round((1 - product.price / product.original_price) * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={16} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={16} />
                </button>
              </div>

              <button className="add-to-cart" onClick={handleAddToCart}>
                <ShoppingBag size={18} />
                Add to Cart
              </button>

              <button
                className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggle}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            <p className="product-description">{product.description}</p>

            <div className="product-features">
              <div className="feature">
                <Truck size={16} />
                <span>Free shipping over ₹999</span>
              </div>
              <div className="feature">
                <RefreshCw size={16} />
                <span>7-day returns</span>
              </div>
              <div className="feature">
                <Shield size={16} />
                <span>2-year warranty</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          <div className="tabs-header">
            <button
              className={activeTab === 'description' ? 'active' : ''}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={activeTab === 'ingredients' ? 'active' : ''}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button>
            <button
              className={activeTab === 'benefits' ? 'active' : ''}
              onClick={() => setActiveTab('benefits')}
            >
              Benefits
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="tab-panel"
              >
                <p>{product.description}</p>
                <p>
                  Our products are carefully formulated with the finest natural ingredients
                  to deliver visible results. Each product undergoes rigorous testing to
                  ensure safety and efficacy.
                </p>
              </motion.div>
            )}

            {activeTab === 'ingredients' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="tab-panel"
              >
                <ul className="ingredients-list">
                  {product.ingredients.map((ingredient, index) => (
                    <li key={index}>
                      <Check size={16} />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {activeTab === 'benefits' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="tab-panel"
              >
                <ul className="benefits-list">
                  {product.benefits.map((benefit, index) => (
                    <li key={index}>
                      <Check size={16} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>You May Also Like</h2>
            <div className="products-grid">
              {relatedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
