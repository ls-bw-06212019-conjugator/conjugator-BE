const db = require('./data/dbConfig');

async function resetDaily() 
{
   await db.raw("UPDATE users SET daily_progress = 0;");
   return;
}
resetDaily();

process.exit();