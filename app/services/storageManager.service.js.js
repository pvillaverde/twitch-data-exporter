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

	static async saveUsers(data) {
		return this.database.saveUsers(data);
	}

	static async saveStreams(data) {
		return this.database.saveStreams(data);
	}

	static async saveFollows(data) {
		return this.database.saveFollows(data);
	}
	static async removeFollows() {
		return this.database.removeFollows();
	}

	static async saveClips(data) {
		return this.database.saveClips(data);
	}

	static async saveGames(data) {
		return this.database.saveGames(data);
	}

	static async getUsers() {
		return this.database.test();
	}

	handleError(error) {
		console.error(error);
	}
}

module.exports = StorageManagerService;
