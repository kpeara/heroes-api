const express = require("express");

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
]

// === GET REQUESTS ===
app.get("/", (req, res) => {
    res.send("<h1>Heroes's API</h1>")
});

app.get("/api/heroes", (req, res) => {

    modifiedHeroes = [...heroes];

    // queries
    const reverse = req.query.reverse;
    const sortProp = req.query.sortBy;

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
    if (!hero) res.status(404).send("Invalid Request: Hero Does Not Exist");
    else res.send(hero);
});

// === POST REQUESTS ===
app.post("/api/heroes", (req, res) => {
    const hero = {
        id: heroes.length + 1,
        name: req.body.name,
        year: req.body.year
    }
    if (hero != null) heroes.push(hero);
    res.send(hero);
})

app.listen(port, () => console.log(`listening on port ${port}`));