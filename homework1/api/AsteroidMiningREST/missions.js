import pg from 'pg';
import handle_body_request from './handle_body_request.js';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

function check_valid_mission_json(body) {
    const proprieties = ['spaceprobe_id', 'asteroid_id', 'mission_name']
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

async function check_valid_spaceprobe_id(spaceprobe_id) {
    const response = await client.query('SELECT * FROM spaceprobes WHERE id=$1', [spaceprobe_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function check_valid_asteroid_id(asteroid_id) {
    const response = await client.query('SELECT * FROM asteroids WHERE id=$1', [asteroid_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function check_valid_mission_id(mission_id) {
    const response = await client.query('SELECT * FROM missions WHERE id=$1', [mission_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function was_mission_ended(mission_id) {
    const response = await client.query('SELECT * FROM missions WHERE id=$1 AND mission_end IS NOT NULL', [mission_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function mineral_name_exists(mineral_name) {
    const response = await client.query('SELECT * FROM minerals WHERE name=$1', [mineral_name]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function handle_get(req, res) {
    let matches = null;
    if (req.url === "/v1/missions") {
        const response = await client.query("SELECT * FROM missions");
        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({missions: response.rows}));
    } else if ((matches = req.url.match(/^\/v1\/missions\/(\d+)$/)) != null) {
        const id = parseInt(matches[1]);
        const response = await client.query('SELECT * FROM missions WHERE id=$1', [id]);

        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({mission: response.rows[0]}));
        } else {
            res.writeHead(404, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The id provided `"+id.toString()+"` was not found"}));
        }
    } else if ((matches = req.url.match(/^\/v1\/missions\/(\d+)\/minerals$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_mission_id(id) === false) {
            res.writeHead(400, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'THe mission id is not valid'}));
            return;
        }
        const response = await client.query('SELECT id as mineral_id, name FROM minerals m JOIN missions_minerals mm ON m.id = mm.mineral_id WHERE mm.mission_id = $1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({minerals: response.rows}));
    } else not_found(res);
}

async function handle_post(req, res) {
    let matches = null;
    if (req.url === "/v1/missions/new") {
        handle_body_request(req, res, async (res, body) => {
            const check = check_valid_mission_json(body);
            if (check.result == false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: check.message}));
                return;
            }
            if (await check_valid_spaceprobe_id(body.spaceprobe_id) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: "The spaceprobe_id is not valid"}));
                return;
            }
            if (await check_valid_asteroid_id(body.asteroid_id) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: "The asteroid_id is not valid"}));
                return;
            }
            const response = await client.query('INSERT INTO missions(spaceprobe_id, asteroid_id, mission_name, mission_start) VALUES ($1,$2,$3, to_timestamp($4)) RETURNING id', [body.spaceprobe_id, body.asteroid_id, body.mission_name, Date.now() / 1000.0]);
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({success: "Successfully created mission", id: response.rows[0]["id"]}));
        });
    } else if ((matches = req.url.match(/^\/v1\/missions\/(\d+)\/add_mineral$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_mission_id(id) === false) {
            res.writeHead(400, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'THe mission id is not valid'}));
            return;
        }
        if (await was_mission_ended(id)) {
            res.writeHead(400, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'THe mission was already ended'}));
            return;
        }
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length != 1) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: `The provided JSON number of keys != 1`}));
                return;
            }
            if (('mineral_name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `mineral_name` does not exists!'}));
                return;
            }
            if (await mineral_name_exists(body.mineral_name) == false) {
                await client.query('INSERT INTO minerals(name) VALUES ($1)', [body.mineral_name]); 
            }
            const response = await client.query('INSERT INTO missions_minerals(mission_id, mineral_id) VALUES ($1, (SELECT id FROM minerals WHERE name=$2)) RETURNING mission_id', [id, body.mineral_name]);
            if (response.rowCount > 0) {
                res.writeHead(201, 'Content-Type: application/json');
                res.end(JSON.stringify({success: 'Successfuly added mineral to mission\'s logs'}));
            } else {
                res.writeHead(500, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'Could not add the mineral into mission\'s logs'}));
            }
        });
    } else not_found(res); 
}

async function handle_put(req, res) {
    let matches = null;
    if ((matches = req.url.match(/^\/v1\/missions\/(\d+)\/rename$/)) != null) {
        const id = parseInt(matches[1]);
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length != 1) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 1'}));
                return;
            }
            if (('mission_name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 1'}));
                return;
            }
            const response = await client.query('UPDATE missions SET mission_name=$2 WHERE id=$1 RETURNING id,mission_name', [id, body.mission_name]);
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({mission: response.rows}));
        });
    } else if ((matches = req.url.match(/^\/v1\/missions\/(\d+)\/end$/)) != null) {
        const id = parseInt(matches[1]);
        if (await was_mission_ended(id)) {
            res.writeHead(400, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'THe mission was already ended'}));
            return;
        }
        const response = await client.query('UPDATE missions SET mission_end=to_timestamp($2) WHERE id=$1 RETURNING id,mission_name,mission_start,mission_end', [id, Date.now() / 1000.0]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({mission: response.rows[0]}));
    } else not_found(res);
}

async function handle_delete(req, res) {
    let matches = null;
    if ((matches = req.url.match(/^\/v1\/missions\/(\d+)\/abort$/)) != null) {
        const id = parseInt(matches[1]);
        await client.query('DELETE FROM missions WHERE id=$1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({success: "Mission aborted successfully!"}));
    } else not_found(res);
}

async function handle_missions_request(req, res) {
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
export default handle_missions_request;
