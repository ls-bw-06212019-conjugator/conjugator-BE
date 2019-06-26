const db = require('./dbConfig');
const db_auth = require('./db_auth');

module.exports = {
    getNewWord,
    addStats,
    getStats,
    findWord
  };

const pronouns = 
[ 
   {key: "form 1s", data: ["yo"]},
   {key: "form 2s", data: ["tú","usted"]},
   {key: "form 3s", data: ["él", "ella"]},
   {key: "form 1p", data: ["nosotros", "nosotras"]},
   {key: "form 2p", data: ["vosotros", "vosotras", "ustedes"]},
   {key: "form 3p", data: ["ellos", "ellas"]}
]

async function getNewWord(token)
{
   let type = await db.raw("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = 'verbs' and NOT COLUMN_NAME = 'infinitive' and NOT COLUMN_NAME = 'infinitive_english' ORDER BY random() limit 1; ");
   type = type.rows[0].column_name;
   let infinitive =  await db.raw("SELECT * FROM verbs ORDER BY random() LIMIT 1");
   infinitive = infinitive.rows[0];
   let broketype = type.split("__").map(x=> x.split("_").join(" "));
   let pr = pronouns.filter(x=> x.key === broketype[2])[0].data;
   pr = pr[Math.floor(Math.random() * Math.floor(pr.length-1))];
   let data = {id: infinitive.id, infinitive: infinitive.infinitive, type: broketype[0], tense: broketype[1], form: pr, infinitive_english: infinitive.infinitive_english, answer: infinitive[type]}
   return data;
};

async function addStats(obj, token=null)
{
   let {id, type, tense, correct} = obj;
   if(!id || !type || !tense || correct === undefined) throw "You must commit the correct data";
   type = type.split(" ").join("_"); tense = tense.split(" ").join("_");
   var column_type = `${type}_${correct ? "c" : "i"}`
   await db.raw(`UPDATE global_stats SET ${column_type} = ${column_type} + 1;`); //must use await or function ends before db finishes so db never updates data
   let column_tense = `${tense}_${correct ? "c" : "i"}`
   await db.raw(`UPDATE global_stats SET ${column_tense} = ${column_tense} + 1;`); //must use await or function ends before db finishes so db never updates data
   if(!token) return {message: "add compete: Global only"}
   var username;
   try{
     username = await db_auth.checkAuth(token);
      if(!username) return {message: "add compete: Global only due to invalid token"}
   } catch { return {message: "add compete: Global only due to invalid token"} }
   await db.raw(`UPDATE users SET ${column_type} = array_append(${column_type},${obj.id}), ${column_tense} = array_append(${column_tense},${obj.id}) WHERE username = '${username}'`)
   //await db.raw(`UPDATE users SET `) //add after runing migration

   if(!correct){await db.raw(`UPDATE users SET current_streak = 0 WHERE username = '${username}'`); return {message: "add complete: Global and Personal"};}
   
   let streak = await db.raw(`SELECT best_streak, current_streak FROM users WHERE username = '${username}'`)
   streak = streak.rows[0];
   await db.raw(`UPDATE users SET current_streak = current_streak + 1 WHERE username = '${username}' `);
   if(streak.best_streak <= streak.current_streak+1) await db.raw(`UPDATE users SET best_streak = ${streak.current_streak} + 1 WHERE username = '${username}'`)
   return {message: "add complete: Global and Personal"};;
   
   
}
async function findWord(id)
{
   let word = await db.raw(`SELECT id, infinitive, infinitive_english FROM verbs WHERE id = ${id};`)
   if(word.rows.length < 1) throw "This id doesnt exist";
   word = word.rows[0];
   return word;
} 
async function getStats(token = null)
{
   var global =  await db.raw("SELECT * FROM global_stats");
   global = global.rows[0];
   global.id = undefined;   
   if(!token) return {globals: global}
   var username;
   try{
      username = await db_auth.checkAuth(token);
      if(!username)  return {globals: global, message: "token passed but was not correct"}
   } catch { return {globals: global, message: "token passed but internal error"}}
   var personal = await db.raw(`SELECT * FROM users WHERE username = '${username}'`)
   personal = personal.rows[0];
   personal.authentication = undefined;
   personal.createdAt = undefined;
   return {globals: global, personal: personal};
}

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