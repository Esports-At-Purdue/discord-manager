import {Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {Saveable} from "./Saveable";
import {Database} from "./Database";
import {Player} from "./Player";
import {Team} from "./Team";
import {AttachmentBuilder, CategoryChannel, ChannelType, Guild, TextChannel} from "discord.js";
import {GameEmbed} from "./embeds/Game.Embed";
import {GameRow} from "./components/Game.Row";

export class Game implements Saveable {
    public id: string;
    public channel: string;
    public teamOne: string;
    public teamTwo: string;
    public players: string[];
    public type: GameType;
    public outcome: GameOutcome;
    public map: GameMap;

    constructor(id: string, channel: string, teamOne: string, teamTwo: string, players: string[], game: GameType, outcome: GameOutcome, map) {
        this.id = id;
        this.channel = channel;
        this.teamOne = teamOne;
        this.teamTwo = teamTwo;
        this.players = players;
        this.type = game;
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

    public async start(channel: TextChannel) {
        const mentions = await this.mentions();
        const teamOne = await this.getTeamOne();
        const teamTwo = await this.getTeamTwo();

        const gameEmbed = await GameEmbed.build(this, teamOne, teamTwo);
        const mapFilePath = Game.getMapFilePath(this.map, this.type);
        const attachment = new AttachmentBuilder(mapFilePath, { name: "map.jpg" });
        const teamOneVoice = await channel.parent.children.create({ name: `${teamOne.getName()}`, type: ChannelType.GuildVoice});
        const teamTwoVoice = await channel.parent.children.create({ name: `${teamTwo.getName()}`, type: ChannelType.GuildVoice});

        for (const id of teamOne.players) {
            const member = await channel.guild.members.fetch(id);
            try { await member.voice.setChannel(teamOneVoice) } catch {}
        }

        for (const id of teamTwo.players) {
            const member = await channel.guild.members.fetch(id);
            try { await member.voice.setChannel(teamTwoVoice) } catch {}
        }

        teamOne.channel = teamOneVoice.id;
        teamTwo.channel = teamTwoVoice.id;
        await teamOne.save();
        await teamTwo.save();

        await channel.send({content: mentions, embeds: [gameEmbed], files: [attachment]});
    }

    public async end(guild: Guild, teamOneScore: number, teamTwoScore: number, result: GameOutcome) {
        const teamOne = await Team.fetch(this.teamOne);
        const teamTwo = await Team.fetch(this.teamTwo);


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

    public static async fetchByChannel(channelId: string): Promise<Game> {
        const query = { channel: channelId };
        const document = await Database.games.findOne(query);
        if (!document) return null;
        return Game.fromObject(document);
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

    public static getMapFilePath(map: GameMap, game: GameType): string {

        const path = `../../media/${game}/maps/`;

        // Remove apostrophes and colons
        const removedApostrophes = map.replace(/[':]/g, '');

        // Convert to lowercase and replace spaces with dashes
        return path.concat(removedApostrophes.toLowerCase().replace(/\s/g, '-')).concat(".jpg");
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

export enum GameRank {
    Copper1 = "copper-1",
    Copper2 = "copper-2",
    Copper3 = "copper-3",
    Copper4 = "copper-4",
    Copper5 = "copper-5",
    Bronze1 = "bronze-1",
    Bronze2 = "bronze-2",
    Bronze3 = "bronze-3",
    Bronze4 = "bronze-4",
    Bronze5 = "bronze-5",
    Silver1 = "silver-1",
    Silver2 = "silver-2",
    Silver3 = "silver-3",
    Silver4 = "silver-4",
    Silver5 = "silver-5",
    Gold1 = "gold-1",
    Gold2 = "gold-2",
    Gold3 = "gold-3",
    Gold4 = "gold-4",
    Gold5 = "gold-5",
    Platinum1 = "platinum-1",
    Platinum2 = "platinum-2",
    Platinum3 = "platinum-3",
    Platinum4 = "platinum-4",
    Platinum5 = "platinum-5",
    Diamond1 = "diamond-1",
    Diamond2 = "diamond-2",
    Diamond3 = "diamond-3",
    Diamond4 = "diamond-4",
    Diamond5 = "diamond-5",
    Emerald1 = "emerald-1",
    Emerald2 = "emerald-2",
    Emerald3 = "emerald-3",
    Emerald4 = "emerald-4",
    Emerald5 = "emerald-5",
}