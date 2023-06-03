import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    ColorResolvable,
    Colors,
    Message,
    MessageCollector,
    TextChannel
} from "discord.js";
import * as fs from "fs";
import {QueueEmbed} from "./embeds/Queue.Embed";
import {Player} from "./Player";
import {GameType} from "./Game";
import {QueueRow} from "./components/Queue.Row";

export class Queue {
    public timer: number;
    public capacity: number;
    public messageLimit: boolean;
    public verbose: boolean;
    public game: GameType;
    public draft: DraftFormat;
    public queue: Map<string, NodeJS.Timeout>;
    public channel: TextChannel;
    public message: Message;

    constructor(timer: number, capacity: number, verbose: boolean, game: GameType, draft: DraftFormat, queue: Map<string, NodeJS.Timeout>) {
        this.timer = timer;
        this.capacity = capacity;
        this.game = game;
        this.draft = draft;
        this.queue = queue;
        this.messageLimit = true;
        this.verbose = verbose;
    }

    public async load(channel: TextChannel) {
        this.channel = channel;
        if (this.verbose) await this.update(`A new Queue has started.`, Colors.Aqua);
    }

    public async getPlayers(): Promise<Player[]> {
        const playerIds = Array.from(this.queue.keys());
        const playerPromises = playerIds.map(async (playerId) => await Player.fetch(playerId));
        return await Promise.all(playerPromises);
    }

    public async join(message: string, players: Player[], interaction: ButtonInteraction | ChatInputCommandInteraction) {
        for (const player of players) {
            const timeout = global.setTimeout(Queue.timeout, this.timer, this, player, interaction);
            this.queue.set(player.id, timeout);
        }
        if (this.verbose) await this.update(message, Colors.DarkGreen);
    }

    public async leave(message: string, players: Player[]) {
        for (const player of players) {
            clearTimeout(this.queue.get(player.id));
            this.queue.delete(player.id);
        }
        if (this.verbose) await this.update(message, Colors.DarkOrange);
    }

    public async bump(player: Player) {
        if (this.verbose) await this.update(`The current queue:`, Colors.Aqua);
    }

    public static async timeout(queue: Queue, player: Player, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        clearTimeout(queue.queue.get(player.id));
        queue.queue.delete(player.id);
        const message = await interaction.channel.send({content: `<@${player.id}>, you have been timed out of the queue.`});
        setTimeout(() => message.delete(), 5 * 60 * 1000);
        queue.update(`${player.getName(queue.game)} has been timed out.`, Colors.DarkOrange).catch();
    }

    public static async fetchLastMessage(channel: TextChannel, id: string): Promise<Message> {
        try {
            return await channel.messages.fetch(id);
        } catch {
            return null;
        }
    }

    public async update(message: string, color: ColorResolvable) {
        const players = await this.getPlayers();
        const embed = new QueueEmbed(message, players, this.capacity, this.game, color);
        const row = new QueueRow();
        const json = JSON.parse(fs.readFileSync("./queue.json").toString());
        const lastMessage = await Queue.fetchLastMessage(this.channel, json.id);

        if (this.messageLimit || !lastMessage) {
            const newMessage = await this.channel.send({embeds: [embed], components: [row]});
            fs.writeFileSync("./queue.json", JSON.stringify({id: newMessage.id}, null, 2));
            const filter = (message) => !message.author.bot;
            new MessageCollector(this.channel, {max: 5, filter: filter}).on('end', () => { this.messageLimit = true });
            this.messageLimit = false;
            if (!lastMessage || !lastMessage.deletable) return;
            await lastMessage.delete();
        } else {
            await lastMessage.edit({embeds: [embed], components: [row]});
        }
    }
}

export enum DraftFormat {
    Linear,
    Auto
}