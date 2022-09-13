#!/usr/bin/env node

// Adapted from https://nodejs.org/api/zlib.html
// Warning: Not as efficient as using a Reverse Proxy

import zlib from 'zlib';
import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

http.createServer((request, response) => {
	const raw = fs.createReadStream(__dirname + '/index.html');
	const acceptEncoding = request.headers['accept-encoding'] || '';
	response.setHeader('Content-Type', 'text/plain');
	console.log(acceptEncoding);
	if (acceptEncoding.includes('gzip')) {
		console.log('encoding with gzip');
		response.setHeader('Content-Encoding', 'gzip');
		raw.pipe(zlib.createGzip()).pipe(response);
	} else {
		console.log('no encoding');
		raw.pipe(response);
	}
}).listen(process.env.PORT || 1337);