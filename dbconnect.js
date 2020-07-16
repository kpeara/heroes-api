const sqlite = require("sqlite3");

// connecting to sqlite database
let db = new sqlite.Database("./db/heroes.db", (err) => {
    if (err) return console.error(err.message);
    console.log("Success: Connected to Heroes Database.");
})

module.exports = db;

// function addHeroToDB() {
//     db.all("SELECT * FROM hero;", (err, rows) => {
//         if (err) console.log(err);
//         else console.log(rows);
//     });
// }


// console.log("the databse: " + addHeroToDB());


// move this to when done using db object (ie. after user leaves/logs out).
// db.close((err) => {
//     if (err) return console.error(err.message);
//     console.log("Success: Closed Connection to In-Memory Database.");
// })