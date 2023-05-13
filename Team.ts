import {Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {Saveable} from "./Saveable";
import {Database} from "./Database";
import {Player} from "./Player";
import {GameType} from "./Game";

export class Team implements Saveable {
    public id: string;
    public channel: string;
    public players: string[];
    public wins: number;
    public losses: number;
    public points: number;

    constructor(id: string, channel: string, players: string[], wins: number, losses: number, points: number) {
        this.id = id;
        this.channel = channel;
        this.players = players;
        this.wins = wins;
        this.losses = losses;
        this.points = points;
    }

    public static fromObject(object): Team {
        if (!object) return null;
        const { id, channel, players, wins, losses, points} = object;
        return new Team(id, channel, players, wins, losses, points);
    }

    public async getPlayers(): Promise<Player[]> {
        const playerPromises = this.players.map(async (playerId) => await Player.fetch(playerId));
        return await Promise.all(playerPromises);
    }

    public async getAverageElo(game: GameType): Promise<number> {
        const players = await this.getPlayers();
        let totalElo = 0;
        for (const player of players) {
            totalElo += player.getElo(game);
        }
        return totalElo / players.length;
    }

    public async save() {
        const query: Filter<any> = {id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await Database.teams.updateOne(query, update, options);
        return this;
    }

    public static async fetch(id: string): Promise<Team> {
        const query = {id: id};
        const document = await Database.teams.findOne(query);
        if (!document) return null;
        return Team.fromObject(document);
    }
}