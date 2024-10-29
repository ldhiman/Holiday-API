const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database"); // Import the SQLite database
const requestData = require("./fetchHoliday"); // Ensure fetchHoliday exports fetchHolidays function

const app = express();
app.use(bodyParser.json());

// Endpoint to get holidays by date, country, and type
app.get("/api/holidays", (req, res) => {
  const { date, country, type } = req.query;

  // If no parameters are provided, use today's date
  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0]; // Format to YYYY-MM-DD

  // Build the query dynamically based on provided filters
  let query = "SELECT name, date, country, type FROM holidays WHERE 1=1";
  const params = [];

  // Use today's date if no date is provided
  const effectiveDate = date || formattedToday;

  // Add date filter
  query += " AND date = ?";
  params.push(effectiveDate);

  if (country) {
    query += " AND country = ?";
    params.push(country);
  }
  if (type) {
    query += " AND type = ?";
    params.push(type);
  }

  // Execute the query
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({ error: err.message });
    }

    const uniqueHolidays = new Map();
    rows.forEach((row) => {
      const key = `${row.name}-${row.date}-${row.country}`;
      if (!uniqueHolidays.has(key)) {
        uniqueHolidays.set(key, row);
      }
    });

    // Format the response data into a structured object
    const response = {
      count: uniqueHolidays.size,
      holidays: Array.from(uniqueHolidays.values()).map((row) => ({
        name: row.name,
        date: row.date,
        country: row.country,
        type: row.type,
      })),
    };

    res.json(response);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Holiday API is running on http://localhost:${PORT}`);
});
