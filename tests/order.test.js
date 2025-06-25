// const request = require('supertest');
// const app = require('../app');
// const pool = require('../db');

// let artisanId, productId;

// beforeAll(async () => {
//   // create an artisan and a product with stock
//   const aRes = await request(app).post('/api/artisans').send({ name: 'OrderTest', contact_info: '', craft_types: '', lead_time_days: 0 });
//   artisanId = aRes.body.id;
//   const pRes = await request(app).post('/api/products').send({ name: 'OrderProd', category: '', artisan_id: artisanId, cost: 5.0, price: 10.0, stock: 20 });
//   productId = pRes.body.id;
// });

// afterAll(async () => {
//   // cleanup: delete product, artisan, close pool
//   if (productId) await request(app).delete(`/api/products/${productId}`);
//   if (artisanId) await request(app).delete(`/api/artisans/${artisanId}`);
//   await pool.end();
// });

// describe('Order flow', () => {
//   let orderId;

//   test('Create order with sufficient stock', async () => {
//     const res = await request(app).post('/api/orders').send({ items: [{ product_id: productId, quantity: 5 }] });
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('id');
//     orderId = res.body.id;
//     // stock should decrement
//     const prod = await request(app).get(`/api/products/${productId}`);
//     expect(prod.body.stock).toBe(15);
//   });

//   test('Get order details', async () => {
//     const res = await request(app).get(`/api/orders/${orderId}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body.items.length).toBe(1);
//   });

//   test('Cancel order', async () => {
//     const res = await request(app).post(`/api/orders/${orderId}/cancel`);
//     expect(res.statusCode).toBe(200);
//     // stock should restore
//     const prod = await request(app).get(`/api/products/${productId}`);
//     expect(prod.body.stock).toBe(20);
//   });

//   test('Cannot cancel again', async () => {
//     const res = await request(app).post(`/api/orders/${orderId}/cancel`);
//     expect(res.statusCode).toBe(400);
//   });
// });


// tests/orderFlow.test.js

// Use in-memory SQLite for tests
process.env.DB_FILE = ':memory:';

const request = require('supertest');
const app = require('../app');
const { getDb } = require('../db');

let artisanId, productId;

beforeAll(async () => {
  const db = await getDb();

  // Create tables schema. Adjust columns/types/defaults to match your real schema.
  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS artisans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_info TEXT,
      craft_types TEXT,
      lead_time_days INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      artisan_id INTEGER,
      cost REAL DEFAULT 0,
      price REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      FOREIGN KEY(artisan_id) REFERENCES artisans(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status TEXT NOT NULL,
      order_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_order REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY(product_id) REFERENCES products(id)
    );
  `);

  // Ensure tables empty (in-memory is new, but safe)
  await db.exec(`DELETE FROM order_items;`);
  await db.exec(`DELETE FROM orders;`);
  await db.exec(`DELETE FROM products;`);
  await db.exec(`DELETE FROM artisans;`);

  // Now create an artisan and product via API
  const aRes = await request(app)
    .post('/api/artisans')
    .send({
      name: 'OrderTest',
      contact_info: '',
      craft_types: '',
      lead_time_days: 0
    });
  artisanId = aRes.body.id;

  const pRes = await request(app)
    .post('/api/products')
    .send({
      name: 'OrderProd',
      category: '',
      artisan_id: artisanId,
      cost: 5.0,
      price: 10.0,
      stock: 20
    });
  productId = pRes.body.id;
});

afterAll(async () => {
  // Cleanup via API (though in-memory DB will vanish after tests)
  if (productId) {
    await request(app).delete(`/api/products/${productId}`);
  }
  if (artisanId) {
    await request(app).delete(`/api/artisans/${artisanId}`);
  }
  const db = await getDb();
  await db.close();
});

describe('Order flow', () => {
  let orderId;

  test('Create order with sufficient stock', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ items: [{ product_id: productId, quantity: 5 }] });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    orderId = res.body.id;

    // stock should decrement from 20 to 15
    const prodRes = await request(app).get(`/api/products/${productId}`);
    expect(prodRes.statusCode).toBe(200);
    expect(prodRes.body.stock).toBe(15);
  });

  test('Get order details', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(1);
    // You can also check that the item has correct product_id and quantity
    const item = res.body.items[0];
    expect(item.product_id).toBe(productId);
    expect(item.quantity).toBe(5);
  });

  test('Cancel order', async () => {
    const res = await request(app).post(`/api/orders/${orderId}/cancel`);
    expect(res.statusCode).toBe(200);
    // stock should restore back to 20
    const prodRes = await request(app).get(`/api/products/${productId}`);
    expect(prodRes.statusCode).toBe(200);
    expect(prodRes.body.stock).toBe(20);
  });

  test('Cannot cancel again', async () => {
    const res = await request(app).post(`/api/orders/${orderId}/cancel`);
    // Assuming your route returns 400 for already cancelled
    expect(res.statusCode).toBe(400);
  });
});
