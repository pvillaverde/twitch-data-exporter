const config = require('./config');
const cron = require('node-cron');
const StorageManagerService = require('./services/storageManager.service.js');

function bootstrapApp() {
	console.log(' ');
	console.log(' ----------------------------------');
	console.log('|     Twitch Data Exporter         |');
	console.log(`|  Pablo Villaverde Castro © 2021  |`);
	console.log('|       clankirfed@gmail.com       |');
	console.log(' ----------------------------------');
	console.log(' ');
	StorageManagerService.init();

	cron.schedule('* * * * *', function () {
		console.log('running a task every minute');
		StorageManagerService.getUsers().then((users) => console.log(users[0]));
	});
}

bootstrapApp();
