const StorageManagerService = require('./services/storageManager.service.js');
const CronService = require('./services/cron.service');

function bootstrapApp() {
	console.log(' ');
	console.log(' ----------------------------------');
	console.log('|     Twitch Data Exporter         |');
	console.log(`|  Pablo Villaverde Castro © 2021  |`);
	console.log('|       clankirfed@gmail.com       |');
	console.log(' ----------------------------------');
	console.log(' ');
	StorageManagerService.init();
	CronService.init();
}

bootstrapApp();
