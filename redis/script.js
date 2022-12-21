#!/usr/bin/env node

import fs from 'fs';
import { Redis } from 'ioredis'; 

const redis = new Redis('localhost:6379');
redis.defineCommand("adduser", {
	numberOfKeys: 2,
	lua: fs.readFileSync(__dirname + '/add-user.lua')
});
const LOBBY = 'lobby', GAME = 'game';
(async () => {
	console.log(await redis.adduser(LOBBY, GAME, 'alice')); // null
	console.log(await redis.adduser(LOBBY, GAME, 'bob')); // null
	console.log(await redis.adduser(LOBBY, GAME, 'cindy')); // null
	const [gid, players] = await redis.adduser(LOBBY, GAME, 'tlhunter');
	console.log('GAME ID', gid, 'PLAYERS', players.split(','));
	redis.quit();
})();
