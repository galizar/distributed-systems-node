#!/usr/bin/env node

// npm install fastify@3.2 lru-cache@6.0 node-fetch@2.6
import fetch from 'node-fetch';
import fastify from 'fastify';
import LRUCache from 'lru-cache';

const server = fastify();
const lru = new LRUCache({ // The cache will store approximately 4kb of data for up to 10 minutes.
  max: 4096,
	maxSize: 4096,
  sizeCalculation: (payload, key) => payload.length + key.length, // deprecated name: length
  ttl: 10 * 60 * 1_000 // deprecated name: maxAge
});
const PORT = process.env.PORT || 3000;

server.get('/account/:account', async (req, reply) => {
	return getAccount(req.params.account);
});

server.listen({port: PORT}, () => console.log(`http://localhost:${PORT}`));

async function getAccount(account) {
	const cached = lru.get(account); // consult cache before request

	if (cached) { console.log('cache hit'); return JSON.parse(cached); }

	console.log('cache miss');
	const result = await fetch(`https://api.github.com/users/${account}`);
	const body = await result.text();
	lru.set(account, body); // update cache 

	return JSON.parse(body);
}
