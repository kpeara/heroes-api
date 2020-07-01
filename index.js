const express = require("express");
const Joi = require("joi"); // capitals for Class

const app = express();
app.use(express.json());
const port = 3000;

let heroes = [
    { id: 1, name: "Batman", year: 1939 },
    { id: 2, name: "Daredevil", year: 1964 },
    { id: 3, name: "Iron Man", year: 1963 },
    { id: 4, name: "Spider-Man", year: 1962 },
    { id: 5, name: "Blue Beetle", year: 1939 },
    { id: 6, name: "Ant-Man", year: 1962 }
];

// === GET REQUESTS ===
app.get("/", (req, res) => {
    res.send("<h1>Heroes's API</h1>")
});

app.get("/api/heroes", (req, res) => {

    modifiedHeroes = [...heroes];

    // queries
    const reverse = req.query.reverse; // reverse array
    const sortProp = req.query.sortBy; // sort array based on property
    const reindex = req.query.reindex; // reindex array (changes stay)

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
});

app.get("/api/heroes/:id", (req, res) => {
    const hero = heroes.find(h => h.id === parseInt(req.params.id));
    if (!hero) return res.status(404).send("Invalid Request: Hero Does Not Exist");
    res.send(hero);
});

// === PUT REQUESTS ===
app.put("/api/heroes/:id", (req, res) => {
    // find hero
    const hero = heroes.find(h => h.id === parseInt(req.params.id));
    if (!hero) return res.status(404).send("Invalid Request: Hero Does Not Exist");

    // validate
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    hero.year = req.body.year;
    res.send(hero);
});

// === DELETE REQUESTS ===
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
app.post("/api/heroes", (req, res) => {
    // validate
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // capitalize string
    let name = capitalize(req.body.name);
    let id = heroes.length === 0 ? 1 : heroes[heroes.length - 1].id + 1; // if array is empty reset id to 1

    const hero = {
        id: id,
        name: name,
        year: req.body.year
    }
    if (hero != null) heroes.push(hero);
    res.send(hero);
});

app.listen(port, () => console.log(`listening on port ${port}`));

// validation request body with Joi
function validate(hero) {
    const schema = {
        name: Joi.string().min(3).max(30).required(),
        year: Joi.number().max(new Date().getUTCFullYear()).required()
    }
    return Joi.validate(hero, schema);
}

// capitalize name string properly
function capitalize(name) {
    return name.toLowerCase().replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase());
}