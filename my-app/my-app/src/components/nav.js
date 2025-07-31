import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/nav.css'

export default function Nav() {
  return (
    <div className='nav-links'>
      <Link to='/'>Home</Link>
      <Link to='/about'>About</Link>  
      <Link to='/contact'>Contact</Link>
      <Link to='/services'>Services</Link>
    </div>
  )
}
