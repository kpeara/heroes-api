const express = require("express");
const yup = require("yup");
const cors = require("cors");
const db = require("./dbconnect");

const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
const port = 3000;
const user_id = 1;
// NOTE: For testing purposes, the user will have a user id of 1

// === GET REQUESTS ===
// Home Page
app.get("/", (req, res) => {
    res.send("<h1>Heroes's API</h1><p>USE: https://localhost:3000/api/heroes<p>")
});

// Get heroes from database
app.get("/api/heroes", (req, res) => {
    const sql = `SELECT id, name, year, info FROM hero WHERE user_id = ${user_id};`;
    db.all(sql, (err, rows) => {
        if (err) console.log(err);
        else {
            // if there is no error, copy the data to a temporary array for modification (a feature I might deprecate)
            modifiedHeroes = [...rows];

            // queries
            const reverse = req.query.reverse; // reverse array
            const sortProp = req.query.sortBy; // sort array based on property
            const reindex = req.query.reindex; // reindex array (changes stay)

            if (reverse) console.log("REVERSAL");

            if (reindex === "true") {
                for (i = 0; i < modifiedHeroes.length; i++) {
                    modifiedHeroes[i].id = i + 1;
                }
            }
            if (sortProp === "name" || sortProp === "year") {
                modifiedHeroes.sort((a, b) => {
                    if (a[sortProp] > b[sortProp]) return 1;
                    if (a[sortProp] < b[sortProp]) return -1;
                    return 0;
                })
            }
            if (reverse === "true") {
                modifiedHeroes.reverse();
            }
            res.send(modifiedHeroes);
        }
    });
});

// Get a specific hero based on given id
app.get("/api/heroes/:id", (req, res) => {
    const sql = `SELECT * FROM hero WHERE user_id = ${user_id} AND id = ${req.params.id};`;
    db.get(sql, (err, row) => {
        if (err) return err;
        else {
            const hero = row
            if (!hero) return res.status(404).send("Invalid Request: Hero Does Not Exist");
            res.send(hero);
        }
    });
});

// === PUT REQUESTS ===
// update hero based on given id
app.put("/api/heroes/:id", (req, res) => {
    validate(req.body)
        .then(() => {
            // update hero from database
            const data = [req.body.name, req.body.year, req.body.info];
            const sql = `UPDATE hero
                            SET name = ?,
                                year = ?,
                                info = ?
                            WHERE user_id = ${user_id} AND id = ${req.params.id}`;
            db.run(sql, data, function (err) {
                if (err) console.log(err.message);
                else {
                    res.send(`Row(s) Updated: ${this.changes}`); // returns number of rows updated
                }
            })
        })
        .catch(err => {
            if (err) {
                res.status(400).send(err.errors[0]);
            }
        });
});

// === DELETE REQUESTS ===
// delete hero based on given id
app.delete("/api/heroes/:id", (req, res) => {
    // // find hero
    const sql = `DELETE FROM hero WHERE user_id = ${user_id} AND id = ${req.params.id}`;
    db.run(sql, function (err) {
        if (err) console.log(err.message);
        else {
            res.send(`Row(s) Updated: ${this.changes}`); // returns number of rows updated
        }
    })
});

// === POST REQUESTS ===
// add a hero to heroes array
app.post("/api/heroes", (req, res) => {
    validate(req.body)
        .then(() => {
            // capitalize string
            let name = capitalize(req.body.name);
            const sqlNewId = `SELECT IFNULL(max(id), 0) + 1 FROM hero WHERE user_id = ${user_id}`;
            db.get(sqlNewId, (err, row) => {
                // get new ID for hero to be added
                id = row["IFNULL(max(id), 0) + 1"];
                if (err) console.log(err.message);
                else {
                    const data = [name, req.body.year, req.body.info]
                    const sql = `
                        INSERT INTO hero (id, name, year, info, user_id)
                            VALUES ( ${id},
                            ?,
                            ?,
                            ?,
                            ${user_id});
                    `;
                    // insert into databse new hero object with new id
                    db.run(sql, data, function (err) {
                        if (err) console.log(err.message + "MEEEE" + id);
                        else {
                            // return a hero object for heroes array to add (front end)
                            const hero = {
                                id: id,
                                name: name,
                                year: req.body.year,
                                info: req.body.info
                            }
                            if (hero != null) heroes.push(hero);
                            res.send(hero);
                        }
                    });
                }
            });
        })
        .catch(err => {
            if (err) {
                res.status(400).send(err.errors[0]);
            }
        });
});

app.listen(port, () => console.log(`listening on port ${port}`));

// validation request body with yup
function validate(hero) {
    const schema = yup.object().shape({
        name: yup.string().min(3).max(30).required(),
        year: yup.number().max(new Date().getUTCFullYear()).positive(), // optional
        info: yup.string().min(5).max(200).required(),
    });
    return schema.validate(hero); // returns a Promise
}

// capitalize name string properly
function capitalize(name) {
    return name.toLowerCase().replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}
