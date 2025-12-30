import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Demo credentials - in production, use proper authentication
  const ADMIN_EMAIL = 'admin@pureglow.in';
  const ADMIN_PASSWORD = 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true');
      onLogin();
      navigate('/admin/dashboard');
    } else {
      setError('Invalid credentials. Try admin@pureglow.in / admin123');
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

          <button type="submit" className="admin-login-btn">
            Sign In to Dashboard
          </button>
        </form>

        <p className="demo-hint">
          Demo: admin@pureglow.in / admin123
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
