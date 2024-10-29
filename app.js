const express = require("express");
const bodyParser = require("body-parser");
const db = require("./database"); // Import the PostgreSQL database pool
const fetchHolidays = require("./fetchHoliday"); // Ensure fetchHoliday exports fetchHolidays function

const app = express();
app.use(bodyParser.json());

app.get("/api/request_holidays", async (req, res) => {
  const { year, country } = req.query;
  if (!year || !country) {
    res.status(400).send("Year and Country Required!!");
    return;
  }

  try {
    await fetchHolidays(parseInt(year), country)
      .catch((err) => {
        res.status(500).send("Holiday Request Failed!!");
      })
      .then(() => {
        res.status(200).send("Holiday Requested!!");
      });
  } catch (err) {
    console.log(err);
    // res.status(500).send(err);
    res.status(500).send("Internal Server Error!!");
  }
});

// Endpoint to get holidays by date, country, and type
app.get("/api/holidays", async (req, res) => {
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
  query += " AND date = $1";
  params.push(effectiveDate);

  if (country) {
    query += " AND country = $2";
    params.push(country);
  }
  if (type) {
    query += " AND type = $3";
    params.push(type);
  }

  try {
    // Execute the query using the PostgreSQL pool
    const { rows } = await db.query(query, params);

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
  } catch (err) {
    console.error("Database query error:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("OK");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Holiday API is running on http://localhost:${PORT}`);
});
