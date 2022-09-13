import fastify from "fastify";
import mercurius from "mercurius";
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = fastify();
const schema = fs.readFileSync(__dirname + '/../shared/graphql-schema.gql').toString();
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

const resolvers = {
	Query: {
		pid: () => process.pid,
		recipe: async (_obj, {id}) => {
			// non-strict equality? I guess id is a string
			if (id != 42) { throw Error(`recipe ${$id} not found`)}
			
			return {
				id, name: "Chicken Tikka Masala",
				steps: "Throw it in a pot..."
			}
		}
	},
	Recipe: {
		ingredients: async (obj) => {
			return (obj.id != 42) ? [] : [
				{ id: 1, name: 'Chicken', quantity: '1 lb' },
				{ id: 2, name: 'Sauce', quantity: '2 cups' }
			]
		}
	}
};

server
	.register(mercurius, {schema, resolvers})
	.listen(
		{port: PORT, host: HOST}, () => {
			console.log(`Producer running at https://${HOST}:${PORT}/graphql`)
		}
	);