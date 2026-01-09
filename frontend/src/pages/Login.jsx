import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Smartphone } from 'lucide-react';
import { API_URL } from '../data/products';
import { AuthContext } from '../App';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('email');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: phone, 2: otp, 3: new password
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleForgotPassword = async () => {
    if (forgotStep === 1) {
      // Send OTP
      if (!formData.phone) {
        setError('Please enter your phone number');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone })
        });
        if (res.ok) {
          const data = await res.json();
          setForgotStep(2);
          if (data.otp_debug) {
            alert(`OTP sent! (Debug: ${data.otp_debug})`);
          }
        } else {
          const err = await res.json();
          setError(err.detail || 'Failed to send OTP');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (forgotStep === 2) {
      // Verify OTP entered, move to password step
      if (!formData.otp) {
        setError('Please enter the OTP');
        return;
      }
      setForgotStep(3);
      setError('');
    } else if (forgotStep === 3) {
      // Reset password
      if (!formData.newPassword || !formData.confirmPassword) {
        setError('Please enter new password');
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: formData.phone,
            otp: formData.otp,
            new_password: formData.newPassword
          })
        });
        if (res.ok) {
          alert('Password reset successfully! Please login with your new password.');
          setShowForgotPassword(false);
          setForgotStep(1);
          setFormData({ ...formData, otp: '', newPassword: '', confirmPassword: '' });
        } else {
          const err = await res.json();
          setError(err.detail || 'Failed to reset password');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setError('');
    setFormData({ ...formData, otp: '', newPassword: '', confirmPassword: '' });
  };

  const handleSendOTP = async () => {
    if (!formData.phone) {
      setError('Please enter your phone number');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      if (res.ok) {
        const data = await res.json();
        setOtpSent(true);
        if (data.otp_debug) {
          alert(`OTP sent! (Debug: ${data.otp_debug})`);
        }
      } else {
        const err = await res.json();
        setError(err.detail || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp })
      });
      if (res.ok) {
        const data = await res.json();
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` }
        });
        if (userRes.ok) {
          const user = await userRes.json();
          login(user, data.access_token);
        }
        navigate('/');
      } else {
        const err = await res.json();
        setError(err.detail || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin && loginMethod === 'phone' && otpSent) {
      handleVerifyOTP();
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const formBody = new URLSearchParams();
        formBody.append('username', formData.email);
        formBody.append('password', formData.password);
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody
        });
        if (res.ok) {
          const data = await res.json();
          const userRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${data.access_token}` }
          });
          if (userRes.ok) {
            const user = await userRes.json();
            login(user, data.access_token);
          }
          navigate('/');
        } else {
          const err = await res.json();
          setError(err.detail || 'Login failed');
        }
      } else {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            full_name: formData.name,
            phone: formData.phone
          })
        });
        if (res.ok) {
          setIsLogin(true);
          setError('');
          alert('Account created! Please sign in.');
        } else {
          const err = await res.json();
          setError(err.detail || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchLoginMethod = (method) => {
    setLoginMethod(method);
    setOtpSent(false);
    setError('');
    setFormData({ ...formData, otp: '' });
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <motion.div className="login-image" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800" alt="Beauty Products" />
          <div className="login-image-overlay">
            <h2>Welcome to PureGlow</h2>
            <p>Discover the power of natural beauty</p>
          </div>
        </motion.div>

        <motion.div className="login-form-wrapper" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="login-header">
            <Link to="/" className="login-logo"><span>🌿</span> PureGlow</Link>
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Sign in to continue shopping' : 'Join our glow community'}</p>
          </div>

          {/* Login Method Toggle */}
          {isLogin && (
            <div className="login-method-toggle">
              <button
                type="button"
                className={`method-btn ${loginMethod === 'email' ? 'active' : ''}`}
                onClick={() => switchLoginMethod('email')}
              >
                <Mail size={18} /> Email
              </button>
              <button
                type="button"
                className={`method-btn ${loginMethod === 'phone' ? 'active' : ''}`}
                onClick={() => switchLoginMethod('phone')}
              >
                <Smartphone size={18} /> Phone OTP
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" required />
                </div>
              </div>
            )}

            {/* Email Login Fields */}
            {(loginMethod === 'email' || !isLogin) && (
              <>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Phone OTP Login Fields */}
            {isLogin && loginMethod === 'phone' && (
              <>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <div className="input-wrapper">
                    <Phone size={18} />
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required disabled={otpSent} />
                  </div>
                </div>

                {otpSent && (
                  <div className="form-group">
                    <label htmlFor="otp">Enter OTP *</label>
                    <div className="input-wrapper">
                      <Lock size={18} />
                      <input type="text" id="otp" name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter 6-digit OTP" maxLength={6} required />
                    </div>
                    <button type="button" className="resend-otp" onClick={handleSendOTP} disabled={loading}>
                      Resend OTP
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Phone field for registration */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <div className="input-wrapper">
                  <Phone size={18} />
                  <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" required />
                </div>
              </div>
            )}

            {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

            {isLogin && loginMethod === 'email' && (
              <div className="form-options">
                <label className="remember-me"><input type="checkbox" /><span>Remember me</span></label>
                <button type="button" className="forgot-password" onClick={() => setShowForgotPassword(true)}>Forgot Password?</button>
              </div>
            )}

            {/* Submit Button */}
            {isLogin && loginMethod === 'phone' && !otpSent ? (
              <button type="button" className="login-btn" onClick={handleSendOTP} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            ) : (
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Please wait...' : (isLogin ? (loginMethod === 'phone' ? 'Verify OTP' : 'Sign In') : 'Create Account')}
              </button>
            )}

            {!isLogin && (
              <>
                <div className="divider"><span>or continue with</span></div>
                <div className="social-login">
                  <button type="button" className="social-btn google">
                    <img src="https://www.google.com/favicon.ico" alt="Google" /> Google
                  </button>
                  <button type="button" className="social-btn facebook">
                    <img src="https://www.facebook.com/favicon.ico" alt="Facebook" /> Facebook
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="switch-form">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setLoginMethod('email'); setOtpSent(false); setError(''); }}>
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={closeForgotPassword}>
          <motion.div 
            className="forgot-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeForgotPassword}>&times;</button>
            <h2>Reset Password</h2>
            
            {forgotStep === 1 && (
              <>
                <p>Enter your registered phone number to receive OTP</p>
                <div className="form-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <p>Enter the OTP sent to {formData.phone}</p>
                <div className="form-group">
                  <label>OTP</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                </div>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <p>Create your new password</p>
                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </>
            )}

            {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

            <button className="login-btn" onClick={handleForgotPassword} disabled={loading}>
              {loading ? 'Please wait...' : (forgotStep === 1 ? 'Send OTP' : forgotStep === 2 ? 'Verify OTP' : 'Reset Password')}
            </button>

            {forgotStep > 1 && (
              <button className="back-btn" onClick={() => { setForgotStep(forgotStep - 1); setError(''); }}>
                ← Back
              </button>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;
