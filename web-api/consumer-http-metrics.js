#!usr/bin/env node

import fastify from 'fastify';
import fetch from 'node-fetch';
import StatsD from 'hot-shots';
import middie from '@fastify/middie';
import v8 from 'v8';
import fs from 'fs';

const server = fastify();

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';
const statsd = new StatsD({host: 'localhost', port: 8125, prefix: 'web-api.'});

(async () => {
	await server.register(middie);

	// inbound metrics
	const inboundClient = statsd.childClient({ prefix: 'inbound.' });

	// register inbound metrics middleware
	server.use((req, res, next) => {
		const startTime = new Date();

		// shadow end request
		const end = res.end;
		res.end = () => {
			res.end = end;
			end.apply(res);
			// Time by URL?
  	  // if (timeByUrl) {
  	    // urlPrefix += '.';
  	    // urlPrefix += findRouteName(req, res) || notFoundRouteName;
  	    // client.increment('response_code' + urlPrefix + '.' + res.statusCode);
  	  // }

			inboundClient.increment('response_code.' + res.statusCode);
			inboundClient.timing(`response_time`, startTime);
		}  
		next();
	});
	// ---

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

setInterval(() => {
	statsd.gauge('server.conn', server.server.connections);

	const m = process.memoryUsage();
	statsd.gauge('server.memory.used', m.heapUsed);
	statsd.gauge('server.memory.total', m.heapTotal);

	const h = v8.getHeapStatistics();
	statsd.gauge('server.heap.size', h.used_heap_size);
	statsd.gauge('server.heap.limit', h.heap_size_limit);

	fs.readdir('/proc/self/fd', (err, list) => {
		if (err) return;
		statsd.gauge('server.descriptors', list.length);
	});

	const begin = new Date();
	setTimeout(() => { statsd.timing('eventlag', begin); }, 0);

}, 10000)
