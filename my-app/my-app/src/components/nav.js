import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/nav.css'
import '../styles/cart.css'

export default function Nav({ cartItemsCount = 0 }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div className='nav-container'>
      <div className='hamburger-menu' onClick={toggleMenu}>
        <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
        <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
        <div className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></div>
      </div>
      
      <div className={`nav-links ${isMenuOpen ? 'nav-open' : ''}`}>
        <Link to='/' onClick={closeMenu}>Home</Link>
        <Link to='/about' onClick={closeMenu}>About</Link>  
        <Link to='/contact' onClick={closeMenu}>Contact</Link>
        <Link to='/services' onClick={closeMenu}>Services</Link>
        <Link to='/cart' className='cart-nav-link' onClick={closeMenu}>
          🛒 Cart
          {cartItemsCount > 0 && (
            <span className="cart-count">{cartItemsCount}</span>
          )}
        </Link>
      </div>
    </div>
  )
}
