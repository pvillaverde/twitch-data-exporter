const config = require('../config');
const fs = require('fs');
class TwitchHelixApiService {
	static async init() {
		this.pool = new Pool({ connectionString: config.pgConnectionString });
		const initSQL = fs.readFileSync('app/data/postgresql-tables.sql').toString();
		await this.pool.query(initSQL);
		console.debug('[TwitchHelixApiService]', 'Base de datos inicializada.');
	}
	

	handleError(error) {
		console.error(error);
	}
}

module.exports = TwitchHelixApiService;
