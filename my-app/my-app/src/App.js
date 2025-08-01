import './styles/App.css';
import Nav from './components/nav';
import Cart from './components/cart';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import Services from './components/Services'
import Hero from './components/hero'

import Cards from './components/cards'
import { useState } from 'react'

function App() {
  const [cartItems, setCartItems] = useState([])

  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.id === product.id)
    
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }])
    }
  }

  const updateCartItemQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id))
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <BrowserRouter basename="/E-Commer-React">
      <div className="App">
        <Nav cartItemsCount={cartItems.length} />
        <Routes>
          <Route path='/' element={
            <>
              <Hero />
         
              <Cards addToCart={addToCart} />
            </>
          } />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/services' element={<Services />} />
          <Route path='/cart' element={
            <Cart 
              cartItems={cartItems} 
              updateQuantity={updateCartItemQuantity}
              clearCart={clearCart}
            />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
