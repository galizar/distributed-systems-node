#!/usr/bin/env node

import fastify from 'fastify';
import DatabaseReconnection from './db.js';

const db = new DatabaseReconnection({
	host: 'localhost', port: 5432,
	user: 'user', password: 'hunter2',
	database: 'dbconn', retry: 1_000
});
db.connect();

// event listeners for *educational* purposes
db.on('error', (err) => console.error('db error', err.message));
db.on('reconnect', () => console.log('reconnecting...'));
db.on('connect', () => console.log('connected.'));
db.on('disconnect', () => console.log('disconnected.'));

const server = fastify();

server.get('/foo/:foo_id', async (req, reply) => {
	try {
		var res = await db.query(
			'SELECT NOW() AS time, $1 AS echo', [req.params.foo_id]);
	} catch (e) {
		reply.statusCode = 503;
		return e;
	}
	return res.rows[0];
});

server.get('/health', async (req, reply) => {
	if (!db.connected) { throw new Error('no db connection'); }
	return 'OK';
});

server.listen({ port: 3000 }, () => console.log(`http://localhost:3000`));
