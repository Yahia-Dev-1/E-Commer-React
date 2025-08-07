import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

export default function Footer({ darkMode = true }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`footer ${darkMode ? 'dark-mode' : ''}`}>
      <div className="footer-content">
        <div className="footer-main-row">
          {/* Brand Section */}
          <div className="footer-brand-section">
            <div className="footer-logo">E-Shop</div>
            <p className="footer-tagline">
              Leading e-commerce platform in the Middle East. We offer the best products at the best prices with distinguished customer service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-section-title">Quick Links</h3>
            <div className="footer-links">
              <Link to="/" className="footer-link" onClick={scrollToTop}>Home</Link>
              <Link to="/about" className="footer-link" onClick={scrollToTop}>About</Link>
              <Link to="/services" className="footer-link" onClick={scrollToTop}>Services</Link>
            </div>
          </div>

          {/* Contact Information */}
          <div className="footer-section">
            <h3 className="footer-section-title">Contact Information</h3>
            <div className="footer-contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fa fa-envelope"></i>
                </div>
                <div>
                  <div className="contact-text">Email</div>
                  <a href="mailto:yahiapro400@gmail.com" className="contact-link">
                    yahiapro400@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fa fa-phone"></i>
                </div>
                <div>
                  <div className="contact-text">Phone</div>
                  <a href="tel:+201273445173" className="contact-link">
                    +20 127 344 5173
                  </a>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fa fa-map-marker"></i>
                </div>
                <div>
                  <div className="contact-text">Address</div>
                  <span className="contact-text">Alexandria, Egypt</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="footer-bottom-row">
          <div className="footer-copyright">
            © 2025 E-Shop. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
} 