const db = require('./dbConfig');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const secrets = require('./secrets');

module.exports = {
  login,
  register,
  userExists,
  find
};

async function find(token, id=0)
{
  jwt.verify(token, secrets.jwtSecret);
  let {username, authentication} = jwt.decode(token);
  
  if(!username || !authentication) throw "unauthorized access to database, please login"
  let user = await db('users')
  .where({ username }).first();
  if(authentication !== user.authentication) throw "unauthorized access to database, please login"
  if(id > 0) return db('users')
  .where({id}).first();
  return db('users');
}

async function login(username, password) 
{
  let user = await db('users')
  .where("username", username).first();
  if(bcrypt.compareSync(password, user.authentication)) return {token: await generateToken(user)}
  throw "username and password do not match";
}

function createToken(user)
{
  return bcrypt.hashSync(`${user.authentication}|${user.username}|${user.id}`, 8);
}

async function userExists(username)
{
  if(!username) throw "username must be defined"
  let flag = await db('users')
  .where("username", username);
  if(flag.length > 0 ) throw "this username already exists"
}

async function register(username, password)
{
  let passwordhash = bcrypt.hashSync(password,salt);
  let user = await db("users")
  .insert({username: username, authentication: passwordhash});
  return {token: await generateToken(user)};
}


function generateToken(user) {
  const payload = {
    subject: user.id, // sub in payload is what the token is about
    username: user.username,
    authentication: user.authentication,
    // ...otherData
  };
  const options = {
    expiresIn: '1d', // show other available options in the library's documentation
  };

  // extract the secret away so it can be required and used where needed
  return jwt.sign(payload, secrets.jwtSecret, options); // this method is synchronous
}