import http from 'http';
import asteroids from './asteroids.js';
import astronauts from './astronauts.js';
import spaceprobes from './spaceprobes.js';
import stations from './stations.js';
import minerals from './minerals.js';
import missions from './missions.js';
import stats from './stats.js';
import users from './users.js';
import check_for_logged_token from './require_login.js';

async function handle_request(req, res) {
    if (req.url.startsWith("/v1/asteroids")) {
        if (await check_for_logged_token(req) === false) {
            res.writeHead(401, {headers: "Content-Type: application/json"});
            res.end(JSON.stringify({error: "Authorization required"}));
            return;
        }
        asteroids(req, res);
    } else if (req.url.startsWith("/v1/astronauts")) {
        if (await check_for_logged_token(req) === false) {
            res.writeHead(401, {headers: "Content-Type: application/json"});
            res.end(JSON.stringify({error: "Authorization required"}));
            return;
        }
        astronauts(req,res);
    } else if (req.url.startsWith("/v1/stations")) {
        if (await check_for_logged_token(req) === false) {
            res.writeHead(401, {headers: "Content-Type: application/json"});
            res.end(JSON.stringify({error: "Authorization required"}));
            return;
        }
       stations(req, res); 
    } else if (req.url.startsWith("/v1/spaceprobes")) {
        if (await check_for_logged_token(req) === false) {
            res.writeHead(401, {headers: "Content-Type: application/json"});
            res.end(JSON.stringify({error: "Authorization required"}));
            return;
        }
        spaceprobes(req,res); 
    } else if (req.url.startsWith("/v1/missions")) {
        if (await check_for_logged_token(req) === false) {
            res.writeHead(401, {headers: "Content-Type: application/json"});
            res.end(JSON.stringify({error: "Authorization required"}));
            return;
        }
        missions(req,res);
    } else if (req.url.startsWith("/v1/minerals")) {
        if (await check_for_logged_token(req) === false) {
            res.writeHead(401, {headers: "Content-Type: application/json"});
            res.end(JSON.stringify({error: "Authorization required"}));
            return;
        }
        minerals(req,res);
    } else if (req.url.startsWith("/v1/stats")) {
        stats(req,res);
    } else if (req.url.startsWith("/v1/users")) {
        users(req,res);
    } else {
        res.writeHead(404, { headers: 'Content-Type: application/json'});
        res.end(JSON.stringify({error: "Not found"}));
    }
}

const server = http.createServer(handle_request);

server.listen(8000, () => {
    console.log("The server is running on port 8000");
});
