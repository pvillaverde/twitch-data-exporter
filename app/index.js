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
const StorageManagerService = require('./services/storageManager.service');
const TwitchHelixApiService = require('./services/twitchHelixApi.service');
const GoogleSheetsApiService = require('./services/googleSheetsApi.service');
const CronService = require('./services/cron.service');
const fs = require('fs');
const config = require('./config.js');

async function bootstrapApp() {
	console.log(' ');
	console.log(' ----------------------------------');
	console.log('|     Twitch Data Exporter         |');
	console.log(`|  Pablo Villaverde Castro © 2021  |`);
	console.log('|       clankirfed@gmail.com       |');
	console.log(' ----------------------------------');
	console.log(' ');
	if (!fs.existsSync(GoogleSheetsApiService.tokenPath)) {
		try {
			fs.mkdirSync(GoogleSheetsApiService.tokenPath.substring(0, GoogleSheetsApiService.tokenPath.lastIndexOf('/')));
		} catch (error) {}
		GoogleSheetsApiService.authorize();
	} else {
		await StorageManagerService.init();
		CronService.init();
	}
}

bootstrapApp();
