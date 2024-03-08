import pg from 'pg';

const client = new pg.Client();
await client.connect()

function handle_asteroids_request(req) {
    if (req.url.startsWith("/v1/asteroids/new")) {
        client.query("INSERT INTO asteroids(name) VALUES ('SPP')");
        return JSON.stringify({data: "Successfully created record"});
    }
    return JSON.stringify({data: client.query("SELECT * FROM asteroids")});
}

export default handle_asteroids_request;
