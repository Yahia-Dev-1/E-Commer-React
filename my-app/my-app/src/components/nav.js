import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/nav.css'
import '../styles/cart.css'

export default function Nav() {
      return (
    <div className='nav-container'>
      <div className='nav-links'>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>  
        <Link to='/contact'>Contact</Link>
        <Link to='/services'>Services</Link>
     
        <Link to='/cart' className='cart-nav-link'>
          <i className="fa-solid fa-cart-shopping"></i> 
        </Link>
      </div>
    </div>
  )
}
