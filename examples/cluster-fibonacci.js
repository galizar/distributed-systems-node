import fastify from "fastify";
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;
console.log(`worker pid=${process.pid}`);

const server = fastify();

server.get('/:limit', async (req, reply) => {
	return String(fibonacci(Number(req.params.limit)));
});

server.listen({port: PORT, host: HOST}, () => {
	console.log(`Producer running at http://${HOST}:${PORT}`);
});

function fibonacci(limit) {
	let prev = 1n, next = 0n, swap;

	while (limit) {
		swap = prev;
		prev = prev + next;
		next = swap;
		limit--;
	}

	return next;
}