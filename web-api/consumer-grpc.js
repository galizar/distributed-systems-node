import util from 'util';
import grpc from '@grpc/grpc-js';
import fastify from 'fastify';
import loader from '@grpc/proto-loader';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const server = fastify();
const pkgDef = loader.loadSync(__dirname + '/../shared/grpc-recipe.proto');
const recipe = grpc.loadPackageDefinition(pkgDef).recipe;

const HOST = '127.0.0.1';
const PORT = process.env.PORT || 3000;
const TARGET = process.env.TARGET || 'localhost:4000';

const client = new recipe.RecipeService(
	TARGET,
	grpc.credentials.createInsecure()
);
const getMetadata = util.promisify(client.getMetadata.bind(client));
const getRecipe = util.promisify(client.getRecipe.bind(client));

server.get('/', async () => {
	const [meta, recipe] = await Promise.all([
		getMetadata({}),
		getRecipe({ id: 42 })
	]);

	return {
		consumer_pid: process.id,
		process_data: meta,
		recipe
	};
});

server.listen({port: PORT, host: HOST}, () => {
	console.log(`Consumer running at http://${HOST}:${PORT}/`);
});