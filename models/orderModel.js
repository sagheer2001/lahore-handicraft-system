// const pool = require('../db');

// async function getAllOrders() {
//   // join items for summary
//   const [orders] = await pool.query('SELECT * FROM orders ORDER BY order_date DESC');
//   return orders;
// }


// async function getOrderById(id) {
//   const [orderRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
//   if (!orderRows.length) return null;
//   const order = orderRows[0];
//   const [items] = await pool.query(
//     `SELECT oi.id, oi.product_id, p.name AS product_name, oi.quantity, oi.price_at_order
//      FROM order_items oi
//      JOIN products p ON oi.product_id = p.id
//      WHERE oi.order_id = ?`,
//     [id]
//   );
//   order.items = items;
//   return order;
// }

// async function createOrder({ items }) {
//   // items: array of { product_id, quantity }
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();
//     // Insert order row
//     const [orderResult] = await conn.query(`INSERT INTO orders (status) VALUES ('ACTIVE')`);
//     const orderId = orderResult.insertId;
//     // For each item: check stock and insert into order_items
//     for (const it of items) {
//       const { product_id, quantity } = it;
//       // lock and decrement stock
//       const [rows] = await conn.query('SELECT stock, price FROM products WHERE id = ? FOR UPDATE', [product_id]);
//       if (!rows.length) throw new Error(`Product ${product_id} not found`);
//       if (rows[0].stock < quantity) {
//         throw new Error(`Insufficient stock for product ${product_id}`);
//       }
//       const price_at_order = rows[0].price;
//       await conn.query(
//         'INSERT INTO order_items (order_id, product_id, quantity, price_at_order) VALUES (?, ?, ?, ?)',
//         [orderId, product_id, quantity, price_at_order]
//       );
//       // decrement
//       await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, product_id]);
//     }
//     await conn.commit();
//     return getOrderById(orderId);
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// }

// async function cancelOrder(id) {
//   const conn = await pool.getConnection();
//   try {
//     await conn.beginTransaction();
//     const [orderRows] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [id]);
//     if (!orderRows.length) throw new Error('Order not found');
//     if (orderRows[0].status === 'CANCELLED') {
//       throw new Error('Order already cancelled');
//     }
//     // fetch items
//     const [items] = await conn.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
//     // restock each
//     for (const it of items) {
//       await conn.query('UPDATE products SET stock = stock + ? WHERE id = ?', [it.quantity, it.product_id]);
//     }
//     // update status
//     await conn.query("UPDATE orders SET status='CANCELLED' WHERE id = ?", [id]);
//     await conn.commit();
//     return true;
//   } catch (err) {
//     await conn.rollback();
//     throw err;
//   } finally {
//     conn.release();
//   }
// }

// module.exports = {
//   getAllOrders,
//   getOrderById,
//   createOrder,
//   cancelOrder
// };
// backend/orders.js
const { getDb } = require('../db');

async function getAllOrders() {
  const db = await getDb();
  // Adjust column names if your schema differs; assuming orders has order_date column.
  const orders = await db.all('SELECT * FROM orders ORDER BY order_date DESC');
  return orders;
}

async function getOrderById(id) {
  const db = await getDb();
  // Fetch the order row
  const order = await db.get('SELECT * FROM orders WHERE id = ?', id);
  if (!order) return null;
  // Fetch its items
  const items = await db.all(
    `SELECT oi.id, oi.product_id, p.name AS product_name, oi.quantity, oi.price_at_order
     FROM order_items AS oi
     JOIN products AS p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    id
  );
  order.items = items;
  return order;
}

async function createOrder({ items }) {
  const db = await getDb();
  // Start a transaction. Use IMMEDIATE to acquire write lock early, reducing race window.
  await db.exec('BEGIN IMMEDIATE');
  try {
    // Insert into orders. Assuming orders table has at least: id INTEGER PRIMARY KEY AUTOINCREMENT, status TEXT, order_date DEFAULT CURRENT_TIMESTAMP
    const insertOrderResult = await db.run(
      `INSERT INTO orders (status) VALUES (?)`,
      'ACTIVE'
    );
    const orderId = insertOrderResult.lastID;
    // Process each item
    for (const it of items) {
      const { product_id, quantity } = it;
      // Read stock & price
      const prod = await db.get(
        'SELECT stock, price FROM products WHERE id = ?',
        product_id
      );
      if (!prod) {
        throw new Error(`Product ${product_id} not found`);
      }
      if (prod.stock < quantity) {
        throw new Error(`Insufficient stock for product ${product_id}`);
      }
      const price_at_order = prod.price;
      // Insert into order_items
      await db.run(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_order)
         VALUES (?, ?, ?, ?)`,
        orderId,
        product_id,
        quantity,
        price_at_order
      );
      // Decrement stock
      await db.run(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        quantity,
        product_id
      );
    }
    await db.exec('COMMIT');
    // Return the newly created order with items
    return await getOrderById(orderId);
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

async function cancelOrder(id) {
  const db = await getDb();
  await db.exec('BEGIN IMMEDIATE');
  try {
    // Fetch order row
    const order = await db.get(
      'SELECT * FROM orders WHERE id = ?',
      id
    );
    if (!order) {
      throw new Error('Order not found');
    }
    if (order.status === 'CANCELLED') {
      throw new Error('Order already cancelled');
    }
    // Fetch items to restock
    const items = await db.all(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      id
    );
    for (const it of items) {
      await db.run(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        it.quantity,
        it.product_id
      );
    }
    // Update status
    await db.run(
      `UPDATE orders SET status = ? WHERE id = ?`,
      'CANCELLED',
      id
    );
    await db.exec('COMMIT');
    return true;
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  cancelOrder
};
