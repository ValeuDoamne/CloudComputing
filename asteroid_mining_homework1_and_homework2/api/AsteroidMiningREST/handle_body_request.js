export default function handle_body_request(req, res, handle_json_lambda) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            let requestBody = JSON.parse(body);
            handle_json_lambda(res, requestBody);
        } catch(error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({error: `Error parsing JSON: ${error}`}));
        }
    });
}
