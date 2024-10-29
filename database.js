const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./holidays.db");

// Initialize the holidays table if it doesn't exist
db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS holidays (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            country TEXT NOT NULL,
            type TEXT NOT NULL
        )
    `);
});

module.exports = db;
