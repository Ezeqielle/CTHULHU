const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Set up MySQL connection
// change to do
const db = mysql.createConnection({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as ID ' + db.threadId);
});

// API endpoint for receiving data
app.post('/api/data', (req, res) => {
  // Parse incoming request data as JSON
  const { var1, var2, var3 } = req.body;

  // Insert data into MySQL
  // change to do
  const sql = `INSERT INTO your_table (var1, var2, var3) VALUES (?, ?, ?)`;
  const values = [var1, var2, var3];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into MySQL: ' + err.stack);
      res.status(500).send('Error inserting data into MySQL');
      return;
    }
    console.log('Inserted data into MySQL with ID ' + result.insertId);
    res.status(200).send('Data inserted into MySQL');
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});