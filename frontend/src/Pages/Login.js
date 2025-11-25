// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../App.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        navigate('/home');
      }
    } catch (err) {
      // 1. Check for specific validation errors (e.g., "Password must be at least 8 characters")
      const validationErrors = err.response?.data?.errors;
      
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        // Show the specific validation message
        setError(validationErrors[0].message);
      } else {
        // 2. Otherwise show the general error (e.g., "Invalid credentials")
        setError(err.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="top-right-nav">
        <button onClick={() => navigate('/register')} className="nav-btn">
          Register
        </button>
      </div>

      <div className="auth-form-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;