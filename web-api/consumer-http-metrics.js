#!usr/bin/env node

import fastify from 'fastify';
import fetch from 'node-fetch';
import StatsD from 'hot-shots';
import middie from '@fastify/middie';

const server = fastify();

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';
const statsd = new StatsD({host: 'localhost', port: 8125, prefix: 'web-api.'});

(async () => {
	await server.register(middie);

	// inbound metrics
	const inboundClient = statsd.childClient({ prefix: '.inbound' });

	// register inbound metrics middleware
	server.use((req, res, next) => {
		const startTime = new Date();

		// shadow end request
		const end = res.end;
		res.end = () => {
			res.end = end;
			end.apply(res);

		}

	});
	// ---

	// "generic middleware that tracks inbound requests"
	// server.use(statsd.helpers.getExpressMiddleware('inbound', {
		// timeByUrl: true
	// }));

	server.get('/', async () => {
		const begin = new Date();
		const req = await fetch(`http://${TARGET}/recipes/42`);
		statsd.timing('.outbound.recipe-api.request-time', begin);
		statsd.increment('.outbound.recipe-api.request-count');
		const producer_data = await req.json();

		return {
			consumer_pid: process.pid,
			producer_data
		};
	});

	server.get('/error', async () => { throw new Error('oh no'); });

	server.listen({port: PORT, host: HOST}, () => {
		console.log(`Consumer running at http://${HOST}:${PORT}/`);
	});
})();
