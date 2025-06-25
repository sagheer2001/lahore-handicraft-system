const Product = require('../models/productModel');

async function lowStock(req, res) {
  try {
    // threshold via query or default 5
    const threshold = parseInt(req.query.threshold, 10) || 5;
    const items = await Product.getLowStock(threshold);
    res.json({ threshold, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function salesSummary(req, res) {
  try {
    // expect start and end in ISO format via query, e.g., ?start=2025-06-01&end=2025-06-30
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Provide start and end dates in ISO format' });
    }
    // validate date strings
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    // Format for MySQL DATETIME
    const startStr = startDate.toISOString().slice(0, 19).replace('T', ' ');
    const endStr = endDate.toISOString().slice(0, 19).replace('T', ' ');
    const summary = await Product.getSalesSummary(startStr, endStr);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  lowStock,
  salesSummary
};
