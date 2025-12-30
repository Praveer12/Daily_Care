import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Youtube, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <motion.div
            className="newsletter-section"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="newsletter-content">
              <h3>Join Our Glow Community</h3>
              <p>Subscribe for exclusive offers, skincare tips, and new product launches.</p>
            </div>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit">
                Subscribe <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="logo-icon">🌿</span>
                <span>PureGlow</span>
              </Link>
              <p>Discover the power of nature with our premium daily care products. Clean beauty for a radiant you.</p>
              <div className="social-links">
                <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                <a href="#" aria-label="Youtube"><Youtube size={20} /></a>
              </div>
            </div>

            <div className="footer-links">
              <h4>Shop</h4>
              <ul>
                <li><Link to="/products/skincare">Skincare</Link></li>
                <li><Link to="/products/haircare">Haircare</Link></li>
                <li><Link to="/products/wellness">Wellness</Link></li>
                <li><Link to="/products/bodycare">Body Care</Link></li>
                <li><Link to="/products">All Products</Link></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
                <li><a href="#">Sustainability</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Support</h4>
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Shipping</a></li>
                <li><a href="#">Returns</a></li>
                <li><a href="#">Track Order</a></li>
                <li><a href="#">Size Guide</a></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4>Contact Us</h4>
              <ul>
                <li>
                  <MapPin size={18} />
                  <span>42, Connaught Place, New Delhi, 110001</span>
                </li>
                <li>
                  <Phone size={18} />
                  <span>+91 98765 43210</span>
                </li>
                <li>
                  <Mail size={18} />
                  <span>hello@pureglow.in</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {currentYear} PureGlow. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
