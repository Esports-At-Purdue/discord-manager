import {Collection, MongoClient} from "mongodb";
import {LeaderboardImage} from "./images/Leaderboard.Image";
import * as config from "./config.json";
import {Application} from "./Application";
import {GameType} from "./Game";
import {Player} from "./Player";
import * as fs from "fs";

const connectionString = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.url}/?authMechanism=DEFAULT`;

export class Database {
    public static students: Collection;
    public static tickets: Collection;
    public static players: Collection;
    public static teams: Collection;
    public static games: Collection;
    public static episode = 1;

    public static async load(): Promise<void> {
        await new MongoClient(connectionString).connect().then((client) => {
            const database = client.db("Purdue");
            Database.students = database.collection("students");
            Database.tickets = database.collection("tickets");
            Database.players = database.collection("players");
            Database.teams = database.collection("teams");
            Database.games = database.collection("games");
        });
    }

    public static async updateRankings(game: GameType, application: Application) {
        const players = await Database.players.find({});
        let sortedPlayers;

        switch (game) {
            case GameType.CSGO: sortedPlayers = await players.sort({
                "stats.csgo.elo": -1,
                "stats.csgo.wins": 1,
                "stats.csgo.points": 1
            }).toArray();
                break;
            case GameType.Siege: sortedPlayers = await players.sort({
                "stats.siege.elo": -1,
                "stats.siege.wins": 1,
                "stats.siege.points": 1
            }).toArray();
                break;
            case GameType.Overwatch: sortedPlayers = await players.sort({
                "stats.overwatch.elo": -1,
                "stats.overwatch.wins": 1,
                "stats.overwatch.points": 1
            }).toArray();
                break;
            case GameType.Valorant: sortedPlayers = await players.sort({
                "stats.valorant.elo": -1,
                "stats.valorant.wins": 1,
                "stats.valorant.points": 1
            }).toArray();
                break;
            case GameType.Wallyball: sortedPlayers = await players.sort({
                "stats.wallyball.elo": -1,
                "stats.wallyball.wins": 1,
                "stats.wallyball.points": 1
            }).toArray();
        }

        const pages = Math.ceil(sortedPlayers.length / 5);

        for (let i = 0; i < sortedPlayers.length; i++) {
            const player = Player.fromObject(sortedPlayers[i]);
            player.setRank(game, i + 1);
            player.save().catch();
        }

        for (let i = 1; i <= pages; i++) {
            const leaderboardPlayers = sortedPlayers.slice(5 * (i - 1),5 * i);
            const leaderboard = await LeaderboardImage.build(leaderboardPlayers, game, application);
            const writeStream = fs.createWriteStream(`./media/${game}/leaderboards/${i}.png`);
            const pngStream = leaderboard.canvas.createPNGStream();
            pngStream.pipe(writeStream);
        }
    }
}