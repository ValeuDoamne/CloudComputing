import pg from 'pg';
import http from 'http';
import asteroids from './asteroids.js';

async function handle_rest(req, res) {
    res.writeHead(200, { headers: 'Content-Type: application/json'} );
    if (req.url.startsWith("/v1/asteroids")) {
        const response = asteroids(req);
        res.end(response);
    } else {
        res.end(JSON.stringify({data: "Sussy"}));
    }
}

const server = http.createServer(handle_rest);

server.listen(8000, () => {
    console.log("The server is running on port 8000");
});
