// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const navigate = useNavigate();
  // Fields match backend/validators/auth.validator.js
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.data.success) {
        // Store token automatically on register (optional)
        localStorage.setItem('token', response.data.data.token);
        // Navigate to Home Page
        navigate('/home');
      }
    } catch (err) {
      // Handle specific validation errors from your backend array
      const msg = err.response?.data?.message || 'Registration failed';
      const valErrors = err.response?.data?.error; // Your backend returns validation errors here
      
      if (Array.isArray(valErrors) && valErrors.length > 0) {
        setError(valErrors[0].message); // Show first validation error
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="top-right-nav">
        <button onClick={() => navigate('/')} className="nav-btn">
          Back to Login
        </button>
      </div>

      <div className="auth-form-box">
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input type="text" name="name" placeholder="Name (3-15 chars)" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="password" name="password" placeholder="Password (Min 8, Upper, Lower, Number)" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="phone" placeholder="Phone (10 digits)" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <input type="text" name="address" placeholder="Address (5-100 chars)" onChange={handleChange} required />
          </div>
          <button type="submit" className="submit-btn">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default Register;