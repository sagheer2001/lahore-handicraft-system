// // backend/db.js
// const path = require('path');
// const sqlite3 = require('sqlite3').verbose();
// const { open } = require('sqlite');
// const dotenv = require('dotenv');
// dotenv.config();

// let dbPromise;

// async function initDb() {
//   if (!dbPromise) {
//     const dbFile = process.env.DB_FILE || './data/app.sqlite';
//     // Ensure the directory exists, etc., if needed. You might add fs checks here.
//     dbPromise = open({
//       filename: path.resolve(dbFile),
//       driver: sqlite3.Database
//     });
//     // You can run PRAGMAs or migrations here, e.g.:
//     const db = await dbPromise;
//     // Example: enable foreign keys
//     await db.run('PRAGMA foreign_keys = ON');
//     // If you want to check or create tables automatically:
//     // await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT);`);
//   }
//   return dbPromise;
// }

// module.exports = {
//   getDb: initDb
// };


// backend/db.js
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const dotenv = require('dotenv');
dotenv.config();

let dbPromise;

async function initDb() {
  if (!dbPromise) {
    // Determine DB file path
    const dbFile = process.env.DB_FILE || './data/app.sqlite';
    const fullPath = path.resolve(dbFile);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      console.error('Failed to create DB directory:', err);
      throw err;
    }

    // Open (or create) the SQLite database
    dbPromise = open({
      filename: fullPath,
      driver: sqlite3.Database
    });

    const db = await dbPromise;

    // Enable foreign keys
    await db.run('PRAGMA foreign_keys = ON');

    // Optional: other PRAGMAs, e.g., WAL mode for better concurrency
    // await db.run('PRAGMA journal_mode = WAL');

    // Load and apply schema
    // Assume you have a file at project root: schema.sqlite.sql
    // containing CREATE TABLE IF NOT EXISTS ... statements.
    const schemaPath = path.resolve(__dirname, './schema.sqlite.sql');
    if (fs.existsSync(schemaPath)) {
      try {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        // Execute all statements. IF NOT EXISTS guards make it idempotent.
        await db.exec(schemaSql);
      } catch (err) {
        console.error('Failed to apply schema:', err);
        throw err;
      }
    } else {
      console.warn(`Schema file not found at ${schemaPath}. Skipping automatic schema creation.`);
    }

    // You can also perform seed data insertion here if needed
    // e.g., check a table row count and insert defaults.
  }
  return dbPromise;
}

module.exports = {
  getDb: initDb
};
