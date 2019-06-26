const db = require('./dbConfig');
const db_auth = require('./db_auth.js');

const defaultFilter = ['imperative', 'subjuctive', 'archaic']

module.exports = {
    getNewWord,
    addStats,
    getStats,
    findWord,
    getSettings,
    setSettings
  };

const pronouns =  //list of all pronouns set up as a dictionary of key and value, value is selected at random from the length of the array
[ 
   {key: "form 1s", data: ["yo"]},
   {key: "form 2s", data: ["tú","usted"]},
   {key: "form 3s", data: ["él", "ella"]},
   {key: "form 1p", data: ["nosotros", "nosotras"]},
   {key: "form 2p", data: ["vosotros", "vosotras", "ustedes"]},
   {key: "form 3p", data: ["ellos", "ellas"]}
]


async function getNewWord(filter=null, token=null, secondTime=false) //gets a new word from the database at random
{
   if(!filter) filter = defaultFilter;
   if(token){filter = await getSettings(token); filter = filter.filter;}
   //NOTE: this is a subtractive method not Additive so Keep in mind if you add new columns to verb you will need to eliminate any columns that arent answers
   let baseFilter = "TABLE_NAME = 'verbs' and NOT COLUMN_NAME = 'infinitive' and NOT COLUMN_NAME = 'infinitive_english' and NOT COLUMN_NAME = 'id'"; //removes all columns that arent conugations
   let userFilter = filter.map(x=> ` and not COLUMN_NAME like '%${x}__%' `).join("");
   let type = await db.raw(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE ${baseFilter} ${userFilter} ORDER BY random() limit 1; `);
   //check before
   if(!type || !type.rows || type.rows < 1 || !type.rows[0].column_name) if(!secondTime) return getNewWord(null,null,true); else throw "Server could not query verbs, check data still exists"; //run again but with not limitations and then check second time so it only runs once not recusively.
   type = type.rows[0].column_name;
   let infinitive =  await db.raw("SELECT * FROM verbs ORDER BY random() LIMIT 1");
   infinitive = infinitive.rows[0];
   let broketype = type.split("__").map(x=> x.split("_").join(" "));
   let pr = pronouns.filter(x=> x.key === broketype[2])[0].data;
   pr = pr[Math.floor(Math.random() * Math.floor(pr.length-1))];
   let data = {id: infinitive.id, infinitive: infinitive.infinitive, type: broketype[0], tense: broketype[1], form: pr, infinitive_english: infinitive.infinitive_english, answer: infinitive[type]}
   return data;
};

async function addStats(obj, token=null) //sets globabl stats always and updates personal stats if token is not null and valid
{
   //validate
   let {id, type, tense, correct} = obj;
   if(!id || !type || !tense || correct === undefined) throw "You must commit the correct data";
   
   //clean up
   type = type.split(" ").join("_"); tense = tense.split(" ").join("_");
   var column_type = `${type}_${correct ? "c" : "i"}`; 
   var column_tense = `${tense}_${correct ? "c" : "i"}`;
   //query global
   await db.raw(`UPDATE global_stats SET ${column_type} = ${column_type} + 1,  ${column_tense} = ${column_tense} + 1;`); //must use await or function ends before db finishes so db never updates data
   
   //verify token
   var username;
   if(!token) return {message: "add compete: Global only"}
   try{
     username = await db_auth.checkAuth(token);
      if(!username) return {message: "add compete: Global only due to invalid token"}
   } catch { return {message: "add compete: Global only due to invalid token"} }

   //set peronsal data
   await db.raw(`UPDATE users SET ${column_type} = array_append(${column_type},${obj.id}), ${column_tense} = array_append(${column_tense},${obj.id}) WHERE username = '${username}'`);

   //handle incorrect
   if(!correct){await db.raw(`UPDATE users SET current_streak = 0 WHERE username = '${username}'`); return {message: "add complete: Global and Personal"};}
   
   //handle correct
   let streak = await db.raw(`SELECT best_streak, current_streak FROM users WHERE username = '${username}'`)
   streak = streak.rows[0];
   await db.raw(`UPDATE users SET current_streak = current_streak + 1 ${streak.best_streak <= (streak.current_streak+1) ? `, best_streak = ${streak.current_streak+1}` :''} WHERE username = '${username}'`);
   return {message: "add complete: Global and Personal"};
}
async function findWord(id) //given an id it finds a word
{
   let word = await db.raw(`SELECT id, infinitive, infinitive_english FROM verbs WHERE id = ${id};`)
   if(word.rows.length < 1) throw "This id doesnt exist";
   word = word.rows[0];
   return word;
} 
async function getStats(token = null) //gives global stats always and gives personal stats if token is valid and not null
{
   var global =  await db.raw("SELECT * FROM global_stats");
   global = global.rows[0];
   global.id = undefined;   
   if(!token) return {globals: global}
   var username;
   //try{
      username = await db_auth.checkAuth(token);
      if(!username)  return {globals: global, message: "token passed but was not correct"}
   //} catch { return {globals: global, message: "token passed but internal error"}}
   var personal = await db.raw(`SELECT * FROM users WHERE username = '${username}'`)
   personal = personal.rows[0];
   personal.authentication = undefined;
   personal.createdAt = undefined;
   return {globals: global, personal: personal};
}

async function setSettings(data, token)
{
  if(!token) throw "Must be logged in to set settings"
  var username;
  try
  {
    username = await db_auth.checkAuth(token);
    if(!username) throw "";
  } catch { throw "Must be logged in to set settings -- invalid token"}
  settings = defaultFilter.join(",");
  if(data && data.filter && data.filter.length) settings = data.filter.join(",");
  await db.raw(`UPDATE users SET settings = '${settings}' WHERE username = '${username}'`);
  return {message: "updated settings"};
}

async function getSettings(token)
{
  if(!token) return {filter: defaultFilter}
  var username;
  try
  {
    username = await db_auth.checkAuth(token);
    if(!username) throw "";
  } catch { return {filter: defaultFilter, message: "Must be logged in to get settings -- invalid token"};}
  let settings = await db.raw(`SELECT settings FROM users WHERE username = '${username}'`)
  settings = settings.rows[0].settings;
  return {filter: settings.split(",")};
}


//below is test sql commands for above calls for debuging

/*  get random infinitive
Select infinitive
from verbs
ORDER BY random()
Limit 1; */

/* get random type
SELECT
   COLUMN_NAME
FROM
   information_schema.COLUMNS
WHERE
   TABLE_NAME = 'verbs'
   order by random()
   limit 1; 
*/

/* update personal stats
UPDATE users 
SET indicative_c = 
	array_append(indicative_c, 7)
WHERE username = 'a'; 
*/


//list of all tracted variables -- old
/*
user: 
   username = string;
   authentication = string;

   indicative_correct = [wordIds];
   subjunctive_correct = [wordIds];
   imperative_correct = [wordIds];
   
   indicative_incorrect = [wordIds];
   subjunctive_incorrect = [wordIds];
   imperative_incorrect = [wordIds];
*/

/*
global_stats:
   indicative = int
   subjunctive = int
   imperative = int

   Present = int 
   Future = int
   Imperfect = int
   Preterite = int
   Conditional = int
   Present Perfect = int
   Future Perfect = int
   Past Perfect = int
   Preterit Archaic = int
   Conditional Perfect = int   
*/