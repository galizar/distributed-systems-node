import cluster from 'cluster';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log(`master pid=${process.pid}`);

cluster.setupPrimary({
	exec: __dirname + '/producer-http-basic.js'
});
cluster.fork();
cluster.fork();

cluster
	.on('disconnect', (worker) => {
		console.log('disconnect', worker.id);
	})
	.on('exit', (worker, code, signal) => {
		console.log('exit', worker.id, code, signal);
		//cluster.fork(); // this makes workers difficult to kill. the only way of
										// killing them would be to kill the master
	})
	.on('listening', (worker, {address, port}) => {
		console.log('listening', worker.id, `${address}:${port}`);
	});
