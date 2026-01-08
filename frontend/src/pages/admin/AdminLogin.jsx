import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield } from 'lucide-react';
import { API_URL } from '../../data/products';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login via API
      const formBody = new URLSearchParams();
      formBody.append('username', credentials.email);
      formBody.append('password', credentials.password);

      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody
      });

      console.log('Login response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Login successful, got token');
        localStorage.setItem('token', data.access_token);
        
        // Check if user is admin
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        
        console.log('User info response status:', userRes.status);
        
        if (userRes.ok) {
          const user = await userRes.json();
          console.log('User info:', user);
          if (user.is_admin) {
            localStorage.setItem('adminAuth', 'true');
            localStorage.setItem('user', JSON.stringify(user));
            onLogin();
            navigate('/admin/dashboard');
          } else {
            setError('Access denied. Admin privileges required.');
            localStorage.removeItem('token');
          }
        } else {
          const errData = await userRes.json();
          console.log('User info error:', errData);
          setError('Failed to get user info');
        }
      } else {
        const err = await res.json();
        console.log('Login error:', err);
        setError(err.detail || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="admin-login-header">
          <div className="admin-icon">
            <Shield size={40} />
          </div>
          <h1>Admin Panel</h1>
          <p>Sign in to access the dashboard</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="admin@pureglow.in"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <p className="demo-hint">
          Use your admin account credentials
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
