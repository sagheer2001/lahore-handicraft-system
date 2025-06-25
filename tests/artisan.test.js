// const request = require('supertest');
// const app = require('../app');
// const pool = require('../db');

// beforeAll(async () => {
//   // Optionally: connect to a test database or ensure empty table
//   // You might want to run migrations or clear tables here.
// });

// afterAll(async () => {
//   // Clean up: drop test data
//   await pool.end();
// });

// describe('Artisan CRUD', () => {
//   let createdId;

//   test('Create artisan', async () => {
//     const res = await request(app)
//       .post('/api/artisans')
//       .send({ name: 'Test Artisan', contact_info: 'test@example.com', craft_types: 'wood', lead_time_days: 7 });
//     expect(res.statusCode).toBe(201);
//     expect(res.body).toHaveProperty('id');
//     createdId = res.body.id;
//     expect(res.body.name).toBe('Test Artisan');
//   });

//   test('Get artisan', async () => {
//     const res = await request(app).get(`/api/artisans/${createdId}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body.id).toBe(createdId);
//   });

//   test('Update artisan', async () => {
//     const res = await request(app)
//       .put(`/api/artisans/${createdId}`)
//       .send({ name: 'Updated Artisan', contact_info: 'new@example.com', craft_types: 'textiles', lead_time_days: 5 });
//     expect(res.statusCode).toBe(200);
//     expect(res.body.name).toBe('Updated Artisan');
//   });

//   test('Delete artisan', async () => {
//     const res = await request(app).delete(`/api/artisans/${createdId}`);
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message');
//   });
// });

// tests/artisans.test.js

// Ensure tests use an in-memory SQLite DB
process.env.DB_FILE = ':memory:';

const request = require('supertest');
const app = require('../app');
const { getDb } = require('../db');

beforeAll(async () => {
  const db = await getDb();
  // Create the artisans table schema if not already set up.
  // Adjust columns/types to match your actual schema.
  await db.exec(`
    CREATE TABLE IF NOT EXISTS artisans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_info TEXT,
      craft_types TEXT,
      lead_time_days INTEGER DEFAULT 0
    );
  `);
  // Clear any existing rows (should be none in :memory:, but safe)
  await db.exec(`DELETE FROM artisans;`);
});

afterAll(async () => {
  const db = await getDb();
  // Close the SQLite connection
  await db.close();
});

describe('Artisan CRUD', () => {
  let createdId;

  test('Create artisan', async () => {
    const res = await request(app)
      .post('/api/artisans')
      .send({
        name: 'Test Artisan',
        contact_info: 'test@example.com',
        craft_types: 'wood',
        lead_time_days: 7
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    createdId = res.body.id;
    expect(res.body.name).toBe('Test Artisan');
    // Optionally check other fields:
    expect(res.body.contact_info).toBe('test@example.com');
    expect(res.body.craft_types).toBe('wood');
    expect(res.body.lead_time_days).toBe(7);
  });

  test('Get artisan', async () => {
    const res = await request(app).get(`/api/artisans/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body.name).toBeDefined();
  });

  test('Update artisan', async () => {
    const res = await request(app)
      .put(`/api/artisans/${createdId}`)
      .send({
        name: 'Updated Artisan',
        contact_info: 'new@example.com',
        craft_types: 'textiles',
        lead_time_days: 5
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', createdId);
    expect(res.body.name).toBe('Updated Artisan');
    expect(res.body.contact_info).toBe('new@example.com');
    expect(res.body.craft_types).toBe('textiles');
    expect(res.body.lead_time_days).toBe(5);
  });

  test('Delete artisan', async () => {
    const res = await request(app).delete(`/api/artisans/${createdId}`);
    expect(res.statusCode).toBe(200);
    // Assuming your delete route responds with { success: true }
    expect(res.body).toHaveProperty('success', true);

    // Further, fetching again should yield 404 or null:
    const res2 = await request(app).get(`/api/artisans/${createdId}`);
    // Depending on your route, it might return 404:
    expect(res2.statusCode).toBe(404);
  });
});
