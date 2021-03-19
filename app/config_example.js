module.exports = {
	storage: 'postgres', // Which storage will be used
	storageConfig: {
		postgres: {
			connectionString: 'postgresql://username:password@server:port/database',
		}
	},
	cron: {
		// Minutes Hours DayOfMonth Month DayOfWeek
		fetchUsers: '0 1 * * *', // When will the users data be refreshed
		fetchClips: '0 2 * * *', // When will the clips be refreshed
		fetchGames: '0 3 * * *', // When will the missing Games be refreshed
		fetchFollows: '0 4 * * *', // When will the channels followers be refreshed
		fetchStreams: '* * * * *', // When will the stream info be checked(This sould be every minute or /5)
	},
	twitch: {
		clientId: 'REQUIRED', // Twitch App ClientID
		clientSecret: 'REQUIRED', // Twitch APP ClientSecret
		channels: null, // null if using google spreadsheet
	},
	google_spreadsheet: {
		id: '1AFbvk9SLOpOyST4VWG6IOkiMdclzExUPQrKUBuEUHKY', // Google Spreadsheet ID
		range: 'Canles!A2:A', // Sheet & Range
		headers: 'name', // Column Headers (Optional, only first one will be used)
	},
	google_credentials: {/*credentials.json*/},
};
