// backend/app.js
const express = require('express');
const artisanRoutes = require('./routes/artisanRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reportRoutes = require('./routes/reportRoutes');
// const express = require('express');
const path = require('path');
const app = express();
// const app = express();
app.use(express.json());
const cors = require('cors');
// API routes under /api
app.use('/api/artisans', artisanRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend')));

// Basic 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
