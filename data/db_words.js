const db = require('./dbConfig');
const db_auth = require('./db_auth.js');

const defaultFilter = ['imperative', 'subjunctive', 'future', 'imperfect', 'conditional', 'present_perfect', 'future_perfect', 'past_perfect', 'preterite_archaic', 'conditional_perfect', 'vosotros'];

module.exports = {
   getNewWord,
   addStats,
   getStats,
   findWord,
   getSettings,
   setSettings,
   getGoal,
   setGoal,
   defaultFilter
};

const pronouns =  //list of all pronouns set up as a dictionary of key and value, value is selected at random from the length of the array
   [
      { key: "form 1s", data: ["yo"] },
      { key: "form 2s", data: ["tú"] },
      { key: "form 3s", data: ["él", "ella", "usted"] },
      { key: "form 1p", data: ["nosotros", "nosotras"] },
      { key: "form 2p", data: ["vosotros", "vosotras"] },
      { key: "form 3p", data: ["ellos", "ellas", "ustedes"] }
   ]


async function getNewWord(filter = null, token = null, secondTime = false) //gets a new word from the database at random
{
   if (!filter) filter = defaultFilter;
   if (token) { filter = await getSettings(token); filter = filter.filter; }
   //NOTE: this is a subtractive method not Additive so Keep in mind if you add new columns to verb you will need to eliminate any columns that arent answers
   if (filter[0] === '') filter = [];

   //take care of the vosotros test case
   let dont_use_vosotros = filter.filter(x=> x === "vosotros");
   if(dont_use_vosotros.length === 0) { filter = filter.filter(x=> x !== "vosotros"); filter.push("__form_2p"); }

   let baseFilter = "TABLE_NAME = 'verbs' and NOT COLUMN_NAME = 'infinitive' and NOT COLUMN_NAME = 'infinitive_english' and NOT COLUMN_NAME = 'id'"; //removes all columns that arent conugations
   let userFilter = filter.length ? filter.map(x => ` and not COLUMN_NAME like '%${x}__%' `).join("") : "";
   let type = await db.raw(`SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE ${baseFilter} ${userFilter} ORDER BY random() limit 1; `);
   //check before
   if (!type || !type.rows || type.rows < 1 || !type.rows[0].column_name) if (!secondTime) return getNewWord(null, null, true); else throw "Server could not query verbs, check data still exists"; //run again but with not limitations and then check second time so it only runs once not recusively.
   //then assign type
   type = type.rows[0].column_name;

   //now look up the column in a random word
   let infinitive = await db.raw("SELECT * FROM verbs ORDER BY random() LIMIT 1");
   infinitive = infinitive.rows[0];
   
   //then select a pornoun
   let broketype = type.split("__").map(x => x.split("_").join(" "));
   let pr = pronouns.filter(x => x.key === broketype[2])[0].data;
   
   //remove any pronouns that are unwanted due to a setting
   if(dont_use_vosotros.length === 0) pr = pr.filter(x=> x !== "vosotros" && x !== "vosotras");
   if(pr.length === 0) return getNewWord(null,null,true); //condom so that we dont accidently have no pronoun

   //pick a random one
   pr = pr[Math.floor(Math.random() * Math.floor(pr.length))];

   //then build the return data
   let data = { id: infinitive.id, infinitive: infinitive.infinitive, type: broketype[0], tense: broketype[1], form: pr, infinitive_english: infinitive.infinitive_english, answer: infinitive[type], message: secondTime ? "Using default settings due to over filtering" : undefined }
   return data;
};

