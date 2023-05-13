import {Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {Saveable} from "./Saveable";
import {Database} from "./Database";
import {Player} from "./Player";
import {Team} from "./Team";
import {Queue} from "./Queue";
import {CategoryChannel, ChannelType} from "discord.js";

export class Game implements Saveable {
    public id: string;
    public channel: string;
    public teamOne: string;
    public teamTwo: string;
    public players: string[];
    public game: GameType;
    public outcome: GameOutcome;
    public map: GameMap;

    constructor(id: string, channel: string, teamOne: string, teamTwo: string, players: string[], game: GameType, outcome: GameOutcome, map) {
        this.id = id;
        this.channel = channel;
        this.teamOne = teamOne;
        this.teamTwo = teamTwo;
        this.players = players;
        this.game = game;
        this.outcome = outcome;
        this.map = map;
    }

    public static fromObject(object): Game {
        if (!object) return null;
        const { id, channel, teamOne, teamTwo, players, game, outcome, map } = object;
        return new Game(id, channel, teamOne, teamTwo, players, game as GameType, outcome as GameOutcome, map as GameMap);
    }

    public async mentions(): Promise<string> {
        const players = await this.getPlayers();
        const mentions = players.map((player) => `<@${player.id}>`);
        return mentions.join(' ');
    }

    public async getTeamOne() {
        return await Team.fetch(this.teamOne);
    }

    public async getTeamTwo() {
        return await Team.fetch(this.teamTwo);
    }

    public async getPlayers(): Promise<Player[]> {
        const playerPromises = this.players.map((playerId) => Player.fetch(playerId));
        return await Promise.all(playerPromises);
    }

    public async getUnpickedPlayers(): Promise<Player[]> {
        const players = await this.getPlayers();
        const teamOne = await Team.fetch(this.teamOne);
        const teamTwo = await Team.fetch(this.teamTwo);

        return players.filter((player) => {
            return !teamOne.players.includes(player.id) && !teamTwo.players.includes(player.id);
        });
    }

    public async save() {
        const query: Filter<any> = {id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await Database.games.updateOne(query, update, options);
        return this;
    }

    public static async fetch(id: string): Promise<Game> {
        const query = {id: id};
        const document = await Database.games.findOne(query);
        if (!document) return null;
        return Game.fromObject(document);
    }

    public static async startQueueBasedGame(queue: Queue, category: CategoryChannel): Promise<Game> {
        const playerIds = [];
        const unsortedPlayers = await queue.getPlayers();
        const sortedPlayers = unsortedPlayers.sort((a, b) => b.getElo(queue.game) - a.getElo(queue.game));
        for (const player of sortedPlayers) playerIds.push(player.id);

        const id = String(await Database.games.countDocuments() + 1);
        const channel = await category.children.create({name: `game-${id}`, type: ChannelType.GuildText});
        const totalTeams = await Database.teams.countDocuments();
        const teamOne = await new Team(String(totalTeams + 1), null, [playerIds[0]], 0, 0, 0).save();
        const teamTwo = await new Team(String(totalTeams + 2), null, [playerIds[1]], 0, 0, 0).save();
        const maps = Game.getMaps(queue.game);
        const map = maps[Math.floor(Math.random() * maps.length)];

        return new Game(id, channel.id, teamOne.id, teamTwo.id, playerIds, queue.game, GameOutcome.InProgress, map).save();
    }

    public static getMaps(game: GameType): GameMap[] {
        if (game == GameType.CSGO) {
            return [
                GameMap.Inferno,
                GameMap.Mirage,
                GameMap.Nuke,
                GameMap.Overpass,
                GameMap.Vertigo,
                GameMap.Ancient,
                GameMap.Anubis,
                GameMap.DustII,
                GameMap.Train,
                GameMap.Cache
            ];
        }
        if (game == GameType.Siege) {
            return [
                GameMap.NighthavenLabs,
                GameMap.Stadium,
                GameMap.EmeraldPlains,
                GameMap.Bank,
                GameMap.Border,
                GameMap.Chalet,
                GameMap.Clubhouse,
                GameMap.Coastline,
                GameMap.Consulate,
                GameMap.Favela,
                GameMap.Fortress,
                GameMap.HerefordBase,
                GameMap.House,
                GameMap.KafeDostoyevsky,
                GameMap.Kanal,
                GameMap.Oregon,
                GameMap.Outback,
                GameMap.Outback,
                GameMap.PresidentialPlane,
                GameMap.Skyscraper,
                GameMap.ThemePark,
                GameMap.Tower,
                GameMap.Villa,
                GameMap.Yacht
            ]
        }
        if (game == GameType.Wallyball) {
            return [
                GameMap.RacquetballCourt
            ]
        }
        if (game == GameType.Valorant) {
            return [
                GameMap.Lotus,
                GameMap.Pearl,
                GameMap.Fracture,
                GameMap.Breeze,
                GameMap.Icebox,
                GameMap.Bind,
                GameMap.Haven,
                GameMap.Split,
                GameMap.Ascent
            ]
        }
        if (game == GameType.Overwatch) {
            return [
                GameMap.Busan,
                GameMap.Ilios,
                GameMap.LijiangTower,
                GameMap.Nepal,
                GameMap.Oasis,
                GameMap.AntarcticaPeninsula,
                GameMap.CircuitRoyal,
                GameMap.Dorado,
                GameMap.Havana,
                GameMap.Junkertown,
                GameMap.Rialto,
                GameMap.Route66,
                GameMap.ShambaliMonastery,
                GameMap.WatchpointGibraltar,
                GameMap.BlizzardWorld,
                GameMap.Eichenwalde,
                GameMap.Hollywood ,
                GameMap.KingsRow,
                GameMap.Midtown,
                GameMap.Numbani,
                GameMap.Paraiso,
                GameMap.Colosseo,
                GameMap.Esperanca,
                GameMap.NewQueenStreet
            ]
        }
    }

    public static getMapFileName(map: GameMap): string {
        // Remove apostrophes and colons
        const removedApostrophes = map.replace(/[':]/g, '');

        // Convert to lowercase and replace spaces with dashes
        return removedApostrophes.toLowerCase().replace(/\s/g, '-');
    }
}

export enum GameType {
    CSGO = "csgo",
    Siege = "siege",
    Overwatch = "overwatch",
    Valorant = "valorant",
    Wallyball = "wallyball"
}

export enum GameOutcome {
    InProgress = 0,
    Draw = 1,
    TeamOneWin = 2,
    TeamTwoWin = 3,
}

export enum GameMap {
    NighthavenLabs = "Nighthaven Labs",
    Stadium = "Stadium",
    EmeraldPlains = "Emerald Plains",
    Bank = "Bank",
    Border = "Border",
    Chalet = "Chalet",
    Clubhouse = "Clubhouse",
    Coastline = "Coastline",
    Consulate = "Consulate",
    Favela = "Favela",
    Fortress = "Fortress",
    HerefordBase = "Hereford Base",
    House = "House",
    KafeDostoyevsky = "Kafe Dostoyevsky",
    Kanal = "Kanal",
    Oregon = "Oregon",
    Outback = "Outback",
    PresidentialPlane = "Presidential Plane",
    Skyscraper = "Skyscraper",
    ThemePark = "Theme Park",
    Tower = "Tower",
    Villa = "Villa",
    Yacht = "Yacht",
    RacquetballCourt = "Racquetball Court",
    Lotus = "Lotus",
    Pearl = "Pearl",
    Fracture = "Fracture",
    Breeze = "Breeze",
    Icebox = "Icebox",
    Bind = "Bind",
    Haven = "Haven",
    Split = "Split",
    Ascent = "Ascent",
    Inferno = "Inferno",
    Mirage = "Mirage",
    Nuke = "Nuke",
    Overpass = "Overpass",
    Vertigo = "Vertigo",
    Ancient = "Ancient",
    Anubis = "Anubis",
    DustII = "Dust II",
    Train = "Train",
    Cache = "Cache",
    Busan = "Busan",
    Ilios = "Ilios",
    LijiangTower = "Lijiang Tower",
    Nepal = "Nepal",
    Oasis = "Oasis",
    AntarcticaPeninsula = "Antarctic Peninsula",
    CircuitRoyal = "Circuit Royal",
    Dorado = "Dorado",
    Havana = "Havana",
    Junkertown = "Junkertown",
    Rialto = "Rialto",
    Route66 = "Route 66",
    ShambaliMonastery = "Shambali Monastery",
    WatchpointGibraltar = "Watchpoint: Gibraltar",
    BlizzardWorld = "Blizzard World",
    Eichenwalde = "Eichenwalde",
    Hollywood = "Hollywood",
    KingsRow = "King's Row",
    Midtown = "Midtown",
    Numbani = "Numbani",
    Paraiso = "Paraiso",
    Colosseo = "Colosseo",
    Esperanca = "Esperanca",
    NewQueenStreet = "New Queen Street"
}