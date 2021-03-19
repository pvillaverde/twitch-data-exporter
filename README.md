# Twitch Data Exporter

[![GitHub license][license-shield]][license-url]


<!-- TABLE OF CONTENTS, generated with gh-md-toc README.md -->

Table of Contents
=================

   * [Twitch Data Exporter](#twitch-data-exporter)
      * [About The Project](#about-the-project)
         * [Built With](#built-with)
      * [Getting Started](#getting-started)
         * [Prerequisites](#prerequisites)
         * [Installation](#installation)
      * [Usage](#usage)
         * [Customizing refresh intervals](#customizing-refresh-intervals)
      * [Roadmap](#roadmap)
      * [Contributing](#contributing)
      * [Authors](#authors)
      * [Acknowledgements](#acknowledgements)
      * [License](#license)

<!-- ABOUT THE PROJECT -->

## About The Project

**Twitch data Exporter** is a small app that allows to export stats from certain channels and store them on your preferred storage method and analyze them later with other tools such as Grafana.

I came up with the idea of this project while streaming and contributing to the galician language streaming community on Twitch. We wanted to show how the community was growing and some major stats for all the channels so I decided to make a small app that would allow to export this data from Twitch API to any storage (PostgreSQL at first), and later use the data on other tools as Grafana to show the relevant stats.

It currently allows the storage of:

* Channels information and channel views & followers evolution.
* Channels clips with total views for each one.
* Channels streamings, with the viewers recorded each minute(or the time range you set)

The implemented storages as of now are the following: 

* [PostgreSQL](https://www.postgresql.org/)

Miss the one you wanted? [Request a feature][issues-url] or consider [contributing](#contributing) to the project!
### Built With

* [NodeJS](https://nodejs.org/es/)
* [Docker](https://www.docker.com/)


<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.

### Prerequisites

Project is build on node and uses many npm packages, You need to set up:
* [NodeJS](https://nodejs.org/es/): Follow the instructions on the webpage.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Setup your Twitch App and get your App ClientId & Client secret from [Twitch Developer Console](https://dev.twitch.tv/console/apps).
2. (Optional) Setup a Google Sheets App if you want to retrieve channels from a spreadsheed. Follow the [Node Quickstart Guide](https://developers.google.com/sheets/api/quickstart/nodejs) to download `credentials.json`.
2. Clone the repository
   ```sh
   git clone https://github.com/pvillaverde/twitch-data-exporter
   ```
3. Install NPM packages dependencies
   ```sh
   npm install
   ```
4. Copy `config_example.js` as `config.js` and enter your twitch API clientId & clientSecret, as well as the content of credentials.json on `google_credentials` if you want to use spreadsheets.
   ```JS
	twitch: {
		clientId: 'REQUIRED', // Twitch App ClientID
		clientSecret: 'REQUIRED', // Twitch APP ClientSecret
		channels: null, // null if using google spreadsheet
	},
	google_credentials: {/*credentials.json*/},
   ```
5. Setup the storage you want to use, by default postgres, and change the connectionString to match your database connection info.
   ```JS
	storage: 'postgres', // Which storage will be used
	storageConfig: {
		postgres: {
			connectionString: 'postgresql://username:password@server:port/database',
		}
	},
	```
6. Start the app by runing `npm start` or `node app/index.js` and follow the steps for google Api auth if you are using spreadsheets.
7. If you want to launch a docker, once you have all setup and ready, build the image and run it with:
   ```sh
   docker build -t pvillaverde/twitch-data-exporter .
   docker run --name twitch-data-exporter  -d pvillaverde/twitch-data-exporter
   ```

<!-- USAGE EXAMPLES -->

## Usage

As you have seen previously, you can choose how the app learns which channels to check from 2 options:
1. Defining the `twitch.channels` variable on `config.js` with an array of channels name, ex:// `[clankirfed,twitch_en_galego]`
2. Setting up Google Sheets API and specifying a Google Spreadsheet on `config.js`which shall have the channels names on the first column:
```JS
	google_spreadsheet: {
		id: '1AFbvk9SLOpOyST4VWG6IOkiMdclzExUPQrKUBuEUHKY', // Google Spreadsheet ID
		range: 'Canles!A2:A', // Sheet & Range
		headers: 'name', // Column Headers (Optional, only first one will be used)
	},
```

### Customizing refresh intervals
Lastly, you can choose when to retrieve each data on the `cron` option of `config.js`, by default it is setup like this:

```JS
// Minutes Hours DayOfMonth Month DayOfWeek
fetchUsers: '0 1 * * *', // User Channels and total views will be refreshed every day at 1AM
fetchClips: '0 2 * * *', // Channel Clips will be refreshed every day at 2AM
fetchGames: '0 3 * * *', // Missing Games from the database will be fetched every day at 3AM
fetchFollows: '0 4 * * *', // Channel followers will be refreshed every dat at 4AM
fetchStreams: '* * * * *', // Every minute will who's someone on stream and viewers count.
```

These intervals can be customized using the cron syntax:
```
  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )
```

<!-- ROADMAP -->

## Roadmap

Check out the [open issues][issues-url] page for a list of proposed features (and known issues).


<!-- CONTRIBUTING -->

## Contributing

If you want to add any missing feature or storage that feed your needs, go ahead! That's what make the open source community shines, by allowing us to grow and learn from each other creating amazing tools! Any contribution you make is **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Authors

Pablo Villaverde Castro - [@clankirfed](https://twitter.com/clankirfed)


<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements
* [Twitch API](https://dev.twitch.tv/docs/api/reference)
* [Google Sheets API](https://developers.google.com/sheets/api/quickstart/nodejs)
* [How to use Node Cron](https://www.digitalocean.com/community/tutorials/nodejs-cron-jobs-by-examples)
* [TOC Generator](https://github.com/ekalinin/github-markdown-toc)
* [Dockerizing NodeJs WebApp](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
* [Building Efficient NodeJS DockerFiles](http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/)


## License


[![GitHub license][license-shield]][license-url]

Distributed under the GNU GPL-v3 License. See `LICENSE` for more information.


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/badge/license-GNU%20GPL--v3-brightgreen
[license-url]: https://github.com/pvillaverde/twitch-data-exporter/blob/master/LICENSE
[project-url]: https://github.com/pvillaverde/twitch-data-exporter
[issues-url]: https://github.com/pvillaverde/twitch-data-exporter/issues