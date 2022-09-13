import fastify from "fastify";
import fetch from "node-fetch";

const server = fastify();
const HOST = '127.0.0.1';
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';

const complexQuery = `query kitchenSink ($id: ID) {
	recipe(id: $id) {
		id name
		ingredients {
			name quantity
		}
	}
	pid
}`;

server.get('/', async () => {
	const req = await fetch(`http://${TARGET}/graphql`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		body: JSON.stringify({
			query: complexQuery,
			variables: { id: "42" }
		})
	});

	return {
		consumer_pid: process.pid,
		producer_data: await req.json()
	};
});

server.listen({port: PORT, host: HOST}, () => {
	console.log(`Consumer running in http://${HOST}:${PORT}/`)
});

