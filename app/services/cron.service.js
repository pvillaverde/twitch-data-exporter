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
const cron = require('node-cron'); // https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples
const TwitchHelixApiService = require('./twitchHelixApi.service');
const GoogleSheetsApiService = require('./googleSheetsApi.service');
const StorageManagerService = require('./storageManager.service.js');

class CronService {
	static init() {
		this.channelNames = [];
		this.channelIds = [];
		this.fetchUsers();
		this.fetchGames();
		cron.schedule(config.cron.fetchUsers, () => this.fetchUsers());
		cron.schedule(config.cron.fetchClips, () => this.fetchClips());
		cron.schedule(config.cron.fetchGames, () => this.fetchGames());
		cron.schedule(config.cron.fetchFollows, () => this.fetchFollows());
		cron.schedule(config.cron.fetchStreams, () => this.fetchStreams());
	}
	static async getChannelNames() {
		let channels = config.twitch.channels ? config.twitch.channels.split(',') : null;

		if (channels && channels.length) {
			const channelNames = channels.map((channelName) => channelName.toLowerCase());
			return Promise.resolve(channelNames);
		}
		try {
			channels = await GoogleSheetsApiService.fetchData(config.google_spreadsheet);
			const channelNames = [];
			const headers = config.google_spreadsheet.headers.split(',');
			channels.forEach((channel) => {
				if (channel && channel[headers[0]]) {
					channelNames.push(channel[headers[0]].toLowerCase().replace('\r\n', '').replace('\r', '').replace('\n', ''));
				}
			});
			if (!channelNames.length) {
				throw console.warn(new Date().toISOString(), '[CronService]', 'No channels configured');
			}
			return channelNames;
		} catch (error) {
			console.error(error);
			return Promise.resolve(this.channelNames);
		}
	}
	static async fetchUsers() {
		this.channelNames = await this.getChannelNames();
		TwitchHelixApiService.fetchUsers(this.channelNames).then((users) => {
			this.channelIds = users.map((u) => u.id);
			console.log(new Date().toISOString(), '[CronService]', 'Actualizados usuarios');
		});
	}
	static async fetchStreams() {
		if(!this.channelNames.length) return;
		TwitchHelixApiService.fetchStreams(this.channelNames).then((streams) => {
			if (streams && streams.length)
				console.log(new Date().toISOString(), '[CronService]', 'Actualizados Streamings', streams.map((s) => s.user_name).join(','));
		});
	}
	static async fetchFollows() {
		await StorageManagerService.removeFollows();
		for (const id of this.channelIds) {
			await TwitchHelixApiService.fetchFollows(id);
		}
		console.log(new Date().toISOString(), '[CronService]', 'Actualizados Follows');
	}
	static async fetchClips() {
		for (const id of this.channelIds) {
			await TwitchHelixApiService.fetchClips(id);
		}
		console.log(new Date().toISOString(), '[CronService]', 'Actualizados Clips');
	}
	static async fetchGames() {
		const gameIds = (await StorageManagerService.getMissingGames()).map((g) => g.game_id);
		if (!gameIds.length) return;
		await TwitchHelixApiService.fetchGames(gameIds);
		console.log(new Date().toISOString(), '[CronService]', 'Actualizados Xogos');
	}
}

module.exports = CronService;
