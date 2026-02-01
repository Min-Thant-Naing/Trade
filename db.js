const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// IMPORTANT: path for Render persistent disk
const DB_PATH =
  process.env.RENDER
    ? "/var/data/trading.db"     // Render persistent disk
    : path.join(__dirname, "trading.db"); // local dev

const db = new sqlite3.Database(DB_PATH);

// Create table if not exists
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todo (
      id INTEGER PRIMARY KEY,
      note TEXT
    )
  `);

  // Ensure single row exists
  db.run(`
    INSERT OR IGNORE INTO todo (id, note)
    VALUES (1, '')
  `);
});

module.exports = db;
