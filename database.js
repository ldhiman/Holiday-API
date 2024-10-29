// database.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // Create new table with proper constraints
    await client.query(`
      CREATE TABLE IF NOT EXISTS holidays (
        id SERIAL,
        name TEXT NOT NULL,
        date DATE NOT NULL,
        country TEXT NOT NULL,
        type TEXT NOT NULL,
        CONSTRAINT holidays_unique UNIQUE (name, date, country)
      )
    `);
    console.log("Database initialized with proper constraints");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    client.release();
  }
};

// Initialize the database
initializeDatabase().catch(console.error);

module.exports = pool;
