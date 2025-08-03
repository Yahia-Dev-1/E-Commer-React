import React from 'react'
import '../styles/About.css'

export default function About({ darkMode = false }) {
  return (
    <div className={`about-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="about-header">
        <h1>About Our Store</h1>
        <p>Learn more about our mission, values, and commitment to providing the best shopping experience</p>
      </div>
      
      <div className="about-content">
        <div className="about-section">
          <h2>
            <span className="icon">🏪</span>
            Our Story
          </h2>
          <p>
            Founded with a vision to revolutionize online shopping, our e-commerce platform has been serving customers 
            with dedication and excellence since our establishment. We believe in making quality products accessible 
            to everyone through innovative technology and exceptional customer service.
          </p>
          <p>
            What started as a small online store has grown into a trusted destination for millions of customers 
            who rely on us for their daily needs. Our journey is marked by continuous innovation, customer-centric 
            approach, and unwavering commitment to quality.
          </p>
        </div>

        <div className="about-section">
          <h2>
            <span className="icon">🎯</span>
            Our Mission
          </h2>
          <p>
            Our mission is to provide an exceptional online shopping experience that combines convenience, 
            quality, and affordability. We strive to:
          </p>
          <ul>
            <li>Offer a wide selection of high-quality products at competitive prices</li>
            <li>Provide seamless and secure shopping experience</li>
            <li>Deliver outstanding customer service and support</li>
            <li>Continuously innovate and improve our platform</li>
            <li>Build long-term relationships with our customers</li>
            <li>Contribute positively to the communities we serve</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>
            <span className="icon">📊</span>
            Our Achievements
          </h2>
          <p>
            Over the years, we have achieved significant milestones that reflect our commitment to excellence 
            and customer satisfaction. Here are some highlights of our journey:
          </p>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">1M+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Products Available</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Customer Satisfaction</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Customer Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
