const db = require('./data/dbConfig');

async function resetDaily() 
{
    try{
        await db.raw("UPDATE users SET daily_progress = 0;");
    }catch { console.log("error")}
   return;
}
resetDaily()
.then(()=> {
    console.log("ran daily update");
    process.exit();
} )
