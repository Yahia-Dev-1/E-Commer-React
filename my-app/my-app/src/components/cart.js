import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import '../styles/cart.css'

export default function Cart({ cartItems, updateQuantity, clearCart }) {
  const [showAnimation, setShowAnimation] = useState(false)

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity)
    }, 0).toFixed(2)
  }

  const handleCheckout = () => {
    setShowAnimation(true)
    setTimeout(() => {
      clearCart()
      setShowAnimation(false)
    }, 3000) // Show animation for 3 seconds
  }

  if (showAnimation) {
    return (
      <div className="checkout-animation">
        <div className="animation-container">
          <DotLottieReact
            src="https://lottie.host/88b8c6eb-8d1e-40f5-a584-b70d6400a4ec/47p7hcqPIB.lottie"
            loop
            autoplay
          />
          <h2>Processing Your Order...</h2>
          <p>Thank you for your purchase!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Shopping Cart</h1>
        <Link to="/" className="continue-shopping">
          ← Continue Shopping
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/" className="shop-now-btn">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="item-details">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="item-price">${item.price}</div>
                </div>
                <div className="item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </div>
                <button 
                  onClick={() => updateQuantity(item.id, 0)}
                  className="remove-btn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-item">
              <span>Subtotal:</span>
              <span>${calculateTotal()}</span>
            </div>
            <div className="summary-item">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>${calculateTotal()}</span>
            </div>
            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}   