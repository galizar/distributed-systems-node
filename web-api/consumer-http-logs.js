#!usr/bin/env node

import fastify from 'fastify';
import fetch from 'node-fetch';
import middie from '@fastify/middie';
import log from './logstash.js';

const server = fastify();

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';

(async () => {
	await server.register(middie);

	server.use((req, res, next) => {
		log('info', 'request-incoming', {
			path: req.url, method: req.method, ip: req.ip,
			ua: req.headers['user-agent'] || null
		});
		next();
	});

	server.setErrorHandler(async (error, req) => {
		log('error', 'request-failure', {
			stack: error.stack,
			path: req.url, method: req.method,
		});
		return { error: error.message };
	});

	server.get('/', async () => {
		const url = `http://${TARGET}/recipes/42`;
		log('info', 'request-outgoing', { url, svc: 'recipe-api' });
		const req = await fetch(url);
		const producer_data = await req.json();
		return { consumer_pid: process.pid, producer_data };
	});

	server.get('/error', async () => { throw new Error('oh no'); });

	server.listen({port: PORT, host: HOST}, () => {
		log('verbose', 'listen', { host: HOST, port: PORT });
	});
})();
