import grpc from '@grpc/grpc-js';
import loader from '@grpc/proto-loader';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkgDef = loader.loadSync(__dirname + '/../shared/grpc-recipe.proto');
const recipe = grpc.loadPackageDefinition(pkgDef).recipe;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 4000;

const server = new grpc.Server();
server.addService(recipe.RecipeService.service, {

	getMetadata: (_call, cb) => {
		cb(null, {
			pid: process.pid
		})
	},
	getRecipe: (call, cb) => {
		if (call.request.id !== 42) {
			return cb(Error(`unknown recipe ${call.request.id}`));
		}
		cb(null, {
			id: 42, name: "Chicken Tikka Masala",
			steps: "Throw it in a pot...",
			ingredients: [
				{ id: 1, name: "Chicken", quantity: "1 lb", },
				{ id: 2, name: "Sauce", quantity: "2 cups", }
			]
		});
	},
});

// The HTTP routes associated with the two methods are based on the name of
// the service and the name of the methods. This means the getMetadata() method
// technically lives at the following URL:
// http://localhost:4000/recipe.RecipeService/GetMetadata

server.bindAsync(
	`${HOST}:${PORT}`,
	grpc.ServerCredentials.createInsecure(),
	(err, port) => {
		if (err) throw err;
		server.start();
		console.log(`Producer running at http://${HOST}:${port}/`);
	}
);