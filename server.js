const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('build'));

// Sample product data
let products = [
  {
    id: 1,
    title: "Hoodie",
    description: "Comfortable cotton hoodie",
    price: 29.99,
    quantity: 10,
    image: "https://via.placeholder.com/400x400?text=Hoodie",
    category: "clothing",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "T-Shirt",
    description: "Casual cotton t-shirt",
    price: 19.99,
    quantity: 20,
    image: "https://via.placeholder.com/400x400?text=T-Shirt",
    category: "clothing",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Jeans",
    description: "Classic denim jeans",
    price: 49.99,
    quantity: 5,
    image: "https://via.placeholder.com/400x400?text=Jeans",
    category: "clothing",
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "Sneakers",
    description: "Comfortable casual sneakers",
    price: 79.99,
    quantity: 0,
    image: "https://via.placeholder.com/400x400?text=Sneakers",
    category: "footwear",
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    title: "Running Shoes",
    description: "High-performance running shoes",
    price: 89.99,
    quantity: 15,
    image: "https://via.placeholder.com/400x400?text=Running+Shoes",
    category: "footwear",
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    title: "Watch",
    description: "Stylish wristwatch",
    price: 129.99,
    quantity: 8,
    image: "https://via.placeholder.com/400x400?text=Watch",
    category: "accessories",
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    title: "Backpack",
    description: "Durable travel backpack",
    price: 59.99,
    quantity: 25,
    image: "https://via.placeholder.com/400x400?text=Backpack",
    category: "accessories",
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    title: "Cap",
    description: "Adjustable baseball cap",
    price: 15.99,
    quantity: 12,
    image: "https://via.placeholder.com/400x400?text=Cap",
    category: "accessories",
    createdAt: new Date().toISOString()
  }
];

// API Routes
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

app.get('/api/products/latest', (req, res) => {
  const sortedProducts = [...products].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(sortedProducts);
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    ...req.body,
    id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  products[index] = { ...products[index], ...req.body, updatedAt: new Date().toISOString() };
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const deletedProduct = products.splice(index, 1)[0];
  res.json(deletedProduct);
});

// Serve static files from the React app build folder
// Handle API routes first, then serve React app for all other non-API routes
app.get('*', (req, res) => {
  // Check if this is an API request - if so, let it 404 since it wasn't caught by the API routes above
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API endpoint not found' });
  } else {
    // For all other requests, serve the React app (for client-side routing)
    res.sendFile(path.join(__dirname, 'build/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});