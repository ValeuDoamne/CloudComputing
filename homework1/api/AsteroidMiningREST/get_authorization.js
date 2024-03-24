import jwt from 'jsonwebtoken';

export default function get_auth_payload(req) {
    if ('authorization' in req.headers) {
        const authorization = req.headers.authorization.trim();
        let match = null;
        if ((match = authorization.match(/^Bearer ([\w-]*\.[\w-]*\.[\w-]*$)/)) != null) {
            const token = match[1];
            try {
                return jwt.verify(token, process.env.JWT_SECRET);
            } catch(e) {
                return null;
            }
        }
    }
    return null;
}
