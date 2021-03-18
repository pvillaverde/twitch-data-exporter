const { Pool, Client } = require('pg'); // https://node-postgres.com/
const config = require('../config');
const fs = require('fs');
class PostgresqlService {
	static async init() {
		const connectionString = config.storageConfig[config.storage].connectionString;
		this.pool = new Pool({ connectionString });
		const initSQL = fs.readFileSync('app/data/postgresql-tables.sql').toString();
		await this.pool.query(initSQL);
		console.debug('[PostgresqlService]', 'Base de datos inicializada.');
	}

	static async saveUsers(users) {
		for (const user of users) {
			const insertChannelQuery = `INSERT INTO channel
				(id,login,display_name,type,broadcaster_type,description,profile_image_url,offline_image_url,view_count,created_at) 
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
				ON CONFLICT (id) DO UPDATE SET broadcaster_type=$5,view_count=$9,profile_image_url=$7,offline_image_url=$8`;
			const insertChannelViewsQuery = `INSERT INTO channel_views(channel_id,views,datetime) VALUES ($1,$2,$3)`;

			await this.pool.query(insertChannelQuery, [
				user.id, // $1
				user.login, // $2
				user.display_name, // $3
				user.type, // $4
				user.broadcaster_type, // $5
				user.description, // $6
				user.profile_image_url, // $7
				user.offline_image_url, // $8
				user.view_count, // $9
				user.created_at, // $10
			]);
			await this.pool.query(insertChannelViewsQuery, [user.id, user.view_count, new Date().toISOString()]);
		}
		return users;
	}

	static async saveStreams(streams) {
		for (const stream of streams) {
			const insertStreamQuery = `INSERT INTO stream
				(id,user_id,user_login,user_name,game_id,game_name,title,viewer_count,started_at,ended_at,language) 
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
				ON CONFLICT (id) DO UPDATE SET game_id=$5,game_name=$6,viewer_count=$8,ended_at=$10`;
			const insertStreamViewsQuery = `INSERT INTO stream_views(stream_id,viewer_count,datetime) VALUES ($1,$2,$3)`;
			await this.pool.query(insertStreamQuery, [
				stream.id, // $1
				stream.user_id, // $2
				stream.user_login, // $3
				stream.user_name, // $4
				stream.game_id, // $5
				stream.game_name, // $6
				stream.title, // $7
				stream.viewer_count, // $8
				stream.started_at, // $9
				new Date().toISOString(), // $10
				stream.language, // $11
			]);
			await this.pool.query(insertStreamViewsQuery, [stream.id, stream.viewer_count, new Date().toISOString()]);
		}
		return streams;
	}

	static async saveFollows(follows) {
		for (const follow of follows) {
			const insertStreamQuery = `INSERT INTO channel_follows
				(from_id,from_login,from_name,to_id,to_login,to_name,followed_at) 
				VALUES ($1,$2,$3,$4,$5,$6,$7)
				ON CONFLICT (from_id,to_id) DO NOTHING`;
			await this.pool.query(insertStreamQuery, [
				follow.from_id, // $1
				follow.from_login, // $2
				follow.from_name, // $3
				follow.to_id, // $4
				follow.to_login, // $5
				follow.to_name, // $6
				follow.followed_at, // $7
			]);
		}
		return follows;
	}

	static async removeFollows() {
		return await this.pool.query('DELETE FROM channel_follows');
	}

	static async saveClips(clips) {
		for (const clip of clips) {
			const insertStreamQuery = `INSERT INTO clip
				(id,url,embed_url,broadcaster_id,broadcaster_name,creator_id,creator_name,game_id,language,title,view_count,created_at,thumbnail_url) 
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
				ON CONFLICT (id) DO UPDATE SET view_count=$11`;
			await this.pool.query(insertStreamQuery, [
				clip.id, // $1
				clip.url, // $2
				clip.embed_url, // $3
				clip.broadcaster_id, // $4
				clip.broadcaster_name, // $5
				clip.creator_id, // $6
				clip.creator_name, // $7
				clip.game_id, // $8
				clip.language, // $9
				clip.title, // $10
				clip.view_count, // $11
				clip.created_at, // $12
				clip.thumbnail_url, // $13
			]);
		}
		return clips;
	}

	static async saveGames(games) {
		for (const game of games) {
			const insertStreamQuery = `INSERT INTO game
				(id,name,box_art_url) 
				VALUES ($1,$2,$3)
				ON CONFLICT (id) DO NOTHING`;
			await this.pool.query(insertStreamQuery, [
				game.id, // $1
				game.name, // $2
				game.box_art_url, // $3
			]);
		}
		return games;
	}
	static async getMissingGames() {
		return (
			await this.pool.query(
				'SELECT * FROM (select game_id from stream UNION SELECT game_id from clip) a WHERE game_id NOT IN (SELECT id from game) AND LENGTH(game_id) > 0 LIMIT 100'
			)
		).rows;
	}

	handleError(error) {
		console.error(error);
	}
}

module.exports = PostgresqlService;
