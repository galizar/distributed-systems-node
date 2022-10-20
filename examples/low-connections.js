import http from 'http';

const server = http.createServer((req, res) => {
	console.log('current conn', server._connections);
	setTimeout(() => res.end('OK\n'), 10_000);
});

server.maxConnections = 2;
server.listen(3020, 'localhost');