// const pool = require('../db');

// async function getAllArtisans() {
//   const [rows] = await pool.query('SELECT * FROM artisans');
//   return rows;
// }

// async function getArtisanById(id) {
//   const [rows] = await pool.query('SELECT * FROM artisans WHERE id = ?', [id]);
//   return rows[0];
// }

// async function createArtisan({ name, contact_info, craft_types, lead_time_days }) {
//   const [result] = await pool.query(
//     'INSERT INTO artisans (name, contact_info, craft_types, lead_time_days) VALUES (?, ?, ?, ?)',
//     [name, contact_info, craft_types, lead_time_days || 0]
//   );
//   return getArtisanById(result.insertId);
// }

// async function updateArtisan(id, { name, contact_info, craft_types, lead_time_days }) {
//   await pool.query(
//     `UPDATE artisans SET name = ?, contact_info = ?, craft_types = ?, lead_time_days = ? WHERE id = ?`,
//     [name, contact_info, craft_types, lead_time_days || 0, id]
//   );
//   return getArtisanById(id);
// }

// async function deleteArtisan(id) {
//   // Before deleting, you may want to check if products exist. For simplicity, allow deletion and set product.artisan_id to NULL (handled by FK ON DELETE SET NULL).
//   const [result] = await pool.query('DELETE FROM artisans WHERE id = ?', [id]);
//   return result.affectedRows > 0;
// }

// module.exports = {
//   getAllArtisans,
//   getArtisanById,
//   createArtisan,
//   updateArtisan,
//   deleteArtisan
// };

// backend/artisans.js
const { getDb } = require('../db');

async function getAllArtisans() {
  const db = await getDb();
  // Fetch all artisans
  const rows = await db.all('SELECT * FROM artisans');
  return rows;
}

async function getArtisanById(id) {
  const db = await getDb();
  // Fetch single artisan
  const row = await db.get('SELECT * FROM artisans WHERE id = ?', id);
  return row;
}

async function createArtisan({ name, contact_info, craft_types, lead_time_days }) {
  const db = await getDb();
  // Insert new artisan; lead_time_days default to 0 if falsy
  const result = await db.run(
    'INSERT INTO artisans (name, contact_info, craft_types, lead_time_days) VALUES (?, ?, ?, ?)',
    name,
    contact_info,
    craft_types,
    lead_time_days || 0
  );
  // result.lastID holds the new id
  return await getArtisanById(result.lastID);
}

async function updateArtisan(id, { name, contact_info, craft_types, lead_time_days }) {
  const db = await getDb();
  // Update fields
  await db.run(
    `UPDATE artisans
     SET name = ?, contact_info = ?, craft_types = ?, lead_time_days = ?
     WHERE id = ?`,
    name,
    contact_info,
    craft_types,
    lead_time_days || 0,
    id
  );
  return await getArtisanById(id);
}

async function deleteArtisan(id) {
  const db = await getDb();
  // If you rely on FK ON DELETE SET NULL (for products.artisan_id), ensure PRAGMA foreign_keys = ON in db init.
  const result = await db.run('DELETE FROM artisans WHERE id = ?', id);
  // result.changes is number of rows deleted
  return result.changes > 0;
}

module.exports = {
  getAllArtisans,
  getArtisanById,
  createArtisan,
  updateArtisan,
  deleteArtisan
};