async function addStats(obj, token = null) //sets globabl stats always and updates personal stats if token is not null and valid
{
   //validate
   let { id, type, tense, correct } = obj;
   if (!id || !type || !tense || correct === undefined) throw "You must commit the correct data";

   //clean up
   type = type.split(" ").join("_"); tense = tense.split(" ").join("_");
   var column_type = `${type}_${correct ? "c" : "i"}`;
   var column_tense = `${tense}_${correct ? "c" : "i"}`;

   //query global
   await db.raw(`UPDATE global_stats SET ${column_type} = ${column_type} + 1,  ${column_tense} = ${column_tense} + 1, total = total + 1${correct ? ", correct = correct + 1" : ""};`); //must use await or function ends before db finishes so db never updates data

   //verify token
   var username;
   if (!token) return { message: "add compete: Global only" }
   try {
      username = await db_auth.checkAuth(token);
      if (!username) return { message: "add compete: Global only due to invalid token" }
   } catch { return { message: "add compete: Global only due to invalid token" } }

   //set peronsal data
   await db.raw(`UPDATE users SET ${column_type} = array_append(${column_type},${obj.id}), ${column_tense} = array_append(${column_tense},${obj.id}), total = total + 1${correct ? ", correct = correct + 1,  daily_progress = daily_progress + 1 " : ""} WHERE username = '${username}'`);

   //handle incorrect
   if (!correct) { await db.raw(`UPDATE users SET current_streak = 0 WHERE username = '${username}'`); return { message: "add complete: Global and Personal" }; }

   //handle correct
   let streak = await db.raw(`SELECT best_streak, current_streak FROM users WHERE username = '${username}'`)
   streak = streak.rows[0];
   await db.raw(`UPDATE users SET current_streak = current_streak + 1 ${streak.best_streak <= (streak.current_streak + 1) ? `, best_streak = ${streak.current_streak + 1}` : ''} WHERE username = '${username}'`);
   return { message: "add complete: Global and Personal" };
}
async function findWord(id) //given an id it finds a word
{
   let word = await db.raw(`SELECT id, infinitive, infinitive_english FROM verbs WHERE id = ${id};`)
   if (word.rows.length < 1) throw "This id doesnt exist";
   word = word.rows[0];
   return word;
}
async function getStats(token = null) //gives global stats always and gives personal stats if token is valid and not null
{
   var global = await db.raw("SELECT * FROM global_stats");
   global = global.rows[0];
   global.id = undefined;
   var best = await db.raw("SELECT username, best_streak FROM users WHERE NOT best_streak = 0 ORDER BY best_streak DESC");
   best = best.rows;
   let best_streaks = best.map(x=> x);
   best_streaks.length = best.length > 5 ? 5 : best.length;
   global.best_streaks = best_streaks;
   if (!token) return { globals: global }
   var username;
   try {

      username = await db_auth.checkAuth(token);
      if (!username) return { globals: global, message: "token passed but was not correct" }
   } catch { return { globals: global, message: "token passed but internal error" } }

   //find personal best and total best_percent
   var personal = await db.raw(`SELECT * FROM users WHERE username = '${username}'`)
   var best_percet = await db.raw(`Select username, correct, total FROM users WHERE NOT total = 0 ORDER BY (correct / total) DESC;`)
   best_percet = best_percet.rows;

   //have to revers here cuz of weird sql bug
   best_percet = best_percet.reverse(); 
   best = best.reverse();

   //devalidate protected rows
   personal = personal.rows[0];
   personal.authentication = undefined;
   personal.createdAt = undefined;
   //get your postion in the goalbal whole
   if (best.length) 
   {
      let num = best.findIndex(x => `____${x.username}____` === `____${username}____`);
      num = num < 0 ? 0 : num;
      personal.streak_position = Math.floor(((num)/(best.length-1))*100);
   } else personal.streak_position = 0;
   if(best_percet.length)
   {
      let num = best_percet.findIndex(x => x.username === username);
      num = num < 0 ? 0 : num;
      personal.percent_position = Math.floor(((num) / (best_percet.length-1))*100);
   } else personal.percent_position = 0;

   return { globals: global, personal: personal };
}

async function setSettings(data, token) {
   if (!token) throw "Must be logged in to set settings"
   var username;
   try {
      username = await db_auth.checkAuth(token);
      if (!username) throw "";
   } catch { throw "Must be logged in to set settings -- invalid token" }
   let settings = defaultFilter.join(",");
   if (data && data.filter) settings = data.filter.join(",");
   await db.raw(`UPDATE users SET filter = '${settings}' WHERE username = '${username}'`);
   settings = await db.raw(`SELECT filter FROM users WHERE username = '${username}'`)
   settings = settings.rows[0].filter;
   return { filter: settings.split(",") };
}

async function getSettings(token) {
   if (!token) return { filter: defaultFilter }
   var username;
   try {
      username = await db_auth.checkAuth(token);
      if (!username) throw "";
   } catch { return { filter: defaultFilter, message: "Must be logged in to get settings -- invalid token" }; }
   let settings = await db.raw(`SELECT filter FROM users WHERE username = '${username}'`)
   settings = settings.rows[0].filter;
   return { filter: settings.split(",") };
}

async function getGoal(token) {
   if (!token) throw "Must send token - please login";
   try {
      username = await db_auth.checkAuth(token);
      if (!username) throw "";
   } catch { return { filter: defaultFilter, message: "Must be logged in -- invalid token" }; }

   let goal = await db.raw(`SELECT daily_progress, daily_goal FROM users WHERE username = '${username}'`);
   return goal.rows[0];
}

async function setGoal(body, token) {
   if (!token) throw "Must send token - please login";
   if (!body || !body.goal || isNaN(body.goal) || body.goal < 1) throw "Invalid goal data -- either not defined or not a valid number"
   try {
      username = await db_auth.checkAuth(token);
      if (!username) throw "";
   } catch { return { filter: defaultFilter, message: "Must be logged in -- invalid token" }; }

   await db.raw(`UPDATE users SET daily_goal = ${Math.ceil(body.goal)} WHERE username = '${username}'`);
   let goal = await db.raw(`SELECT daily_progress, daily_goal FROM users WHERE username = '${username}'`);
   return goal.rows[0];
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

/*
Select username, correct, total
FROM users
WHERE NOT total = 0
ORDER BY correct / total DESC;
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