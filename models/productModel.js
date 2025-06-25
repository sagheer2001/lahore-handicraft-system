// const pool = require('../db');

// async function getAllProducts() {
//   const [rows] = await pool.query(`
//     SELECT p.*, a.name AS artisan_name
//     FROM products p
//     LEFT JOIN artisans a ON p.artisan_id = a.id
//   `);
//   return rows;
// }

// async function getProductById(id) {
//   const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
//   return rows[0];
// }

// async function createProduct({ name, category, artisan_id, cost, price, stock }) {
//   const [result] = await pool.query(
//     `INSERT INTO products (name, category, artisan_id, cost, price, stock)
//      VALUES (?, ?, ?, ?, ?, ?)`,
//     [name, category, artisan_id || null, cost || 0, price || 0, stock || 0]
//   );
//   return getProductById(result.insertId);
// }

// async function updateProduct(id, { name, category, artisan_id, cost, price, stock }) {
//   // Validate stock >= 0 before calling
//   await pool.query(
//     `UPDATE products SET name = ?, category = ?, artisan_id = ?, cost = ?, price = ?, stock = ? WHERE id = ?`,
//     [name, category, artisan_id || null, cost || 0, price || 0, stock || 0, id]
//   );
//   return getProductById(id);
// }

// async function deleteProduct(id) {
//   const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
//   return result.affectedRows > 0;
// }

// async function decrementStock(productId, quantity, connection) {
//   // Use transaction connection if provided
//   const conn = connection || pool;
//   // First check stock
//   const [rows] = await conn.query('SELECT stock FROM products WHERE id = ? FOR UPDATE', [productId]);
//   if (!rows.length) throw new Error('Product not found');
//   const currentStock = rows[0].stock;
//   if (currentStock < quantity) {
//     throw new Error('Insufficient stock');
//   }
//   await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, productId]);
// }

// async function incrementStock(productId, quantity) {
//   await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [quantity, productId]);
// }

// async function getLowStock(threshold) {
//   const [rows] = await pool.query('SELECT * FROM products WHERE stock <= ?', [threshold]);
//   return rows;
// }

// async function getSalesSummary(startDate, endDate) {
//   // Sum total sales and top categories in period
//   // total sales = sum(order_items.quantity * price_at_order) for orders in period and status ACTIVE
//   const [totalRows] = await pool.query(
//     `SELECT SUM(oi.quantity * oi.price_at_order) AS total_sales
//      FROM order_items oi
//      JOIN orders o ON oi.order_id = o.id
//      WHERE o.status='ACTIVE' AND o.order_date BETWEEN ? AND ?`,
//     [startDate, endDate]
//   );
//   const totalSales = totalRows[0].total_sales || 0;

//   // Top categories
//   const [catRows] = await pool.query(
//     `SELECT p.category, SUM(oi.quantity * oi.price_at_order) AS sales
//      FROM order_items oi
//      JOIN orders o ON oi.order_id = o.id
//      JOIN products p ON oi.product_id = p.id
//      WHERE o.status='ACTIVE' AND o.order_date BETWEEN ? AND ?
//      GROUP BY p.category
//      ORDER BY sales DESC
//      LIMIT 5`,
//     [startDate, endDate]
//   );
//   return { totalSales, topCategories: catRows };
// }

// module.exports = {
//   getAllProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   decrementStock,
//   incrementStock,
//   getLowStock,
//   getSalesSummary
// };


// backend/products.js
const { getDb } = require('../db');

// Fetch all products with artisan name (if any)
async function getAllProducts() {
  const db = await getDb();
  const rows = await db.all(`
    SELECT p.*, a.name AS artisan_name
    FROM products AS p
    LEFT JOIN artisans AS a ON p.artisan_id = a.id
  `);
  return rows;
}

// Fetch single product
async function getProductById(id) {
  const db = await getDb();
  const row = await db.get('SELECT * FROM products WHERE id = ?', id);
  return row;
}

