// npm install fastify@3.2 ioredis@4.17 pg@8.3

import fastify from 'fastify';
import pg from 'pg';
import ioredis from 'ioredis';

const server = fastify();
const HOST = '0.0.0.0';
const PORT = 3300;
const redis = new ioredis({ enableOfflineQueue: false }); // redis requests will fail when offline

const { Client } = pg;
const pgClient = new Client();

pgClient.connect(); // Note: Postgres will not reconnect on failure

server.get('/health', async (req, reply) => {
	try {
		const res = await pgClient.query('SELECT $1::text as status', ['ACK']);
		if (res.rows[0].status !== 'ACK') reply.code(500).send('DOWN');
	} catch (e) {
		reply.code(500).send('DOWN'); // fail completly if postgres cannot be reached 
	}
	// ... other down checks ...
	let status = 'OK';
	try {
		if (await redis.ping() !== 'PONG') status = 'DEGRADED';
	} catch (e) {
		status = 'DEGRADED'; // pass with a degraded state if redis cannot be reached
	}
	// ... other degraded checks ...
	reply.code(200).send(status);
});

server.listen(
	{port: PORT, host: HOST}, 
	() => console.log(`http://${HOST}:${PORT}/`)
);
