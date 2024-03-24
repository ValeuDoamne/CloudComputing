import pg from 'pg';
import handle_body_request from './handle_body_request.js';
import check_for_logged_token from './require_login.js';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

async function check_valid_mineral_id(mineral_id) {
    const response = await client.query('SELECT * FROM minerals WHERE id = $1', [mineral_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function handle_get(req, res) {
    let matches = null;
    if (req.url === "/v1/minerals") {
        const response = await client.query("SELECT * FROM minerals");
        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({minerals: response.rows}));
    } else if ((matches = req.url.match(/\/v1\/minerals\/(\d+)$/)) != null) {
        const id = parseInt(matches[1]);
        const response = await client.query('SELECT * FROM minerals WHERE id=$1', [id]);

        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({mineral: response.rows[0]}));
        } else {
            res.writeHead(404, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The id provided `"+id.toString()+"` was not found"}));
        }
    } else not_found(res);
}

async function handle_post(req, res) {
    if (req.url === "/v1/minerals/new") {
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
            const response = await client.query('INSERT INTO minerals(name) VALUES ($1) RETURNING id', [body.name]);
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({id: response.rows[0]["id"]}));
        });
    } else not_found(res); 
}

async function handle_put(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/minerals\/(\d+)\/rename$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_mineral_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided mineral id was not found'}));
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
            const response = await client.query('UPDATE minerals SET name=$2 WHERE id=$1 RETURNING id,name', [id, body.name]);
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({mineral: response.rows}));
        });
    } else not_found(res);
}

async function handle_delete(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/minerals\/(\d+)\/forget$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_mineral_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided mineral id was not found'}));
            return;
        }
        await client.query('DELETE FROM minerals WHERE id=$1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({success: "Successfully forgot about the mineral!"}));
    } else not_found(res);
}

async function handle_minerals_request(req, res) {
    const is_logged_in = await check_for_logged_token(req);
    if (!is_logged_in) {
        res.writeHead(401, {headers: 'Content-Type application/json'});
        res.end(JSON.stringify({error: "Not authorized"}));
    }
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
export default handle_minerals_request;
