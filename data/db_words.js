const db = require('./dbConfig');
const jwt = require('jsonwebtoken');
const secrets = require('./secrets');

module.exports = {
    getNewWord
  };

async function getNewWord(token)
{
    let type = await db.raw("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_NAME = 'verbs' and NOT COLUMN_NAME = 'infinitive' and NOT COLUMN_NAME = 'infinitive_english' ORDER BY random() limit 1; ");
    type = type.rows[0].column_name;
    let infinitive =  await db.raw("SELECT * FROM verbs ORDER BY random() LIMIT 1");
    infinitive = infinitive.rows[0];
    let broketype = type.split("__").map(x=> x.split("_").join(" "));
    let data = {id: infinitive.id, infinitive: infinitive.infinitive, type: broketype[0], tense: broketype[1], form: broketype[2], infinitive_english: infinitive.infinitive_english, answer: infinitive[type]}
    return data;
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