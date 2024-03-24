import pg from 'pg';
import handle_body_request from './handle_body_request.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import check_for_logged_token from './require_login.js';
import get_auth_payload from './get_authorization.js';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

function hash_password(password) {
    const hashing_alg = crypto.createHash('sha256');
    hashing_alg.update(password);
    return hashing_alg.digest('hex')
}

function create_token(user_id, user_type) {
    return jwt.sign({user_id, user_type}, process.env.JWT_SECRET, {algorithm: 'HS512'});
}

async function check_valid_user_id(asteroid_id) {
    const response = await client.query('SELECT * FROM users WHERE id = $1', [asteroid_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function username_exists(username) {
    const response = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function get_user_type(user_type_id) {
    const response = await client.query('SELECT type FROM user_types WHERE id=$1', [user_type_id])
    if (response.rowCount > 0) {
        return response.rows[0].type;
    }
    return null; 
}

async function get_username(user_id) {
    const response = await client.query('SELECT username FROM users WHERE id=$1', [user_id])
    if (response.rowCount > 0) {
        return response.rows[0].username;
    }
    return null; 
}

async function handle_get(req, res) {
    if (await check_for_logged_token(req) === false) {
        res.writeHead(401, 'Content-Type: application/json');
        res.end(JSON.stringify({error: 'Not authorized'}));
        return;
    }
    if (req.url === "/v1/users/about") {
        const token = get_auth_payload(req);
        const user_id = token.user_id;
        const username = await get_username(user_id);
        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({success: "Succesfully gathered username", username: username}));
    }
}

async function handle_post(req, res) {
    if (req.url === "/v1/users/new") {
        handle_body_request(req, res, async (res, body) => { // TODO: remove the `req` as a parameter
            if (Object.keys(body).length != 2) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 2'}));
                return;
            }
            if (('username' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `username` does not exist!'}));
                return;
            }
            if (('password' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `password` does not exist!'}));
                return;
            }
            if (await username_exists(body.username) === true) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The `username` already exists'}));
                return;
            }
            const hashed_password = hash_password(body.password);
            const response = await client.query('INSERT INTO users(username, user_type, password) VALUES ($1, (SELECT id FROM user_types WHERE type=\'simpleton\'), $2) RETURNING id', [body.username, hashed_password]);
            res.writeHead(201, 'Content-Type: application/json');
            res.end(JSON.stringify({id: response.rows[0]["id"], success: "Successfully created user"}));
        });
    } else if (req.url == "/v1/users/login") {
        handle_body_request(req, res, async (res, body) => {
            if (Object.keys(body).length != 2) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The provided JSON number of keys != 2'}));
                return;
            }
            if (('username' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `username` does not exist!'}));
                return;
            }
            if (('password' in body) === false) {
                res.writeHead(400, 'Content-Type: application/json');
                res.end(JSON.stringify({error: 'The key `password` does not exist!'}));
                return;
            }
            const hashed_password = hash_password(body.password);
            const response = await client.query('SELECT id,user_type FROM users WHERE username=$1 AND password=$2', [body.username, hashed_password]);
            if (response.rowCount == 1) {
                res.writeHead(200, 'Content-Type: application/json');
                const user_id = response.rows[0].id;
                const user_type = await get_user_type(response.rows[0].user_type);
                res.end(JSON.stringify({success: "User logged in successfully", token: create_token(user_id, user_type)}));
            } else {
                res.writeHead(401, 'Content-Type: application/json');
                res.end(JSON.stringify({error: "Invalid username or passsword"}));
            }
        });
    } else not_found(res); 
}

async function handle_put(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/users\/(\d+)\/rename$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_user_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided user id was not found'}));
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
            const response = await client.query('UPDATE users SET name=$2 WHERE id=$1  RETURNING id,name', [id, body.name]);
            res.writeHead(200, { headers : 'Content-Type: application/json'});
            res.end(JSON.stringify({user: response.rows}));
        });
    } else not_found(res);
}

async function handle_delete(req, res) {
    let matches = null;
    if ((matches = req.url.match(/\/v1\/users\/(\d+)\/remove$/)) != null) {
        const id = parseInt(matches[1]);
        if (await check_valid_user_id(id) === false) {
            res.writeHead(404, 'Content-Type: application/json');
            res.end(JSON.stringify({error: 'The provided user id was not found'}));
            return;
        }
        await client.query('DELETE FROM users WHERE id=$1', [id]);
        res.writeHead(200, { headers : 'Content-Type: application/json'});
        res.end(JSON.stringify({success: "Asteroid nuked successfully!"}));
    } else not_found(res);
}

async function handle_users_request(req, res) {
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
export default handle_users_request;
