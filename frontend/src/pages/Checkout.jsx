import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, CreditCard, Truck, ArrowLeft, CheckCircle } from 'lucide-react';
import { CartContext, AuthContext } from '../App';
import { API_URL } from '../data/products';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  const shipping = cartTotal > 999 ? 0 : 99;
  const tax = cartTotal * 0.18;
  const total = cartTotal + shipping + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user || !token) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity
        })),
        shipping_address: {
          full_name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        payment_method: formData.paymentMethod
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        const order = await res.json();
        setOrderId(order.id);
        setOrderPlaced(true);
        clearCart();
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to place order');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="login-required">
            <h2>Please login to checkout</h2>
            <Link to="/login" className="btn-primary">Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="container">
          <motion.div 
            className="order-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle size={80} color="#4CAF50" />
            <h2>Order Placed Successfully!</h2>
            <p>Your order #{orderId} has been placed.</p>
            <p>We'll send you updates on your phone and email.</p>
            <div className="success-actions">
              <Link to="/account" className="btn-primary">View Orders</Link>
              <Link to="/products" className="btn-secondary">Continue Shopping</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="login-required">
            <h2>Your cart is empty</h2>
            <Link to="/products" className="btn-primary">Shop Now</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <Link to="/cart" className="back-link">
          <ArrowLeft size={18} /> Back to Cart
        </Link>
        
        <h1>Checkout</h1>

        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3><MapPin size={20} /> Shipping Address</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3><CreditCard size={20} /> Payment Method</h3>
              
              <div className="payment-options">
                <label className={`payment-option ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                  />
                  <Truck size={24} />
                  <div>
                    <span>Cash on Delivery</span>
                    <small>Pay when you receive</small>
                  </div>
                </label>

                <label className={`payment-option ${formData.paymentMethod === 'online' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleChange}
                  />
                  <CreditCard size={24} />
                  <div>
                    <span>Online Payment</span>
                    <small>UPI, Card, Net Banking</small>
                  </div>
                </label>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(0)}`}
            </button>
          </form>

          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <span>{item.name}</span>
                    <small>Qty: {item.quantity}</small>
                  </div>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="summary-row">
                <span>GST (18%)</span>
                <span>₹{tax.toFixed(0)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
