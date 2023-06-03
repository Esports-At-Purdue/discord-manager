import {Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {Saveable} from "./Saveable";
import {Database} from "./Database";
import {Player} from "./Player";
import {GameType} from "./Game";
import {adjectives, animals, uniqueNamesGenerator} from "unique-names-generator";

export class Team implements Saveable {
    public id: string;
    public name: string;
    public channel: string;
    public players: string[];
    public wins: number;
    public losses: number;
    public points: number;

    constructor(id: string, name: string, channel: string, players: string[], wins: number, losses: number, points: number) {
        this.id = id;
        this.name = name;
        this.channel = channel;
        this.players = players;
        this.wins = wins;
        this.losses = losses;
        this.points = points;
    }

    public static fromObject(object): Team {
        if (!object) return null;
        const { id, name, channel, players, wins, losses, points} = object;
        return new Team(id, name, channel, players, wins, losses, points);
    }

    public getName(): string {
        return convertToTitleCase(this.name);
    }

    public static async generateName(): Promise<string> {
        let name = getRandomName()
        let teamWithName = await Database.teams.findOne({ name: name });
        while (teamWithName) {
            name = getRandomName()
            teamWithName = await Database.teams.findOne({ name: name });
        }
        return name;
    }

    public async getPlayers(): Promise<Player[]> {
        const playerPromises = this.players.map(async (playerId) => await Player.fetch(playerId));
        return await Promise.all(playerPromises);
    }

    public get captain() {
        return this.players[0];
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

function getRandomName() {
    return uniqueNamesGenerator({ dictionaries: [adjectives, animals], length: 2 }).concat("s");
}

function convertToTitleCase(input: string): string {
    const words = input.split(/[ _]/);
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
}

function convertToUnderscoreCase(input: string): string {
    const words = input.split(/[ _]/);
    const lowercaseWords = words.map(word => word.toLowerCase());
    return lowercaseWords.join('_');
}