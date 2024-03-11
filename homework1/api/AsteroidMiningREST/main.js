import http from 'http';
import asteroids from './asteroids.js';
import astronauts from './astronauts.js';
import spaceprobes from './spaceprobes.js';
import stations from './stations.js';
import minerals from './minerals.js';
import missions from './missions.js';

async function handle_request(req, res) {
    if (req.url.startsWith("/v1/asteroids")) {
        asteroids(req, res);
    } else if (req.url.startsWith("/v1/astronauts")) {
        astronauts(req,res);
    } else if (req.url.startsWith("/v1/stations")) {
       stations(req, res); 
    } else if (req.url.startsWith("/v1/spaceprobes")) {
        spaceprobes(req,res); 
    } else if (req.url.startsWith("/v1/missions")) {
        missions(req,res);
    } else if (req.url.startsWith("/v1/minerals")) {
        minerals(req,res);
    } else {
        res.writeHead(404, { headers: 'Content-Type: application/json'});
        res.end(JSON.stringify({error: "Not found"}));
    }
}

const server = http.createServer(handle_request);

server.listen(8000, () => {
    console.log("The server is running on port 8000");
});
