import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Leaf, Sparkles, Heart, Shield, Star, Truck, RefreshCw, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { categories, testimonials, fetchProducts } from '../data/products';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const allProducts = await fetchProducts();
      setFeaturedProducts(allProducts.filter(p => p.isBestseller).slice(0, 4));
      setNewArrivals(allProducts.filter(p => p.isNew).slice(0, 4));
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="container hero-container">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-badge">
              <Sparkles size={16} /> Natural & Organic
            </span>
            <h1>
              Discover Your
              <span className="highlight"> Natural Glow</span>
            </h1>
            <p>
              Premium skincare, haircare, and wellness products crafted with nature's finest ingredients. 
              Experience the transformation your body deserves.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn-primary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn-secondary">
                Our Story
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Natural Ingredients</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.9</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="hero-image"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600"
                alt="Natural Organic Products"
              />
              <div className="floating-card card-1">
                <Leaf size={24} />
                <span>100% Organic</span>
              </div>
              <div className="floating-card card-2">
                <Heart size={24} />
                <span>Nature's Best</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="features-bar">
        <div className="container">
          <div className="features-grid">
            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Truck size={28} />
              <div>
                <h4>Free Shipping</h4>
                <p>On orders over ₹999</p>
              </div>
            </motion.div>
            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <RefreshCw size={28} />
              <div>
                <h4>Easy Returns</h4>
                <p>7-day return policy</p>
              </div>
            </motion.div>
            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Shield size={28} />
              <div>
                <h4>Secure Payment</h4>
                <p>100% secure checkout</p>
              </div>
            </motion.div>
            <motion.div
              className="feature"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Headphones size={28} />
              <div>
                <h4>24/7 Support</h4>
                <p>Dedicated support team</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Explore</span>
            <h2>Shop by Category</h2>
            <p>Find the perfect products for your daily care routine</p>
          </motion.div>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                className="category-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/products?category=${category.id}`}>
                  <div className="category-image">
                    <img src={category.image} alt={category.name} />
                    <div className="category-overlay">
                      <span className="category-icon">{category.icon}</span>
                    </div>
                  </div>
                  <div className="category-content">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <span className="category-link">
                      Shop Now <ArrowRight size={16} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="products-section bestsellers">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Top Picks</span>
            <h2>Bestsellers</h2>
            <p>Our most loved products by thousands of happy customers</p>
          </motion.div>
          <div className="products-grid">
            {isLoading ? (
              <p className="loading-text">Loading products...</p>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <p className="no-products-text">No bestsellers available yet.</p>
            )}
          </div>
          <motion.div
            className="section-cta"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/products" className="btn-outline">
              View All Products <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="promo-banner">
        <div className="container">
          <motion.div
            className="banner-content"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="banner-text">
              <span className="banner-tag">Limited Time Offer</span>
              <h2>Get 25% Off Your First Order</h2>
              <p>Use code GLOW25 at checkout. Valid for new customers only.</p>
              <Link to="/products" className="btn-accent">
                Shop Now <ArrowRight size={18} />
              </Link>
            </div>
            <div className="banner-image">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500"
                alt="Natural Wellness"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="products-section new-arrivals">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Fresh In</span>
            <h2>New Arrivals</h2>
            <p>Discover our latest additions to the collection</p>
          </motion.div>
          <div className="products-grid">
            {isLoading ? (
              <p className="loading-text">Loading products...</p>
            ) : newArrivals.length > 0 ? (
              newArrivals.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            ) : (
              <p className="no-products-text">No new arrivals yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-us-section">
        <div className="container">
          <div className="why-us-grid">
            <motion.div
              className="why-us-content"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="section-tag">Why PureGlow</span>
              <h2>Beauty That Cares</h2>
              <p>
                We believe in the power of nature to transform your daily care routine. 
                Our products are crafted with love, using only the finest natural ingredients.
              </p>
              <div className="why-us-features">
                <div className="why-feature">
                  <div className="why-icon">
                    <Leaf size={24} />
                  </div>
                  <div>
                    <h4>100% Natural</h4>
                    <p>Pure ingredients sourced from nature</p>
                  </div>
                </div>
                <div className="why-feature">
                  <div className="why-icon">
                    <Heart size={24} />
                  </div>
                  <div>
                    <h4>Cruelty Free</h4>
                    <p>Never tested on animals</p>
                  </div>
                </div>
                <div className="why-feature">
                  <div className="why-icon">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4>Dermatologist Tested</h4>
                    <p>Safe for all skin types</p>
                  </div>
                </div>
                <div className="why-feature">
                  <div className="why-icon">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4>Sustainable</h4>
                    <p>Eco-friendly packaging</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="why-us-image"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"
                alt="Natural Organic Ingredients"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">Reviews</span>
            <h2>What Our Customers Say</h2>
            <p>Real stories from real people who love PureGlow</p>
          </motion.div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#f4c430" color="#f4c430" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="instagram-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">@pureglow</span>
            <h2>Follow Us on Instagram</h2>
            <p>Join our community and share your glow journey</p>
          </motion.div>
          <div className="instagram-grid">
            {[
              'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=300',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
              'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=300',
              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300',
              'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=300',
              'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=300',
            ].map((img, index) => (
              <motion.a
                key={index}
                href="#"
                className="instagram-item"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={img} alt={`Instagram ${index + 1}`} />
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
