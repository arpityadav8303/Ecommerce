// src/Pages/Cart.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Fetch Cart Data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      if (response.data.success) {
        setCartItems(response.data.cart.items);
        setCartTotal(response.data.cart.totalPrice);
      }
    } catch (err) {
      // If 404, it implies empty cart or new user
      if (err.response && err.response.status === 404) {
        setCartItems([]);
        setCartTotal(0);
      } else {
        setError('Failed to load cart. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Update Quantity
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setProcessing(true);
    try {
      const response = await api.put(`/cart/${productId}`, { quantity: newQuantity });
      if (response.data.success) {
        // Update local state to reflect changes immediately
        setCartItems(prev => prev.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
            : item
        ));
        // Recalculate total
        const newTotal = response.data.cart.totalPrice; 
        setCartTotal(newTotal);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update quantity");
    } finally {
      setProcessing(false);
    }
  };

  // Remove Item
  const handleRemoveItem = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this item?")) return;
    setProcessing(true);
    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data.success) {
        setCartItems(prev => prev.filter(item => item.product._id !== productId));
        setCartTotal(response.data.cart.totalPrice);
      }
    } catch (err) {
      alert("Failed to remove item");
    } finally {
      setProcessing(false);
    }
  };

  // Clear Cart
  const handleClearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) return;
    setProcessing(true);
    try {
      await api.delete('/cart/clear');
      setCartItems([]);
      setCartTotal(0);
    } catch (err) {
      alert("Failed to clear cart");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="cart-loading">Loading Cart...</div>;

  return (
    <div className="cart-container">
      <header className="cart-header">
        <button className="back-btn" onClick={() => navigate('/home')}>← Continue Shopping</button>
        <h1>Your Shopping Cart</h1>
      </header>

      {error && <div className="cart-error">{error}</div>}

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty 😕</h2>
          <button onClick={() => navigate('/home')} className="shop-now-btn">Start Shopping</button>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item-card">
                <div className="item-image">
                  <img 
                    src={item.product.images?.[0] || 'https://via.placeholder.com/100'} 
                    alt={item.product.name} 
                  />
                </div>
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p className="item-brand">{item.product.brand}</p>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      disabled={processing || item.quantity <= 1}
                    >-</button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      disabled={processing || item.quantity >= item.product.stock}
                    >+</button>
                  </div>
                  <div className="item-total">
                    ${item.totalPrice.toFixed(2)}
                  </div>
                  <button 
                    className="remove-btn" 
                    onClick={() => handleRemoveItem(item.product._id)}
                    disabled={processing}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">Proceed to Checkout</button>
            <button className="clear-cart-btn-text" onClick={handleClearCart}>Clear Cart</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;