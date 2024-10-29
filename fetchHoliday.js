const axios = require("axios");
const db = require("./database"); // Import your PostgreSQL database setup
require("dotenv").config();

const API_KEY = process.env.API_KEY2;
const BASE_URL = "https://calendarific.com/api/v2/holidays";

// Function to fetch holidays and store them in the database
async function fetchHolidays(year, country) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: API_KEY,
        country: country,
        year: year,
      },
    });

    const holidays = response.data.response.holidays;

    if (!holidays.length) {
      console.log(`No holidays found for ${country} in ${year}.`);
      return; // Exit early if no holidays found
    }

    const insertPromises = holidays.map((holiday) => {
      const name = holiday.name;
      const date = holiday.date.iso;
      const type = holiday.type[0] || "General";

      // Insert each holiday into the database using parameterized query with ON CONFLICT
      return db
        .query(
          `INSERT INTO holidays (name, date, country, type) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT ON CONSTRAINT holidays_unique 
         DO UPDATE SET type = EXCLUDED.type`,
          [name, date, country, type]
        )
        .catch((err) => {
          console.error(`Error inserting holiday: ${name}`, err.message);
        });
    });

    // Wait for all inserts to complete
    await Promise.all(insertPromises);

    console.log(`Holidays for ${country} in ${year} added to the database.`);
  } catch (error) {
    console.error(
      `Error fetching holiday data for ${country} in ${year}:`,
      error.message
    );
  }
}

// List of countries (ISO 3166-1 alpha-2 codes)
const countries = [
  "AF",
  "AL",
  "DZ",
  "AS",
  "AD",
  "AO",
  "AI",
  "AQ",
  "AG",
  "AR",
  "AM",
  "AW",
  "AU",
  "AT",
  "AZ",
  "BS",
  "BH",
  "BD",
  "BB",
  "BY",
  "BE",
  "BZ",
  "BJ",
  "BM",
  "BT",
  "BO",
  "BQ",
  "BA",
  "BW",
  "BV",
  "BR",
  "IO",
  "BN",
  "BG",
  "BF",
  "BI",
  "CV",
  "KH",
  "CM",
  "CA",
  "KY",
  "CF",
  "TD",
  "CL",
  "CN",
  "CX",
  "CC",
  "CO",
  "KM",
  "CD",
  "CG",
  "CK",
  "CR",
  "HR",
  "CU",
  "CW",
  "CY",
  "CZ",
  "DK",
  "DJ",
  "DM",
  "DO",
  "EC",
  "EG",
  "SV",
  "GQ",
  "ER",
  "EE",
  "SZ",
  "ET",
  "FK",
  "FO",
  "FJ",
  "FI",
  "FR",
  "GF",
  "PF",
  "TF",
  "GA",
  "GM",
  "GE",
  "DE",
  "GH",
  "GI",
  "GR",
  "GL",
  "GD",
  "GP",
  "GU",
  "GT",
  "GG",
  "GN",
  "GW",
  "GY",
  "HT",
  "HM",
  "VA",
  "HN",
  "HK",
  "HU",
  "IS",
  "IN",
  "ID",
  "IR",
  "IQ",
  "IE",
  "IM",
  "IL",
  "IT",
  "JM",
  "JP",
  "JE",
  "JO",
  "KZ",
  "KE",
  "KI",
  "KP",
  "KR",
  "KW",
  "KG",
  "LA",
  "LV",
  "LB",
  "LS",
  "LR",
  "LY",
  "LI",
  "LT",
  "LU",
  "MO",
  "MG",
  "MW",
  "MY",
  "MV",
  "ML",
  "MT",
  "MH",
  "MQ",
  "MR",
  "MU",
  "YT",
  "MX",
  "FM",
  "MD",
  "MC",
  "MN",
  "ME",
  "MS",
  "MA",
  "MZ",
  "MM",
  "NA",
  "NR",
  "NP",
  "NL",
  "NC",
  "NZ",
  "NI",
  "NE",
  "NG",
  "NU",
  "NF",
  "MP",
  "NO",
  "OM",
  "PK",
  "PW",
  "PS",
  "PA",
  "PG",
  "PY",
  "PE",
  "PH",
  "PN",
  "PL",
  "PT",
  "PR",
  "QA",
  "RE",
  "RO",
  "RU",
  "RW",
  "BL",
  "SH",
  "KN",
  "LC",
  "MF",
  "SX",
  "VC",
  "WS",
  "SM",
  "ST",
  "SA",
  "SN",
  "RS",
  "SC",
  "SL",
  "SG",
  "SK",
  "SI",
  "SB",
  "SO",
  "ZA",
  "GS",
  "SS",
  "ES",
  "LK",
  "SD",
  "SR",
  "SJ",
  "SZ",
  "SE",
  "CH",
  "SY",
  "TW",
  "TJ",
  "TZ",
  "TH",
  "TL",
  "TG",
  "TK",
  "TO",
  "TT",
  "TN",
  "TR",
  "TM",
  "TC",
  "TV",
  "UG",
  "UA",
  "AE",
  "GB",
  "US",
  "UY",
  "UZ",
  "VU",
  "VE",
  "VN",
  "WF",
  "EH",
  "YE",
  "ZM",
  "ZW",
];

// console.log(countries.length);

// Main function to initiate holiday fetching for all countries
async function main() {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;

  for (const country of countries) {
    await fetchHolidays(currentYear, country); // Current year
    await fetchHolidays(nextYear, country); // Next year
  }
}

module.exports = fetchHolidays;

// // Run the main function
// main().catch((error) => {
//   console.error("Error during fetching holidays:", error.message);
// });
