import pg from 'pg';

const client = new pg.Client();
await client.connect()

async function handle_asteroids_request(req) {
    if (req.url.startsWith("/v1/asteroids/new")) {
        await client.query("INSERT INTO asteroids(name) VALUES ('SPP')");
        return JSON.stringify({data: "Successfully created record"});
    }
    const promise = await client.query("SELECT * FROM asteroids");
    return JSON.stringify({asteroids: promise.rows});
}

export default handle_asteroids_request;
