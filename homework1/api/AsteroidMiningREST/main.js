import http from 'http';
import asteroids from './asteroids.js';
import bodyParser from 'body-parser';

async function handle_request(req, res) {
    const json_header = 'Content-Type: application/json'

    if (req.url.startsWith("/v1/asteroids")) {
        const response = await asteroids(req);
        res.writeHead(200, { headers: json_header } );
        res.end(response);
    } else if (req.url.startsWith("/v1/astronauts")) {
        console.log(req);
        console.log(req.body);
        res.writeHead(200, { headers: json_header } );
        res.end(JSON.stringify({"data": "Everything is fine"}));
    } else if (req.url.startsWith("/v1/stations")) {
   
    } else if (req.url.startsWith("/v1/missions")) {
    
    } else if (req.url.startsWith("/v1/missions")) {

    } else if (req.url.startsWith("/v1/minerals")) {

    } else {
        res.writeHead(404, { headers: json_header });
        res.end(JSON.stringify({error: "Not found"}));
    }
}

const server = http.createServer(handle_request);

server.listen(8000, () => {
    console.log("The server is running on port 8000");
});
