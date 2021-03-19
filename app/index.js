const StorageManagerService = require('./services/storageManager.service');
const TwitchHelixApiService = require('./services/twitchHelixApi.service');
const GoogleSheetsApiService = require('./services/googleSheetsApi.service');
const CronService = require('./services/cron.service');
const fs = require('fs');
const config = require('./config.js');

function bootstrapApp() {
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
		StorageManagerService.init();
		CronService.init();
	}
}

bootstrapApp();
