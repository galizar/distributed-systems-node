import pg from 'pg';
import { EventEmitter } from 'events';

const { Client } = pg;

class DatabaseReconnection extends EventEmitter {

	// notice the use of private (#) properties
	#client = null; // pg Client
	#conn = null;   // database connection needs to be stored because new
									// connections will be created with it
	#kill = false;

	connected = false;
	constructor(conn) {
		super();
		this.#conn = conn;
	}

	connect() {
		if (this.#client) this.#client.end(); // terminate any existing connections
		if (this.kill) return;
		const client = new Client(this.#conn);
		client.on('error', (err) => this.emit('error', err));

		client.once('end', () => { // attempt to reconnect when a connection ends
			if (this.connected) this.emit('disconnect');
			this.connected = false;
			if (this.kill) return;
			setTimeout(() => this.connect(), this.#conn.retry || 1_000);
		});

		client.connect((err) => {
			this.connected = !err;
			if (!err) this.emit('connect');
		});
		this.#client = client;
		this.emit('reconnect');
	}

	async query(q, p) {
		if (this.#kill || !this.connected) throw new Error('disconnected');
		return this.#client.query(q, p);
	}

	disconnect() {
		this.#kill = true;
		this.#client.end();
	}
}

export default DatabaseReconnection;
