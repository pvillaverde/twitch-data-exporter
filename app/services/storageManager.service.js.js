const { Pool, Client } = require('pg');
const config = require('../config');
const PostgresqlService = require('./postgresql.service');

class StorageManagerService {
	static init() {
		switch (config.storage) {
			case 'postgres':
				this.database = PostgresqlService;
				break;
		}
		this.database.init();
	}

	static async getUsers() {
		return this.database.test();
	}

	handleError(error) {
		console.error(error);
	}
}

module.exports = StorageManagerService;
