#!/usr/bin/env node

import pg from 'pg';

const { Client } = pg;

const db = new Client({
	host: 'localhost', port: 5432,
	user: 'user', password: 'hunter2',
	database: 'dbconn'
});
db.connect();

(async () => {
	const start = Date.now();
	await Promise.all([ // two slow queries sent at the same time
		db.query("SELECT pg_sleep(2);"),
		db.query("SELECT pg_sleep(2);"),
	]);
	console.log(`took ${(Date.now() - start) / 1000} seconds`);
	db.end();
})();
