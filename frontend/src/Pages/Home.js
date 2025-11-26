import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState('');
  const [productStock, setProductStock] = useState({}); // Track local stock changes

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.data.success) {
          setProducts(response.data.products);
          setFilteredProducts(response.data.products);
          
          // Initialize stock tracking with original stock values
          const stockMap = {};
          response.data.products.forEach(product => {
            stockMap[product._id] = product.stock;
          });
          setProductStock(stockMap);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleAddToCart = (product) => {
    const currentStock = productStock[product._id] || 0;

    if (currentStock <= 0) {
      setNotification('❌ Product is out of stock!');
      return;
    }

    // Add to cart
    setCart([...cart, product]);

    // Reduce stock by 1
    setProductStock(prev => ({
      ...prev,
      [product._id]: prev[product._id] - 1
    }));

    // Show success notification
    setNotification(`✅ ${product.name} added to cart!`);
  };

  const handleRemoveFromCart = (index, product) => {
    // Remove from cart
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);

    // Restore stock
    setProductStock(prev => ({
      ...prev,
      [product._id]: prev[product._id] + 1
    }));

    setNotification(`↩️ Removed from cart`);
  };

  const handleClearCart = () => {
    // Restore all stock for items in cart
    const cartProducts = {};
    cart.forEach(product => {
      cartProducts[product._id] = (cartProducts[product._id] || 0) + 1;
    });

    setProductStock(prev => {
      const updated = { ...prev };
      Object.keys(cartProducts).forEach(productId => {
        // Find the original product to get its original stock
        const originalProduct = products.find(p => p._id === productId);
        if (originalProduct) {
          updated[productId] = originalProduct.stock - cart.filter(p => p._id === productId).length + cartProducts[productId];
        }
      });
      return updated;
    });

    setCart([]);
    setNotification('🗑️ Cart cleared!');
  };

  const getCartItemCount = (productId) => {
    return cart.filter(item => item._id === productId).length;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Notification Toast */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">🛍️ ShopHub</h1>
          <div className="header-right">
            <div className="cart-badge">
              🛒 Cart ({cart.length})
              {cart.length > 0 && (
                <button onClick={handleClearCart} className="clear-cart-btn" title="Clear Cart">
                  ✕
                </button>
              )}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search products, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="filter-section">
        <h3 className="filter-title">Categories</h3>
        <div className="category-grid">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-btn ${
                selectedCategory === category ? 'category-btn-active' : ''
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>
          Found <strong>{filteredProducts.length}</strong> product(s)
        </p>
      </div>

      {/* Products Grid */}
      <main className="main-content">
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => {
              const currentStock = productStock[product._id] || 0;
              const inCartCount = getCartItemCount(product._id);

              return (
                <div key={product._id} className="product-card">
                  <div className="image-container">
                    <img
                      src={product.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error';
                      }}
                    />
                    <div className="stock-badge">
                      {currentStock > 0 ? (
                        <>
                          <span className="stock-count">{currentStock}</span>
                          <span className="stock-label"> in stock</span>
                        </>
                      ) : (
                        <span className="stock-out">Out of stock</span>
                      )}
                    </div>
                    {inCartCount > 0 && (
                      <div className="cart-count-badge">
                        {inCartCount} in cart
                      </div>
                    )}
                  </div>

                  <div className="product-content">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-brand">by {product.brand}</p>
                    <p className="product-description">
                      {product.description.length > 80
                        ? product.description.substring(0, 80) + '...'
                        : product.description}
                    </p>

                    {product.rating > 0 && (
                      <div className="product-rating">
                        ⭐ {product.rating} ({product.reviews} reviews)
                      </div>
                    )}

                    <div className="product-footer">
                      <span className="product-price">${product.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={currentStock <= 0}
                        className={`add-btn ${currentStock <= 0 ? 'add-btn-disabled' : ''}`}
                      >
                        {currentStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-products">
            <p className="no-products-text">😕 No products found</p>
            <p className="no-products-subtext">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>

      {/* Cart Sidebar Preview */}
      {cart.length > 0 && (
        <div className="cart-preview">
          <h3>📦 Cart Items ({cart.length})</h3>
          <div className="cart-items-list">
            {cart.map((item, index) => (
              <div key={index} className="cart-item">
                <span className="cart-item-name">{item.name}</span>
                <button
                  onClick={() => handleRemoveFromCart(index, item)}
                  className="cart-item-remove"
                  title="Remove from cart"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="cart-total">
            Total: ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;