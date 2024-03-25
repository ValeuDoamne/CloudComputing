import pg from 'pg';
import jwt from 'jsonwebtoken';


const client = new pg.Client();
await client.connect();

async function check_valid_user_id(user_id) {
    const response = await client.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (response.rowCount > 0) {
        return true;
    }
    return false;
}

async function is_valid_token(token) {
    try {
        const decoded_payload = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded_payload.user_id;
        if (await check_valid_user_id(user_id) === true) {
            return true;
        }
    } catch(e) {
        return false;
    }
    return false;
}

export default async function check_for_logged_token(req) {
    if ('authorization' in req.headers) {
        const authorization = req.headers.authorization.trim();
        let match = null;
        if ((match = authorization.match(/^Bearer ([\w-]*\.[\w-]*\.[\w-]*$)/)) != null) {
            const token = match[1];
            return (await is_valid_token(token));
        }
    }
    return false;
}
