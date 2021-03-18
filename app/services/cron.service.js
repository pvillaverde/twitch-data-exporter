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
		cron.schedule('0 1 * * *', () => this.fetchUsers());
		cron.schedule('* * * * *', () => this.fetchStreams());
		cron.schedule('0 2 * * 0', () => this.fetchFollows());
	}
	static async getChannelNames() {
		let channels = config.twitch_channels ? config.twitch_channels.split(',') : null;

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
				throw console.warn('[CronService]', 'No channels configured');
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
			console.log('[CronService]', 'Actualizados usuarios');
		});
	}
	static async fetchStreams() {
		TwitchHelixApiService.fetchStreams(this.channelNames).then((streams) => {
			if (streams.length) console.log('[CronService]', 'Actualizados Streamings', streams.map((s) => s.user_name).join(','));
		});
	}
	static async fetchFollows() {
		await StorageManagerService.removeFollows();
		for (const id of this.channelIds) {
			await TwitchHelixApiService.fetchFollows(id);
		}
		console.log('[CronService]', 'Actualizados Follows');
	}
}

module.exports = CronService;