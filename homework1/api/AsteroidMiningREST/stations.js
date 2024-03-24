import pg from 'pg';
import handle_body_request from './handle_body_request.js';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

async function check_valid_station_id(station_id) {
    const response = await client.query('SELECT * FROM stations WHERE id = $1', [station_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function handle_get(req, res) {
    let matches = null;
    if (req.url === "/v1/stations") {
        const response = await client.query("SELECT * FROM stations");
        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({stations: response.rows}));
    } else if ((matches = req.url.match(/\/v1\/stations\/(\d+)$/)) != null) {
        const id = parseInt(matches[1]);
        const response = await client.query('SELECT * FROM stations WHERE id=$1', [id]);

        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({station: response.rows[0]}));
        } else {
            res.writeHead(404, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The id provided `"+id.toString()+"` was not found"}));
        }
    } else not_found(res);
}

async function handle_post(req, res) {
    if (req.url === "/v1/stations/new") {
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length != 2) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 2'}));
                return;
            }
            if (('station_name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `station_name` does not exist!'}));
                return;
            }
            if (('location' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `location` does not exist!'}));
                return;
            }
            const response = await client.query('INSERT INTO stations(station_name, location) VALUES ($1,$2) RETURNING id', [body.station_name, body.location]);
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({id: response.rows[0]["id"]}));
        });
    } else not_found(res); 
}

async function handle_put(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/stations\/(\d+)\/change$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_station_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided station id was not found'}));
            return;
        }
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length != 2) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 2'}));
                return;
            }
            if (('station_name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `station_name` does not exist!'}));
                return;
            }
            if (('location' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `location` does not exist!'}));
                return;
            }
            const response = await client.query('UPDATE stations SET station_name=$2,location=$3 WHERE id=$1  RETURNING id,station_name', [id, body.station_name, body.location]);
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({station: response.rows[0]}));
        });
    } else not_found(res);
}

async function handle_delete(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/stations\/(\d+)\/destroy$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_station_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided station id was not found'}));
            return;
        }
        await client.query('DELETE FROM stations WHERE id=$1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({success: "The station was destroyed. We all gonna die!"}));
    } else not_found(res);
}

async function handle_stations_request(req, res) {
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
export default handle_stations_request;
