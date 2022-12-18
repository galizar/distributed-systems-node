#!/usr/bin/env node
// npm install ioredis@4.17
import Redis from 'ioredis';

const redis = new Redis('localhost:6379');
(async () => {
	await redis.set('foo', 'bar');
	const result = await redis.get('foo');
	console.log('result:', result);
	redis.quit();
})();
