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

let heroes = [
    { id: 1, name: "Batman", year: 1939, info: "Batman is a fictional superhero appearing in American comic books published by DC Comics." },
    { id: 2, name: "Daredevil", year: 1964, info: "Daredevil is a fictional superhero appearing in American comic books published by Marvel Comics.." },
    { id: 3, name: "Iron Man", year: 1963, info: "Iron Man is a fictional superhero appearing in American comic books published by Marvel Comics." },
    { id: 4, name: "Spider-Man", year: 1962, info: "Spider-Man is a fictional superhero created by writer-editor Stan Lee and writer-artist Steve Ditko." },
    { id: 5, name: "Blue Beetle", year: 1939, info: "Blue Beetle is the name of three fictional superheroes who appear in a number of American comic books published by a variety of companies since 1939." },
    { id: 6, name: "Ant-Man", year: 1962, info: "Ant-Man is the name of several superheroes appearing in books published by Marvel Comics." }
];

// === GET REQUESTS ===
// Home Page
app.get("/", (req, res) => {
    res.send("<h1>Heroes's API</h1><p>USE: https://localhost:3000/api/heroes<p>")
});

// Get heroes array
app.get("/api/heroes", (req, res) => {
    db.all(`SELECT id, name, year, info FROM hero WHERE user_id = ${user_id};`, (err, rows) => {
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
    db.get(`SELECT * FROM hero WHERE user_id = ${user_id} AND id = ${req.params.id};`, (err, row) => {
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
            // const hero = heroes.find(h => h.id === parseInt(req.params.id));
            // if (!hero) return res.status(404).send("Invalid Request: Hero Does Not Exist");

            // hero.name = req.body.name;
            // hero.year = req.body.year;
            // hero.info = req.body.info;
            // res.send(hero);
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
    // find hero
    const hero = heroes.find(h => h.id === parseInt(req.params.id));
    if (!hero) return res.status(404).send("Invalid Request: Hero Does Not Exist");

    // delete
    index = heroes.indexOf(hero);
    heroes.splice(index, 1);
    res.send(hero);
});

// === POST REQUESTS ===
// add a hero to heroes array
app.post("/api/heroes", (req, res) => {
    validate(req.body)
        .then(() => {
            // capitalize string
            let name = capitalize(req.body.name);
            let id = heroes.length === 0 ? 1 : heroes[heroes.length - 1].id + 1; // if array is empty reset id to 1
            const hero = {
                id: id,
                name: name,
                year: req.body.year,
                info: req.body.info
            }
            if (hero != null) heroes.push(hero);
            res.send(hero);
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
