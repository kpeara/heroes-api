CREATE TABLE IF NOT EXISTS user (
    id integer PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS hero (
    id integer PRIMARY KEY,
    name text NOT NULL,
    year integer,
    info text NOT NULL,
    user_id integer NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);


-- adding dummy data
INSERT INTO user DeFAULT VALUES;
INSERT INTO user DEFAULT VALUES;
INSERT INTO user DEFAULT VALUES;

INSERT INTO hero (name, year, info, user_id)
    VALUES ("Aquaman", 2000, "king of atlantis", 1);
INSERT INTO hero (name, year, info, user_id)
    VALUES ("Flash", 2000, "Speedster", 1);

INSERT INTO hero (name, year, info, user_id)
    VALUES ("Green Arrow", 1999, "arrow", 2);
INSERT INTO hero (name, year, info, user_id)
    VALUES ("Green Lanturn", 1999, "arrow", 2);

INSERT INTO hero (name, year, info, user_id)
    VALUES ("Wonder Woman", 1800, "strong", 3);
INSERT INTO hero (name, year, info, user_id)
    VALUES ("Black Canary", 1800, "cool", 3);
