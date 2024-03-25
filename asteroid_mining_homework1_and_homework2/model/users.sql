CREATE TABLE user_types (
    id SERIAL NOT NULL PRIMARY KEY,
    type TEXT
);

CREATE TABLE users (
    id SERIAL NOT NULL PRIMARY KEY,
    username TEXT,
    password TEXT,
    user_type INTEGER REFERENCES user_types(id) ON DELETE CASCADE
);

INSERT INTO user_types(type) VALUES ('admin'), ('secretary');
