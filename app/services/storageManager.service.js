/*
    Twitch Data Exporter allows data export from Twitch API to analize.
    Copyright (C) 2021 Pablo Villaverde Castro

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://github.com/pvillaverde/twitch-data-exporter/blob/master/LICENSE>.
*/
const config = require('../config');
const moment = require('moment');
const PostgresqlService = require('./postgresql.service');
const FileDatabaseService = require('./fileDatabase.service');

class StorageManagerService {
	static init() {
		switch (config.storage) {
			case 'postgres':
				this.database = PostgresqlService;
				break;
		}
		return this.database.init();
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

	static async getMissingGames() {
		return this.database.getMissingGames();
	}

	handleError(error) {
		console.error(error);
		new FileDatabaseService('live-messages').put('last-error', moment());
	}
}

module.exports = StorageManagerService;
