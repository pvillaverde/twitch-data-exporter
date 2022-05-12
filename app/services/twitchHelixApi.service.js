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
const fs = require('fs');
const moment = require('moment');
const FileDatabaseService = require('./fileDatabase.service');
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
		new FileDatabaseService('live-messages').put('last-error', moment());
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
		const maxPerRequest = 100;
		const requestsChannels = channelNames.reduce((resultArray, item, index) => {
			const chunkIndex = Math.floor(index / maxPerRequest);
			if (!resultArray[chunkIndex]) {
				resultArray[chunkIndex] = []; // start a new chunk
			}
			resultArray[chunkIndex].push(item);
			return resultArray;
		}, []);
		const requests = requestsChannels.map((cNames) => axios.get(`/users?login=${cNames.join('&login=')}`, this.requestOptions));
		return axios
			.all(requests)
			.then(
				axios.spread((...responses) => {
					const channels = responses.reduce((array, item, index) => array.concat(item.data.data || []), []);
					return StorageManagerService.saveUsers(channels);
				})
			)
			.catch((errors) => {
				const err = errors[0] ? errors[0] : errors;
				if (err.response.status === 401) {
					return this.getAccessToken().then((token) => this.fetchUsers(channelNames));
				} else {
					this.handleError(err);
				}
			});
	}

	static fetchStreams(channelNames) {
		const maxPerRequest = 100;
		const requestsChannels = channelNames.reduce((resultArray, item, index) => {
			const chunkIndex = Math.floor(index / maxPerRequest);
			if (!resultArray[chunkIndex]) {
				resultArray[chunkIndex] = []; // start a new chunk
			}
			resultArray[chunkIndex].push(item);
			return resultArray;
		}, []);
		const requests = requestsChannels.map((cNames) => axios.get(`/streams?user_login=${cNames.join('&user_login=')}`, this.requestOptions));
		return axios
			.all(requests)
			.then(
				axios.spread((...responses) => {
					const streams = responses.reduce((array, item, index) => array.concat(item.data.data || []), []);
					return StorageManagerService.saveStreams(streams);
				})
			)
			.catch((errors) => {
				const err = errors[0] ? errors[0] : errors;
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
