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
    public static episodeNames: Map<number, string> = new Map([
        [1, "First Spike"],
        [2, "Ace Avenue"],
        [3, "Match Point"],
        [4, "Power Play"],
        [5, "Court Chaos"],
        [6, "Dig Deep"],
        [7, "Top Spin"],
        [8, "Serve and Volley"],
        [9, "Championship Drive"]
    ])

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

    public static async getPlayersThatHavePlayedGame(game: GameType): Promise<Player[]> {
        const documents = await Database.players
            .find({
                $or: [
                    { [`stats.${game}.wins`]: { $gt: 0 } },
                    { [`stats.${game}.losses`]: { $gt: 0 } }
                ]
            })
            .map(
                document => Player.fromObject(document)
            );
        return await documents.toArray();
    }

    public static async getPlayersThatHavePlayedGameSorted(game: GameType): Promise<Player[]> {
        const documents = await Database.players
            .find({
                $or: [
                    {[`stats.${game}.wins`]: {$gt: 0}},
                    {[`stats.${game}.losses`]: {$gt: 0}}
                ]
            })
            .sort({
                [`stats.${game}.elo`] : -1,
                [`stats.${game}.wins`] : 1,
                [`stats.${game}.points`] : 1
            })
            .map(
                document => Player.fromObject(document)
            );

        return await documents.toArray();
    }

    public static async getTotalPlayers(game: GameType): Promise<number> {
        const players = await Database.getPlayersThatHavePlayedGame(game);
        return players.length;
    }

    public static async updateRankings(game: GameType, application: Application) {
        const players = await Database.getPlayersThatHavePlayedGameSorted(game);

        const pages = Math.ceil(players.length / 5);

        for (let i = 0; i < players.length; i++) {
            const player = Player.fromObject(players[i]);
            player.setRank(game, i + 1);
            await player.save();
        }

        for (let i = 1; i <= pages; i++) {
            const leaderboardPlayers = players.slice(5 * (i - 1),5 * i);
            const leaderboard = await LeaderboardImage.build(leaderboardPlayers, game, application);
            const writeStream = fs.createWriteStream(`../../media/leaderboards/${game}/${i}.png`);
            const pngStream = leaderboard.canvas.createPNGStream();
            pngStream.pipe(writeStream);
        }
    }
}