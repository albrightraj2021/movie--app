import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { login as loginService } from '../services/auth';
import './AuthForm.css'; // Shared CSS for Register and Login

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [longExpiry, setLongExpiry] = useState(false); // For testing, not for final submission if handling expiry
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginService(email, password, longExpiry);
      login(email, data.bearerToken.token, data.refreshToken.token); // Update context
      navigate('/'); // Redirect to home or dashboard
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* 
        // Optional: Long Expiry for testing - remove or hide for production if not using it
        // as per assignment spec for higher grades.
        <div className="form-group form-group-checkbox">
          <input
            type="checkbox"
            id="longExpiry"
            checked={longExpiry}
            onChange={(e) => setLongExpiry(e.target.checked)}
          />
          <label htmlFor="longExpiry">Keep me logged in longer (for testing)</label>
        </div>
        */}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
