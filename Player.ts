import {Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {Saveable} from "./Saveable";
import {Database} from "./Database";
import {GameType} from "./Game";

export class Player implements Saveable {
    public id: string;
    public firstName: string;
    public lastName: string;
    public username: string;
    public stats: PlayerStats;

    constructor(id: string, firstName: string, lastName: string, username: string, stats: PlayerStats) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.stats = stats;
    }

    public getName(game: GameType) {
        const firstName = this.firstName ?? "Unknown";
        const lastName = this.lastName ?? "Unknown";
        if (game == GameType.Wallyball) return `${firstName} ${lastName.charAt(0)}`;
        return this.username ?? "Unknown";
    }

    public getElo(game: GameType) {
        if (game == GameType.CSGO) return this.stats.csgo.elo;
        if (game == GameType.Siege) return this.stats.siege.elo;
        if (game == GameType.Overwatch) return this.stats.overwatch.elo;
        if (game == GameType.Valorant) return this.stats.valorant.elo;
        if (game == GameType.Wallyball) return this.stats.wallyball.elo;
    }

    public setElo(game: GameType, elo: number) {
        if (game == GameType.CSGO) this.stats.csgo.elo = elo;
        if (game == GameType.Siege) this.stats.siege.elo = elo;
        if (game == GameType.Overwatch) this.stats.overwatch.elo = elo;
        if (game == GameType.Valorant) this.stats.valorant.elo = elo;
        if (game == GameType.Wallyball) this.stats.wallyball.elo = elo;
    }

    public getRank(game: GameType) {
        if (game == GameType.CSGO) return this.stats.csgo.rank;
        if (game == GameType.Siege) return this.stats.siege.rank;
        if (game == GameType.Overwatch) return this.stats.overwatch.rank;
        if (game == GameType.Valorant) return this.stats.valorant.rank;
        if (game == GameType.Wallyball) return this.stats.wallyball.rank;
    }

    public setRank(game: GameType, rank: number) {
        if (game == GameType.CSGO) this.stats.csgo.rank = rank;
        if (game == GameType.Siege) this.stats.siege.rank = rank;
        if (game == GameType.Overwatch) this.stats.overwatch.rank = rank;
        if (game == GameType.Valorant) this.stats.valorant.rank = rank;
        if (game == GameType.Wallyball) this.stats.wallyball.rank = rank;
    }

    public getWins(game: GameType) {
        if (game == GameType.CSGO) return this.stats.csgo.wins;
        if (game == GameType.Siege) return this.stats.siege.wins;
        if (game == GameType.Overwatch) return this.stats.overwatch.wins;
        if (game == GameType.Valorant) return this.stats.valorant.wins;
        if (game == GameType.Wallyball) return this.stats.wallyball.wins;
    }

    public setWins(game: GameType, wins: number) {
        if (game == GameType.CSGO) this.stats.csgo.wins = wins;
        if (game == GameType.Siege) this.stats.siege.wins = wins;
        if (game == GameType.Overwatch) this.stats.overwatch.wins = wins;
        if (game == GameType.Valorant) this.stats.valorant.wins = wins;
        if (game == GameType.Wallyball) this.stats.wallyball.wins = wins;
    }

    public getLosses(game: GameType) {
        if (game == GameType.CSGO) return this.stats.csgo.losses;
        if (game == GameType.Siege) return this.stats.siege.losses;
        if (game == GameType.Overwatch) return this.stats.overwatch.losses;
        if (game == GameType.Valorant) return this.stats.valorant.losses;
        if (game == GameType.Wallyball) return this.stats.wallyball.losses;
    }

    public setLosses(game: GameType, losses: number) {
        if (game == GameType.CSGO) this.stats.csgo.losses = losses;
        if (game == GameType.Siege) this.stats.siege.losses = losses;
        if (game == GameType.Overwatch) this.stats.overwatch.losses = losses;
        if (game == GameType.Valorant) this.stats.valorant.losses = losses;
        if (game == GameType.Wallyball) this.stats.wallyball.losses = losses;
    }

    public getPoints(game: GameType) {
        if (game == GameType.CSGO) return this.stats.csgo.points;
        if (game == GameType.Siege) return this.stats.siege.points;
        if (game == GameType.Overwatch) return this.stats.overwatch.points;
        if (game == GameType.Valorant) return this.stats.valorant.points;
        if (game == GameType.Wallyball) return this.stats.wallyball.points;
    }

    public setPoints(game: GameType, points: number) {
        if (game == GameType.CSGO) this.stats.csgo.points = points;
        if (game == GameType.Siege) this.stats.siege.points = points;
        if (game == GameType.Overwatch) this.stats.overwatch.points = points;
        if (game == GameType.Valorant) this.stats.valorant.points = points;
        if (game == GameType.Wallyball) this.stats.wallyball.points = points;
    }

    public getWinRate(game: GameType): number {
        const gamesWon = this.getWins(game);
        const totalGames = gamesWon + this.getLosses(game);
        return 100 * gamesWon / totalGames;
    }

    public getTotalGames(game: GameType): number {
        const wins = this.getWins(game);
        const losses = this.getLosses(game);
        return wins + losses;
    }

    public static fromObject(object): Player {
        if (!object) return null;
        const { id, firstName, lastName, username, stats} = object;
        return new Player(id, firstName, lastName, username, PlayerStats.fromObject(stats));
    }

    public async save() {
        const query: Filter<any> = {id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await Database.players.updateOne(query, update, options);
        return this;
    }

    public static async fetch(id: string): Promise<Player> {
        const query = {id: id};
        const document = await Database.players.findOne(query);
        if (!document) return null;
        return Player.fromObject(document);
    }
}

export class PlayerStats {
    public csgo: GameStats;
    public siege: GameStats;
    public overwatch: GameStats;
    public valorant: GameStats;
    public wallyball: GameStats;

    constructor(csgo: GameStats, siege: GameStats, overwatch: GameStats, valorant: GameStats, wallyball: GameStats) {
        this.csgo = csgo;
        this.siege = siege;
        this.overwatch = overwatch;
        this.valorant = valorant;
        this.wallyball = wallyball;
    }

    public static async newStats(): Promise<PlayerStats> {
        const totalPlayers = await Database.players.countDocuments();
        const csgoStats = new GameStats(400, totalPlayers + 1, 0, 0, 0);
        const siegeStats = new GameStats(400, totalPlayers + 1, 0, 0, 0);
        const overwatchStats = new GameStats(400, totalPlayers + 1, 0, 0, 0);
        const valorantStats = new GameStats(400, totalPlayers + 1, 0, 0, 0);
        const wallyballStats = new GameStats(400, totalPlayers + 1, 0, 0, 0);
        return new PlayerStats(csgoStats, siegeStats, overwatchStats, valorantStats, wallyballStats);
    }

    public static fromObject(object): PlayerStats {
        if (!object) return null;
        const { csgo, siege, overwatch, valorant, wallyball } = object;
        const csgoStats = GameStats.fromObject(csgo);
        const siegeStats = GameStats.fromObject(siege);
        const overwatchStats = GameStats.fromObject(overwatch);
        const valorantStats = GameStats.fromObject(valorant);
        const wallyballStats = GameStats.fromObject(wallyball);
        return new PlayerStats(csgoStats, siegeStats, overwatchStats, valorantStats, wallyballStats);
    }
}

export class GameStats {
    public elo: number;
    public rank: number;
    public wins: number;
    public losses: number;
    public points: number;

    constructor(elo: number, rank: number, wins: number, losses: number, points: number) {
        this.elo = elo;
        this.rank = rank;
        this.wins = wins;
        this.losses = losses;
        this.points = points;
    }

    public static fromObject(object) {
        if (!object) return null;
        const { elo, rank, wins, losses, points } = object;
        return new GameStats(elo, rank, wins, losses, points);
    }
}