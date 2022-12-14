#!/usr/bin/env node

// npm install fastify@3.2 lru-cache@6.0 node-fetch@2.6
import fetch from 'node-fetch';
import fastify from 'fastify';
import { Client} from 'memjs';

const server = fastify();
const memcache = Client.create('localhost:11211');
const PORT = process.env.PORT || 3000;

server.get('/account/:account', async (req, reply) => {
	return getAccount(req.params.account);
});

server.listen({port: PORT}, () => console.log(`http://localhost:${PORT}`));

async function getAccount(account) {
	const { value: cached } = await memcache.get(account); // consult cache before request

	if (cached) { console.log('cache hit'); return JSON.parse(cached); }

	console.log('cache miss');
	const result = await fetch(`https://api.github.com/users/${account}`);
	const body = await result.text();
	await memcache.set(account, body, {});

	return JSON.parse(body);
}
