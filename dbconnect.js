const sqlite = require("sqlite3");

let db = new sqlite.Database("./db/heroes.db", (err) => {
    if (err) return console.error(err.message);
    console.log("Success: Connected to Heroes Database.");
})

db.close((err) => {
    if (err) return console.error(err.message);
    console.log("Success: Closed Connection to In-Memory Database.");
})