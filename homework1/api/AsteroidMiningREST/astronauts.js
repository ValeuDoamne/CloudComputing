import pg from 'pg';
import handle_body_request from './handle_body_request.js';
import axios from 'axios';
import randomInt from 'crypto';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

async function check_valid_astronaut_id(astronaut_id) {
    const response = await client.query('SELECT * FROM astronauts WHERE id = $1', [astronaut_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function check_station_id(station_id) {
    const response = await client.query('SELECT * FROM stations WHERE id = $1', [station_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function handle_get(req, res) {
    let matches = null;
    if (req.url === "/v1/astronauts") {
        const response = await client.query("SELECT * FROM astronauts");
        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({astronauts: response.rows}));
    } else if ((matches = req.url.match(/\/v1\/astronauts\/(\d+)$/)) != null) {
        const id = parseInt(matches[1]);
        const response = await client.query('SELECT * FROM astronauts WHERE id=$1', [id]);

        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({spaceprobe: response.rows[0]}));
        } else {
            res.writeHead(404, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The id provided `"+id.toString()+"` was not found"}));
        }
    } else not_found(res);
}

function check_valid_astronaut_json(body) {
    const proprieties = ['station_id', 'first_name', 'last_name', 'salary', 'birth']
    if (Object.keys(body).length != proprieties.length) {
        return {result: false, message: `The provided JSON number of keys != ${proprieties.length}`};
    }
    let result = true;
    let message = "";
    proprieties.forEach((x) => {
        if ((x in body) === false) {
            result = false;
            message = `The key \`${x}\` does not exists!`;
        }
    });

    return {result: result, message: message};
}

async function handle_post(req, res) {
    if (req.url === "/v1/astronauts/new") {
        handle_body_request(req, res, async (res, body) => {
            const check_result = check_valid_astronaut_json(body);
            if (check_result.result === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: check_result.message}));
                return;
            }
            if ((await check_station_id(body.station_id)) === false) {
                res.writeHead(404, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The station_id provided was not found'}));
                return;
            }
            const response = await client.query('INSERT INTO astronauts(station_id, first_name, last_name, salary, birth) VALUES ($1, $2, $3, $4, $5) RETURNING id', [body.station_id, body.first_name, body.last_name, body.salary, body.birth]);
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({id: response.rows[0]["id"]}));
        });
    } else if (req.url == "/v1/astronauts/auto_add") {
        const response = await axios.get("https://fakerapi.it/api/v1/users?_quantity=1");
        console.log(response.data);
        const salary = randomInt.randomInt(3300);
        const rows = await client.query("SELECT id FROM stations");

        if (rows.rowCount === 0) {
            res.writeHead(500, 'Content-Type: application/json');
            res.end(JSON.stringify({error: "There is no station"}));
            return;
        }
        const station_id = rows.rows[0].id;

        const record = response.data.data[0];

        const db_response = await client.query('INSERT INTO astronauts(station_id, first_name, last_name, salary, birth) VALUES ($1, $2, $3, $4, $5) RETURNING id', [station_id, record.firstname, record.lastname, salary, "09/11/2021"]);

        if (db_response.rowCount === 0) {
            res.writeHead(500, "Content-Type: application/json");
            res.end(JSON.stringify({error: "Could not add new astronaut"}));
        }
        res.writeHead(200, "Content-Type: application/json");
        res.end(JSON.stringify({success: "Successfuly created astronaut with id: "+db_response.rows[0].id.toString()}));
    } else not_found(res); 
}

async function handle_put(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/astronauts\/(\d+)\/update$/)) != null) {
        const id = parseInt(matches[1]);
        handle_body_request(req, res, async (res, body) => {
            const check_result = check_valid_astronaut_json(body);
            if (check_result.result === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: check_result.message}));
                return;
            }
            const response = await client.query('UPDATE astronauts SET first_name=$2,last_name=$3,salary=$4,birth=$5,station_id=$6 WHERE id=$1 RETURNING *', [id, body.first_name, body.last_name, body.salary, body.birth, body.station_id]);
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({astronaut: response.rows}));
        });
    } else not_found(res);
}

async function handle_delete(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/astronauts\/(\d+)\/remove$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_astronaut_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided astronaut id was not found'}));
            return;
        }
        await client.query('DELETE FROM astronauts WHERE id=$1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({success: "Astronaut died, such a shame!"}));
    } else not_found(res);
}

async function handle_astronauts_request(req, res) {
    switch(req.method) {
        case 'GET':
            await handle_get(req, res);
            break;
        case 'POST':
            await handle_post(req, res);
            break;
        case 'PUT':
            await handle_put(req, res);
            break;
        case 'DELETE':
            await handle_delete(req, res);
            break;
        default:
            res.writeHead(400, 'Content-Type: application/json');
            res.end(JSON.stringify({error: "No such method"}));
    }
}
export default handle_astronauts_request;
