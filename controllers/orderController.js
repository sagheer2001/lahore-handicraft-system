const Order = require('../models/orderModel');

async function listOrders(req, res) {
  try {
    const orders = await Order.getAllOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrder(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await Order.getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createOrder(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array required' });
    }
    // Validate items entries
    for (const it of items) {
      if (typeof it.product_id !== 'number' || typeof it.quantity !== 'number' || it.quantity <= 0) {
        return res.status(400).json({ error: 'Each item needs product_id (number) and quantity (>0)' });
      }
    }
    const newOrder = await Order.createOrder({ items });
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function cancelOrder(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    await Order.cancelOrder(id);
    res.json({ message: 'Order cancelled and stock restored' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  listOrders,
  getOrder,
  createOrder,
  cancelOrder
};
