#!/usr/bin/env node
// npm install ioredis@4.17

import Redis from 'ioredis'; 

const redis = new Redis('localhost:6379');

(async () => {
	const [res_srem, res_hdel] = await redis.multi() // ioredis expes the .multi method to begin a transaction
		.srem("employees", "42") // Remove from Set
			.hdel("employee-42", "company-id") // Delete from Hash
			.exec(); // the .exec method finishes the transaction
	console.log('srem?', !!res_srem[1], 'hdel?', !!res_hdel[1]);
	redis.quit();
})();
