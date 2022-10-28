import fastify from "fastify";
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

const server = fastify();

server.get('/:limit', async (req, reply) => {

	await sleep(10); // simulate a slow database connection

	return String(fibonacci(Number(req.params.limit)));
});

server.listen({port: PORT, host: HOST}, () => {
	// console.log(`Producer running at http://${HOST}:${PORT}`);
});

function fibonacci(limit) {
	let prev = 1n, next = 0n, swap; // 1n -> bigint https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#type_information

	while (limit) {
		swap = prev;
		prev = prev + next;
		next = swap;
		limit--;
	}

	return next;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