// Create a product
async function createProduct({ name, category, artisan_id, cost, price, stock }) {
  const db = await getDb();
  const result = await db.run(
    `INSERT INTO products (name, category, artisan_id, cost, price, stock)
     VALUES (?, ?, ?, ?, ?, ?)`,
    name,
    category,
    artisan_id || null,
    cost || 0,
    price || 0,
    stock || 0
  );
  return await getProductById(result.lastID);
}

// Update a product
async function updateProduct(id, { name, category, artisan_id, cost, price, stock }) {
  const db = await getDb();
  await db.run(
    `UPDATE products
     SET name = ?, category = ?, artisan_id = ?, cost = ?, price = ?, stock = ?
     WHERE id = ?`,
    name,
    category,
    artisan_id || null,
    cost || 0,
    price || 0,
    stock || 0,
    id
  );
  return await getProductById(id);
}

// Delete a product
async function deleteProduct(id) {
  const db = await getDb();
  const result = await db.run('DELETE FROM products WHERE id = ?', id);
  return result.changes > 0;
}

// Decrement stock inside a transaction context or standalone.
// If `db` is provided, it should be within a BEGIN IMMEDIATE/COMMIT already.
// If no `db` provided, we do a quick transaction here (but beware of concurrency).
async function decrementStock(productId, quantity, db) {
  if (db) {
    // assume caller started a transaction
    const prod = await db.get('SELECT stock FROM products WHERE id = ?', productId);
    if (!prod) throw new Error('Product not found');
    if (prod.stock < quantity) throw new Error('Insufficient stock');
    await db.run('UPDATE products SET stock = stock - ? WHERE id = ?', quantity, productId);
  } else {
    // standalone: wrap in a transaction to reduce race window
    const conn = await getDb();
    await conn.exec('BEGIN IMMEDIATE');
    try {
      const prod = await conn.get('SELECT stock FROM products WHERE id = ?', productId);
      if (!prod) throw new Error('Product not found');
      if (prod.stock < quantity) throw new Error('Insufficient stock');
      await conn.run('UPDATE products SET stock = stock - ? WHERE id = ?', quantity, productId);
      await conn.exec('COMMIT');
    } catch (err) {
      await conn.exec('ROLLBACK');
      throw err;
    }
  }
}

// Increment stock; standalone since it’s a single update
async function incrementStock(productId, quantity) {
  const db = await getDb();
  await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', quantity, productId);
}

// Get products with stock <= threshold
async function getLowStock(threshold) {
  const db = await getDb();
  const rows = await db.all('SELECT * FROM products WHERE stock <= ?', threshold);
  return rows;
}

// Summarize sales between two dates.
// Assumes orders.order_date is stored in a format SQLite compares correctly (ISO strings or timestamps).
async function getSalesSummary(startDate, endDate) {
  const db = await getDb();
  // total sales
  const totalRow = await db.get(
    `SELECT SUM(oi.quantity * oi.price_at_order) AS total_sales
     FROM order_items AS oi
     JOIN orders AS o ON oi.order_id = o.id
     WHERE o.status = 'ACTIVE'
       AND o.order_date BETWEEN ? AND ?`,
    startDate,
    endDate
  );
  const totalSales = totalRow?.total_sales || 0;
  // top categories
  const catRows = await db.all(
    `SELECT p.category, SUM(oi.quantity * oi.price_at_order) AS sales
     FROM order_items AS oi
     JOIN orders AS o ON oi.order_id = o.id
     JOIN products AS p ON oi.product_id = p.id
     WHERE o.status = 'ACTIVE'
       AND o.order_date BETWEEN ? AND ?
     GROUP BY p.category
     ORDER BY sales DESC
     LIMIT 5`,
    startDate,
    endDate
  );
  return { totalSales, topCategories: catRows };
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  decrementStock,
  incrementStock,
  getLowStock,
  getSalesSummary
};
