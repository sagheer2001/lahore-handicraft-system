// const request = require('supertest');
// const app = require('../app');
// const pool = require('../db');

// beforeAll(async () => { /* setup */ });
// afterAll(async () => { await pool.end(); });

// describe('Product CRUD', () => {
//   let artisanId, productId;

//   test('Ensure an artisan exists for FK', async () => {
//     const res = await request(app).post('/api/artisans').send({ name: 'ProdTest', contact_info: '', craft_types: '', lead_time_days: 0 });
//     expect(res.statusCode).toBe(201);
//     artisanId = res.body.id;
//   });

//   test('Create product', async () => {
//     const payload = { name: 'TestProd', category: 'Decor', artisan_id: artisanId, cost: 10.5, price: 20.0, stock: 15 };
//     const res = await request(app).post('/api/products').send(payload);
//     expect(res.statusCode).toBe(201);
//     expect(res.body.name).toBe('TestProd');
//     productId = res.body.id;
//   });

//   test('Get product', async () => {
//     const res = await request(app).get(`/api/products/${productId}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body.id).toBe(productId);
//   });

//   test('Update product', async () => {
//     const res = await request(app).put(`/api/products/${productId}`).send({ name: 'UpdatedProd', category: 'Decor', artisan_id: artisanId, cost: 12.0, price: 22.0, stock: 10 });
//     expect(res.statusCode).toBe(200);
//     expect(res.body.name).toBe('UpdatedProd');
//     expect(res.body.stock).toBe(10);
//   });

//   test('Delete product', async () => {
//     const res = await request(app).delete(`/api/products/${productId}`);
//     expect(res.statusCode).toBe(200);
//   });

//   afterAll(async () => {
//     // clean up artisan
//     if (artisanId) {
//       await request(app).delete(`/api/artisans/${artisanId}`);
//     }
//   });
// });


// tests/productCrud.test.js

// Use in-memory SQLite for tests
process.env.DB_FILE = ':memory:';

const request = require('supertest');
const app = require('../app');
const { getDb } = require('../db');

let artisanId, productId;

beforeAll(async () => {
  const db = await getDb();

  // Enable foreign keys and create tables
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
  `);

  // Clear any leftover rows (mostly for safety; in-memory starts empty)
  await db.exec(`DELETE FROM products;`);
  await db.exec(`DELETE FROM artisans;`);
});

afterAll(async () => {
  // Close SQLite connection so Jest can exit cleanly
  const db = await getDb();
  await db.close();
});

describe('Product CRUD', () => {
  test('Ensure an artisan exists for FK', async () => {
    const res = await request(app)
      .post('/api/artisans')
      .send({
        name: 'ProdTest',
        contact_info: '',
        craft_types: '',
        lead_time_days: 0
      });
    expect(res.statusCode).toBe(201);
    artisanId = res.body.id;
  });

  test('Create product', async () => {
    const payload = {
      name: 'TestProd',
      category: 'Decor',
      artisan_id: artisanId,
      cost: 10.5,
      price: 20.0,
      stock: 15
    };
    const res = await request(app).post('/api/products').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('TestProd');
    expect(res.body.stock).toBe(15);
    productId = res.body.id;
  });

  test('Get product', async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', productId);
    expect(res.body.name).toBeDefined();
  });

  test('Update product', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({
        name: 'UpdatedProd',
        category: 'Decor',
        artisan_id: artisanId,
        cost: 12.0,
        price: 22.0,
        stock: 10
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', productId);
    expect(res.body.name).toBe('UpdatedProd');
    expect(res.body.stock).toBe(10);
  });

  test('Delete product', async () => {
    const res = await request(app).delete(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    // If your delete route returns { success: true }:
    expect(res.body).toHaveProperty('success', true);

    // Further, fetching again should yield 404:
    const res2 = await request(app).get(`/api/products/${productId}`);
    expect(res2.statusCode).toBe(404);
  });

  afterAll(async () => {
    // Clean up the artisan created earlier
    if (artisanId) {
      await request(app).delete(`/api/artisans/${artisanId}`);
    }
  });
});
