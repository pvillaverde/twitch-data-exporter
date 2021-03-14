const { Pool, Client } = require('pg');
const config = require('../config');
const fs = require('fs');
class PostgresqlService {
	static async init() {
		this.pool = new Pool({ connectionString: config.pgConnectionString });
		const initSQL = fs.readFileSync('app/data/postgresql-tables.sql').toString();
		await this.pool.query(initSQL);
		console.debug('[PostgresqlService]', 'Base de datos inicializada.');
	}
	static async test() {
		try {
			const { rows } = await this.pool.query('SELECT * FROM users');
			return rows;
		} catch (error) {
			this.handleError(error);
		}
	}

	handleError(error) {
		console.error(error);
	}
}

module.exports = PostgresqlService;
