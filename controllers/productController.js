const Product = require('../models/productModel');

async function listProducts(req, res) {
  try {
    const products = await Product.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const p = await Product.getProductById(id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createProduct(req, res) {
  try {
    const { name, category, artisan_id, cost, price, stock } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    if (stock != null && stock < 0) return res.status(400).json({ error: 'Stock must be >= 0' });
    const newP = await Product.createProduct({ name, category, artisan_id, cost, price, stock });
    res.status(201).json(newP);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Product.getProductById(id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const { name, category, artisan_id, cost, price, stock } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    if (stock != null && stock < 0) return res.status(400).json({ error: 'Stock must be >= 0' });
    const updated = await Product.updateProduct(id, { name, category, artisan_id, cost, price, stock });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await Product.getProductById(id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const success = await Product.deleteProduct(id);
    if (success) return res.json({ message: 'Deleted' });
    res.status(500).json({ error: 'Failed to delete' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
