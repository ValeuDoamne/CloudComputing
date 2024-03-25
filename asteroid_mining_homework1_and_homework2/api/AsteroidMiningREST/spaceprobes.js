import pg from 'pg';
import handle_body_request from './handle_body_request.js';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

async function check_valid_spaceprobe_id(spaceprobe_id) {
    const response = await client.query('SELECT * FROM spaceprobes WHERE id = $1', [spaceprobe_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function check_valid_astronaut_id(astronaut_id) {
    const response = await client.query('SELECT * FROM astronauts WHERE id = $1', [astronaut_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function handle_get(req, res) {
    let matches = null;
    if (req.url === "/v1/spaceprobes") {
        const response = await client.query("SELECT * FROM spaceprobes");
        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({spaceprobes: response.rows}));
    } else if ((matches = req.url.match(/\/v1\/spaceprobes\/(\d+)$/)) != null) {
        const id = parseInt(matches[1]);
        const response = await client.query('SELECT * FROM spaceprobes WHERE id=$1', [id]);

        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({spaceprobe: response.rows[0]}));
        } else {
            res.writeHead(404, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The id provided `"+id.toString()+"` was not found"}));
        }
    } else if ((matches = req.url.match(/\/v1\/spaceprobes\/(\d+)\/operator$/)) != null) {
        const id = parseInt(matches[1]);
        const response = await client.query('SELECT astronaut_id FROM spaceprobes_operators WHERE spaceprobe_id=$1', [id]);

        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify(response.rows[0]));
        } else {
            res.writeHead(404, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The id provided `"+id.toString()+"` was not found"}));
        }
    } else not_found(res);
}

async function already_has_operator(id) {
    const response = await client.query("SELECT * FROM spaceprobes_operators WHERE spaceprobe_id=$1", [id]);
    if (response.rowCount != null && response.rowCount > 0) {
        return true;
    }
    return false;
}

async function handle_post(req, res) {
    let match = null;
    if (req.url === "/v1/spaceprobes/new") {
        handle_body_request(req, res, async (res, body) => { // TODO: remove the `req` as a parameter
            if (Object.keys(body).length != 2) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 2'}));
                return;
            }
            if (('name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `name` does not exist!'}));
                return;
            }
            if (('fabrication_year' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `fabrication_year` does not exist!'}));
                return;
            }
            const response = await client.query('INSERT INTO spaceprobes(name, fabrication_year) VALUES ($1, $2) RETURNING id', [body.name, body.fabrication_year]);
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({id: response.rows[0]["id"]}));
        });
    } else if ((match = req.url.match(/\/v1\/spaceprobes\/(\d+)\/operator$/)) != null) {
        const id = parseInt(match[1]);
        if (await check_valid_spaceprobe_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided spaceprobe id was not found'}));
            return;
        }
        if (await already_has_operator(id)) {
            res.writeHead(422, 'Content-Type: application/json'); // Unprocessable entity
            res.end(JSON.stringify({error: "The spaceproble requested has already an operator"}));
            return;
        }
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length != 1) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 1'}));
                return;
            }
            if (('astronaut_id' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `astronaut_id` does not exist!'}));
                return;
            }
            if ((await check_valid_astronaut_id(body.astronaut_id)) == false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: `The \`astronaut_id\`=${body.astronaut_id} provided does not exists`}));
                return;
            }
            const response = await client.query('INSERT INTO spaceprobes_operators(spaceprobe_id, astronaut_id) VALUES ($1, $2)', [id, body.astronaut_id]);
            
            if (response.rowCount != null && response.rowCount > 0) {
                res.writeHead(201, 'Content-Type: application/json');
                res.end(JSON.stringify({success: `Addded a new spaceprobe operator relationship with between (spaceprobe: ${id}, astronaut: ${body.astronaut_id})`}));
            } else {
                res.writeHead(500, 'Content-Type: application/json');
                res.end(JSON.stringify({error: `Cannot add relationship (spaceprobe: ${id}, astronaut: ${body.astronaut_id})`}));
            }
        });
    } else not_found(res); 
}

async function handle_put(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/spaceprobes\/(\d+)\/change$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_spaceprobe_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided spaceprobe id was not found'}));
            return;
        }
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length !== 2) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 2'}));
                return;
            }
            if (('name' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `name` does not exist!'}));
                return;
            }
            if (('fabrication_year' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `fabrication_year` does not exist!'}));
                return;
            }
            const response = await client.query('UPDATE spaceprobes SET name=$2, fabrication_year=$3 WHERE id=$1  RETURNING id,name,fabrication_year', [id, body.name, body.fabrication_year]);
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({spaceprobe: response.rows[0]}));
        });
    } else not_found(res);
}

async function handle_delete(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/spaceprobes\/(\d+)\/destroy$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_spaceprobe_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided spaceprobe id was not found'}));
            return;
        }
        await client.query('DELETE FROM spaceprobes WHERE id=$1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({success: "Spaceprobe destroyed! You monster!"}));
    } else if ((matches = req.url.match(/\/v1\/spaceprobes\/(\d+)\/operator$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_spaceprobe_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided spaceprobe id was not found'}));
            return;
        }
        const response = await client.query('DELETE FROM spaceprobes_operators WHERE spaceprobe_id=$1', [id]);
        if (response.rowCount > 0) {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({success: "The operator was fired!"}));
        } else {
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({error: "The spaceprobe does not have an operator assigned"}));
        }
    } else not_found(res);
}

async function handle_spaceprobes_request(req, res) {
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
export default handle_spaceprobes_request;
