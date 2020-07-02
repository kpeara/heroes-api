const express = require("express");
const Joi = require("joi"); // capitals for Class
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ credentials: true, origin: true }));
const port = 3000;

let heroes = [
    { id: 1, name: "Batman", year: 1939, info: "Batman is a fictional superhero appearing in American comic books published by DC Comics. The character was created by artist Bob Kane and writer Bill Finger, and first appeared in Detective Comics #27 in 1939. Originally named the 'Bat-Man,' the character is also referred to by such epithets as the Caped Crusader, the Dark Knight, and the World's Greatest Detective. (wikipedia)" },
    { id: 2, name: "Daredevil", year: 1964, info: "Daredevil is a fictional superhero appearing in American comic books published by Marvel Comics. Daredevil was created by writer-editor Stan Lee and artist Bill Everett, with an unspecified amount of input from Jack Kirby. The character first appeared in Daredevil #1 (April 1964). Writer/artist Frank Miller's influential tenure on the title in the early 1980s cemented the character as a popular and influential part of the Marvel Universe. Daredevil is commonly known by such epithets as the 'Man Without Fear' and the 'Devil of Hell's Kitchen'." },
    { id: 3, name: "Iron Man", year: 1963, info: "Iron Man is a fictional superhero appearing in American comic books published by Marvel Comics. The character was co-created by writer and editor Stan Lee, developed by scripter Larry Lieber, and designed by artists Don Heck and Jack Kirby. The character made his first appearance in Tales of Suspense #39 (cover dated March 1963), and received his own title in Iron Man #1 (May 1968)." },
    { id: 4, name: "Spider-Man", year: 1962, info: "Spider-Man is a fictional superhero created by writer-editor Stan Lee and writer-artist Steve Ditko. He first appeared in the anthology comic book Amazing Fantasy #15 (August 1962) in the Silver Age of Comic Books. He appears in American comic books published by Marvel Comics, as well as in a number of movies, television shows, and video game adaptations set in the Marvel Universe." },
    { id: 5, name: "Blue Beetle", year: 1939, info: "Blue Beetle is the name of three fictional superheroes who appear in a number of American comic books published by a variety of companies since 1939. The most recent of the companies to own rights to the Blue Beetle is DC Comics who bought the rights to the character in 1983, using the name for three distinct characters over the years." },
    { id: 6, name: "Ant-Man", year: 1962, info: "Ant-Man is the name of several superheroes appearing in books published by Marvel Comics. Created by Stan Lee, Larry Lieber and Jack Kirby, Ant-Man's first appearance was in Tales to Astonish #35 (September 1962). The persona was originally the brilliant scientist Hank Pym's superhero alias after inventing a substance that can change size, but reformed thieves Scott Lang and Eric O'Grady also took on the mantle after the original changed his superhero identity to various other aliases, such as Giant-Man, Goliath, and Yellowjacket." }
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
