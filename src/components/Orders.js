import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Orders.css';
import database from '../utils/database';


export default function Orders({ user, orders = [], darkMode = false }) {
  const [loading, setLoading] = useState(true);
  const [showTracking, setShowTracking] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (user) {
      // Get user orders from database
      const orders = database.getUserOrders(user.id);
      setUserOrders(orders);
    }
    setLoading(false);
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return '#4CAF50';
      case 'Shipped':
        return '#2196F3';
      case 'Processing':
        return '#FF9800';
      case 'Preparing':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTrackOrder = (order) => {
    setSelectedOrder(order);
    setShowTracking(true);
  };

  const closeTracking = () => {
    setShowTracking(false);
    setSelectedOrder(null);
  };

  const getTrackingSteps = (status) => {
    const steps = [
      { id: 1, title: 'Order Placed', description: 'Your order has been received', completed: true },
      { id: 2, title: 'Processing', description: 'We are preparing your order', completed: status === 'Processing' || status === 'Preparing' || status === 'Shipped' || status === 'Delivered' },
      { id: 3, title: 'Preparing', description: 'Your items are being prepared', completed: status === 'Preparing' || status === 'Shipped' || status === 'Delivered' },
      { id: 4, title: 'Shipped', description: 'Your order is on its way', completed: status === 'Shipped' || status === 'Delivered' },
      { id: 5, title: 'Delivered', description: 'Your order has been delivered', completed: status === 'Delivered' }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`orders-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Welcome back, {user?.name || 'User'}!</p>
      </div>

      {userOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <Link to="/" className="start-shopping-btn">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {userOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">{formatDate(order.date)}</p>
                </div>
                <div className="order-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-price">${item.price}</p>
                      <p className="item-quantity">Quantity: {item.quantity}</p>
                      <p className="item-total">Total: ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <strong>${order.total.toFixed(2)}</strong>
                </div>
                <button 
                  className="track-order-btn"
                  onClick={() => handleTrackOrder(order)}
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      {showTracking && selectedOrder && (
        <div className="tracking-modal-overlay" onClick={closeTracking}>
          <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tracking-header">
              <h2>Track Order #{selectedOrder.orderNumber}</h2>
              <button className="close-tracking-btn" onClick={closeTracking}>×</button>
            </div>
            
            <div className="tracking-steps">
              {getTrackingSteps(selectedOrder.status).map((step, index) => (
                <div key={step.id} className={`tracking-step ${step.completed ? 'completed' : ''}`}>
                  <div className="step-number">{step.completed ? '✓' : step.id}</div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                  </div>
                  {index < getTrackingSteps(selectedOrder.status).length - 1 && (
                    <div className={`step-connector ${step.completed ? 'completed' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>

            <div className="tracking-footer">
              <p>Estimated delivery: {formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))}</p>
            </div>
          </div>
        </div>
      )}
      
      
    </div>
  );
} 