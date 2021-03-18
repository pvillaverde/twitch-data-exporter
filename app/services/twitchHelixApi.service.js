const config = require('../config');
const fs = require('fs');
const { default: axios } = require('axios');
const StorageManagerService = require('./storageManager.service.js');
class TwitchHelixApiService {
	static get tokenPath() {
		return 'app/security/twitchToken.json';
	}
	static get requestOptions() {
		// Automatically remove "oauth:" prefix if it's present
		const oauthPrefix = 'oauth:';
		let oauthBearer;
		try {
			oauthBearer = JSON.parse(fs.readFileSync(this.tokenPath)).access_token;
		} catch (error) {
			oauthBearer = 'noAuth';
		}
		if (oauthBearer.startsWith(oauthPrefix)) {
			oauthBearer = oauthBearer.substr(oauthPrefix.length);
		}
		// Construct default request options
		return {
			baseURL: 'https://api.twitch.tv/helix/',
			headers: {
				'Client-ID': config.twitch.clientId,
				Authorization: `Bearer ${oauthBearer}`,
			},
		};
	}

	static handleError(error) {
		console.error('[TwitchHelixApiService]', error);
		return;
	}

	static getAccessToken() {
		// https://dev.twitch.tv/docs/authentication/getting-tokens-oauth
		return axios
			.post(
				`https://id.twitch.tv/oauth2/token?client_id=${config.twitch.clientId}&client_secret=${config.twitch.clientSecret}&grant_type=client_credentials`
			)
			.then((res) => {
				fs.writeFileSync(this.tokenPath, JSON.stringify(res.data));
				return res.data;
			})
			.catch((err) => this.handleError(err));
	}

	static fetchUsers(channelNames) {
		return axios
			.get(`/users?login=${channelNames.join('&login=')}`, this.requestOptions)
			.then((res) => StorageManagerService.saveUsers(res.data.data || []))
			.catch((err) => {
				if (err.response.status === 401) {
					return this.getAccessToken().then((token) => this.fetchUsers(channelNames));
				} else {
					this.handleError(err);
				}
			});
	}

	static fetchStreams(channelNames) {
		return axios
			.get(`/streams?user_login=${channelNames.join('&user_login=')}`, this.requestOptions)
			.then((res) => StorageManagerService.saveStreams(res.data.data || []))
			.catch((err) => {
				if (err.response.status === 401) {
					return this.getAccessToken().then((token) => this.fetchStreams(channelNames));
				} else {
					this.handleError(err);
				}
			});
	}

	static fetchGames(gameIds) {
		return axios
			.get(`/games?id=${gameIds.join('&id=')}`, this.requestOptions)
			.then((res) => StorageManagerService.saveGames(res.data.data || []))
			.catch((err) => {
				if (err.response.status === 401) {
					return this.getAccessToken().then((token) => this.fetchGames(gameIds));
				} else {
					this.handleError(err);
				}
			});
	}

	static fetchFollows(channelId, cursor, follows) {
		// Xestionar pagination cursor
		const pagination = cursor ? `&after=${cursor}` : '';
		return axios
			.get(`/users/follows?to_id=${channelId}&first=100${pagination}`, this.requestOptions)
			.then((res) => {
				if (res.data.pagination.cursor) {
					return this.fetchFollows(channelId, res.data.pagination.cursor, (res.data.data || []).concat(follows || []));
				} else {
					return StorageManagerService.saveFollows((res.data.data || []).concat(follows || []));
				}
			})
			.catch((err) => {
				if (err.response.status === 401) {
					return this.getAccessToken().then((token) => this.fetchFollows(channelId));
				} else {
					this.handleError(err);
				}
			});
	}

	static fetchClips(broadcasterId, cursor, clips) {
		// Xestionar pagination cursor
		const pagination = cursor ? `&after=${cursor}` : '';
		return axios
			.get(`/clips?broadcaster_id=${broadcasterId}&first=100${pagination}`, this.requestOptions)
			.then((res) => {
				if (res.data.pagination.cursor) {
					return this.fetchClips(broadcasterId, res.data.pagination.cursor, (res.data.data || []).concat(clips || []));
				} else {
					return StorageManagerService.saveClips((res.data.data || []).concat(clips || []));
				}
			})
			.catch((err) => {
				if (err.response.status === 401) {
					return this.getAccessToken().then((token) => this.fetchClips(broadcasterId));
				} else {
					this.handleError(err);
				}
			});
	}
}

module.exports = TwitchHelixApiService;
