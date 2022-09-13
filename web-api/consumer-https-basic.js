#!usr/bin/env node

import fastify from 'fastify';
import fetch from 'node-fetch';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = fastify();

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';

const options = {
	agent: new https.Agent({
		ca: fs.readFileSync(__dirname + '/../shared/tls/ca-certificate.cert')
	})
};

server.get('/', async () => {
	const req = await fetch(`https://${TARGET}/recipes/42`, options);
	const producer_data = await req.json();
	return {
		consumer_pid: process.pid,
		producer_data
	};
});

server.listen({port: PORT, host: HOST}, () => {
	console.log(`Consumer running at http://${HOST}:${PORT}/`);
});