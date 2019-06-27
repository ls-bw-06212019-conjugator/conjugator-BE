require('dotenv').config();
const session = require('express-session');
const db_auth = require('./data/db_auth');
const db_words = require('./data/db_words')
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

const port = process.env.PORT || 3000; //set port with *.env file

server.listen(port, function() {
  console.log(`\n=== Web API Listening on http://localhost:${port} ===\n`);
});


server.get("/api/stats",
  (req,res) => { db_words.getStats(req.headers.token ? req.headers.token : null)
  .then(result => res.status(200).json(result))
  .catch(err => res.status(400).json({error: err, message: "Could not gather from database"}))
  });

server.get("/api/words",
  (req,res) => { db_words.getNewWord(req.body.filter ? req.body.filter : null, req.headers.token ? req.headers.token : null )
  .then(result => res.status(200).json(result))
  .catch(err => res.status(400).json({error: err, message: "Could not gather from database"}))
  });
server.get("/api/words/:id",
  (req,res) => { db_words.findWord(req.params.id)
  .then(result => res.status(200).json(result))
  .catch(err => res.status(400).json({error: err, message: "Could not gather from database"}))
  });

  server.post("/api/words",
  (req,res) => { db_words.addStats(req.body, req.headers.token ? req.headers.token : null)
  .then(result => res.status(200).json(result))
  .catch(err => res.status(400).json({error: err, message: "Could not gather from database"}))
  });

  server.post("/api/settings",
  (req,res) => { db_words.setSettings(req.body, req.headers.token ? req.headers.token : null)
    .then(result => res.status(200).json(result))
    .catch(err => res.status(400).json({error: err, message: "Please login to set setting -- interal error"}))
  });

  server.get("/api/settings",
  (req,res) => { db_words.getSettings(req.headers.token ? req.headers.token : null)
    .then(result => res.status(200).json(result)) //sends default settings if token is invalid
    .catch(err => res.status(400).json({error: err, message: "Internal Server Error"}))
  });

  server.get("/api/goal",
  (req,res) => { db_words.getGoal(req.headers.token ? req.headers.token : null)
    .then(result => res.status(200).json(result)) //sends default settings if token is invalid
    .catch(err => res.status(400).json({error: err, message: "Internal Server Error"}))
  });

  server.post("/api/goal",
  (req,res) => { db_words.setGoal(req.body, req.headers.token ? req.headers.token : null)
    .then(result => res.status(200).json(result)) //sends default settings if token is invalid
    .catch(err => res.status(400).json({error: err, message: "Internal Server Error"}))
  });


/* server.get("/api/users/:id", --unused
  (req,res) => { db_auth.find(req.headers.token, req.params.id)
  .then(result => res.status(200).json(result))
  .catch(err => res.status(400).json({error: err, message: "Could not gather from database"}))}
); */

/* server.get("/api/users", -- unnused
(req,res) => 
db_auth.find(req.headers.token)
.then(result => res.status(200).json(result))
.catch(err => res.status(400).json({error: err, message: "Could not gather from database"}))
); */

server.post("/api/register",
  (req,res,next) =>
  {
  db_auth.userExists(req.body.username).then(() => 
  {
    if(!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.exec(req.body.password))
      return res.status(400).json({error: "bad password", message: "Password must contain 8 characters and have one upper, one lower, and one number"});
    db_auth.register(req.body.username, req.body.password)
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).json({error: err, message: "Interal error"}))
  })
  .catch(err => res.status(400).json({error: err, message: "Username is already in use"}))
  }
);

server.post("/api/login",
  (req,res,next) => 
  db_auth.login(req.body.username, req.body.password)
  .then(result => {
    res.status(200).json(result)
  })
  .catch(err => res.status(400).json({error: err, message: "Incorrect username or password"}))
);

function logger(req,res,next) //debuging tool
  {
    console.log(`${req.method} is being used at ${req.url} at ${Date.now()} ${res.body && (res.method === "post" || res.method === "put") `with ${res.body} data`}`);
    next();
  }