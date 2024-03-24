CREATE TABLE asteroids (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT
);

CREATE TABLE spaceprobes (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT,
    fabrication_year INTEGER
);

CREATE TABLE stations (
    id SERIAL NOT NULL PRIMARY KEY,
    station_name TEXT,
    location TEXT NOT NULL
);

CREATE TABLE astronauts (
    id SERIAL NOT NULL PRIMARY KEY,
    station_id INTEGER REFERENCES stations(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    salary INTEGER NOT NULL,
    birth DATE
);

CREATE TABLE minerals (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE stations_astronauts (
    station_id INTEGER REFERENCES stations(id) ON DELETE CASCADE,
    astronaut_id INTEGER REFERENCES astronauts(id) ON DELETE CASCADE,
    CONSTRAINT unique_station_id UNIQUE(station_id),
    CONSTRAINT unique_astronaut_id UNIQUE(astronaut_id)
);

CREATE TABLE missions (
    id SERIAL NOT NULL PRIMARY KEY,
    spaceprobe_id INTEGER REFERENCES spaceprobes(id) ON DELETE CASCADE,
    asteroid_id INTEGER REFERENCES asteroids(id) ON DELETE CASCADE,
    mission_name TEXT,
    mission_start DATE,
    mission_end DATE,
    CONSTRAINT unique_spaceprobe_id UNIQUE(spaceprobe_id),
    CONSTRAINT unique_asteroid_id UNIQUE(asteroid_id)
);

CREATE TABLE spaceprobes_operators (
    spaceprobe_id INTEGER REFERENCES spaceprobes(id) ON DELETE CASCADE,
    astronaut_id INTEGER REFERENCES astronauts(id) ON DELETE CASCADE,
    CONSTRAINT unique_spaceprobe_id2 UNIQUE(spaceprobe_id),
    CONSTRAINT unique_astronaut_id2 UNIQUE(astronaut_id)
);

CREATE TABLE missions_minerals (
    mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
    mineral_id INTEGER REFERENCES minerals(id) on DELETE CASCADE,
    found DATE
);

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

INSERT INTO user_types(type) VALUES ('admin'), ('simpleton');
