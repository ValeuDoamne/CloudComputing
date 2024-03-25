import pg from 'pg';

const client = new pg.Client();
await client.connect()

function not_found(res) {
    res.writeHead(404, 'Content-Type: application/json');
    res.end(JSON.stringify({error: 'Not found!'}));
}

async function handle_get(req, res) {
    if (req.url === "/v1/stats") {
        const stations = await client.query("SELECT COUNT(*) FROM stations");
        const spaceprobes = await client.query("SELECT COUNT(*) FROM spaceprobes");
        const astroanuts = await client.query("SELECT COUNT(*) FROM astronauts");
        const minerals = await client.query("SELECT COUNT(*) FROM minerals");
        const missions = await client.query("SELECT COUNT(*) FROM missions");

        const stations_int = parseInt(stations.rows[0]["count"]);
        const spaceprobes_int = parseInt(spaceprobes.rows[0]["count"]);
        const astronauts_int = parseInt(astroanuts.rows[0]["count"]);
        const minerals_int = parseInt(minerals.rows[0]["count"]);
        const missions_int = parseInt(missions.rows[0]["count"]);

        res.writeHead(200, 'Content-Type: application/json');
        res.end(JSON.stringify({stations: stations_int, spaceprobes: spaceprobes_int,
            astronauts: astronauts_int, minerals: minerals_int, missions: missions_int}));
    } else not_found(res);
}

async function handle_stations_request(req, res) {
    switch(req.method) {
        case 'GET':
            await handle_get(req, res);
            break;
        default:
            res.writeHead(400, 'Content-Type: application/json');
            res.end(JSON.stringify({error: "No such method"}));
    }
}
export default handle_stations_request;
