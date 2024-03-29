import pg from 'pg';
import randomInt from 'crypto';
import handle_body_request from './handle_body_request.js';
import https from 'https';
import axios from 'axios';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

async function check_valid_asteroid_id(asteroid_id) {
    const response = await client.query('SELECT * FROM asteroids WHERE id = $1', [asteroid_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function handle_get(req, res) {
    let matches = null;
    if (req.url === "/v1/asteroids") {
        const response = await client.query("SELECT * FROM asteroids");
        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({asteroids: response.rows}));
    } else if ((matches = req.url.match(/\/v1\/asteroids\/(\d+)$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_asteroid_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided asteroid id was not found'}));
            return;
        }
        const response = await client.query('SELECT * FROM asteroids WHERE id=$1', [id]);

        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({asteroid: response.rows[0]}));
        } else {
            res.writeHead(404, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The id provided `"+id.toString()+"` was not found"}));
        }
    } else not_found(res);
}

async function handle_post(req, res) {
    if (req.url === "/v1/asteroids/new") {
        handle_body_request(req, res, async (res, body) => { // TODO: remove the `req` as a parameter
            if (Object.keys(body).length != 1) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 1'}));
                return;
            }
            if (('name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `name` does not exist!'}));
                return;
            }
            const response = await client.query('INSERT INTO asteroids(name) VALUES ($1) RETURNING id', [body.name]);
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({id: response.rows[0]["id"]}));
        });
    } else if (req.url === "/v1/asteroids/explore") {
        handle_body_request(req, res, async (res, body) => { // TODO: remove the `req` as a parameter
            if (Object.keys(body).length != 1) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 1'}));
                return;
            }
            if (('number_of_asteroids' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `number_of_asteroids` does not exist!'}));
                return;
            }

            let number_of_asteroids = 1;
            try {
                number_of_asteroids = parseInt(body.number_of_asteroids); 
                if (number_of_asteroids <= 0) {
                    throw Error;
                }
            } catch (e) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: `Cannot decode integer or have a negative/null one`}));
                return;
            }

            const random_number = randomInt.randomInt(Math.floor(6562/number_of_asteroids));
            const NASA_API = `https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=full_name&full-prec=false&limit=${body.number_of_asteroids}&limit-from=${random_number}&sb-class=MCA&sb-kind=a&sb-ns=n&sort=full_name&www=1`;
            let number_of_added_asteroids = 0;

            try {
                const response = await axios.get(NASA_API);
                for(let x of response.data.data) {
                    const response = await client.query('INSERT INTO asteroids(name) VALUES ($1) RETURNING id', [x[2].trim()]);
                    if (response.rowCount > 0) {
                        number_of_added_asteroids++;
                    }
                }
            } catch (e) {
                res.writeHead(500, 'Content-Type: application/json');
                res.end(JSON.stringify({error: `Cannot ping the NASA API for getting asteroids`}));
            }
            
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({success: `Added ${number_of_added_asteroids} asteroids`}));
        });

    } else not_found(res); 
}

async function handle_put(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/asteroids\/(\d+)\/rename$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_asteroid_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided asteroid id was not found'}));
            return;
        }
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length != 1) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 1'}));
                return;
            }
            if (('name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `name` does not exist!'}));
                return;
            }
            const response = await client.query('UPDATE asteroids SET name=$2 WHERE id=$1  RETURNING id,name', [id, body.name]);
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({asteroid: response.rows[0]}));
        });
    } else not_found(res);
}

async function handle_delete(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/asteroids\/(\d+)\/destroy$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_asteroid_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided asteroid id was not found'}));
            return;
        }
        await client.query('DELETE FROM asteroids WHERE id=$1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({success: "Asteroid nuked successfully!"}));
    } else not_found(res);
}

async function handle_asteroids_request(req, res) {
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
export default handle_asteroids_request;
