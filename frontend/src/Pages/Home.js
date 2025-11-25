import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css'; // ✅ Updated import to use the new specific CSS file

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading-container">Loading products...</div>;
  if (error) return <div className="error-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="home-container">
      {/* Header / Navbar */}
      <header className="home-header">
        <h1>E-Commerce Store</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {/* Product Grid */}
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="product-card">
              {/* Display first image or a placeholder */}
              <img 
                src={product.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
                alt={product.name} 
                className="product-image" 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'; }}
              />
              <div className="product-info">
                <div className="product-category">{product.category}</div>
                <h3>{product.name}</h3>
                <p className="product-description">
                  {product.description.length > 80 
                    ? product.description.substring(0, 80) + '...' 
                    : product.description}
                </p>
                <div className="product-footer">
                  <span className="product-price">${product.price}</span>
                  <button className="add-btn">Add to Cart</button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No products found.</p>
            <small>Use Postman to add products to your database.</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;