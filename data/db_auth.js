const db = require('./dbConfig');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const jwt = require('jsonwebtoken');
const secrets = require('./secrets');

module.exports = {
  login,
  register,
  userExists,
  find,
  checkAuth
};

async function find(token, id=0)
{
  if(!await checkAuth(token)) throw "Unauthorized access to database, please login";
  
  if(id > 0) return db('users')
  .where({id}).first();
  return db('users');
}
async function checkAuth(token)
{
  jwt.verify(token, secrets.jwtSecret);
  let {username, authentication} = jwt.decode(token);
  
  if(!username || !authentication) return null;
  let user = await db('users')
  .where({ username }).first();
  if(authentication !== user.authentication) return null;
  return username;
}
async function login(username, password) 
{
  let user = await db('users')
  .where("username", username).first();
  if(bcrypt.compareSync(password, user.authentication)) return {token: await generateToken(user)}
  throw "Username and password do not match";
}

function createToken(user)
{
  return bcrypt.hashSync(`${user.authentication}|${user.username}|${user.id}`, 8);
}

async function userExists(username)
{
  if(!username) throw "Username must be defined"
  let flag = await db('users')
  .where("username", username);
  if(flag.length > 0 ) throw "This username already exists"
}

async function register(username, password)
{
  let passwordhash = bcrypt.hashSync(password,salt);
  let user = await db("users")
  .insert({username: username, authentication: passwordhash});
  return await login(username, password);
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