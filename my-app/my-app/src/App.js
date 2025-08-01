import './styles/App.css';
import Nav from './components/nav';
import Cart from './components/cart';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import Services from './components/Services'
import Hero from './components/hero'
function App() {
  return (
    <BrowserRouter basename="/E-Commer-React">
      <div className="App">
        <Nav />
        <Hero />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/services' element={<Services />} />
          <Route path='/cart' element={<Cart />} />
      
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
