import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    ColorResolvable,
    Colors,
    Message,
    TextBasedChannel
} from "discord.js";
import * as fs from "fs";
import {QueueEmbed} from "./embeds/Queue.Embed";
import {Player} from "./Player";
import {GameType} from "./Game";
import {QueueRow} from "./components/Queue.Row";

export class Queue {
    public timer: number;
    public capacity: number;
    public game: GameType;
    public queue: Map<string, NodeJS.Timeout>;
    public channel: TextBasedChannel;
    public message: Message;

    constructor(timer: number, capacity: number, game: GameType, queue: Map<string, NodeJS.Timeout>) {
        this.timer = timer;
        this.capacity = capacity;
        this.game = game;
        this.queue = queue;
    }

    public async load(channel: TextBasedChannel) {
        this.channel = channel;
        this.update(`A new Queue has started.`, Colors.Aqua).catch();
    }

    public async getPlayers(): Promise<Player[]> {
        const playerIds = Array.from(this.queue.keys());
        const playerPromises = playerIds.map(async (playerId) => await Player.fetch(playerId));
        return await Promise.all(playerPromises);
    }

    public join(player: Player, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        const timeout = global.setTimeout(Queue.timeout, this.timer, this, player, interaction);
        this.queue.set(player.id, timeout);
        this.update(`${player.getName(this.game)} has joined`, Colors.DarkGreen).catch();
    }

    public leave(player: Player) {
        clearTimeout(this.queue.get(player.id));
        this.queue.delete(player.id);
        this.update(`${player.getName(this.game)} has left`, Colors.DarkOrange).catch();
    }

    public bump(player: Player) {
        this.update(`${player.getName(this.game)} bumped the queue`, Colors.Aqua).catch();
    }

    public static async timeout(queue: Queue, player: Player, interaction: ButtonInteraction | ChatInputCommandInteraction) {
        clearTimeout(queue.queue.get(player.id));
        queue.queue.delete(player.id);
        if (interaction instanceof ButtonInteraction) interaction.followUp({content: `<@${player.id}, you have been timed out of the queue`, ephemeral: true}).catch();
    }

    public static async fetchLastMessage(channel: TextBasedChannel, id: string): Promise<Message> {
        try {
            return await channel.messages.fetch(id);
        } catch {
            return null;
        }
    }

    public async update(message: string, color: ColorResolvable) {
        const players = await this.getPlayers();
        const embed = new QueueEmbed(message, players);
        const row = new QueueRow();
        const json = JSON.parse(fs.readFileSync("./queue.json").toString());
        const lastMessage = await Queue.fetchLastMessage(this.channel, json.id);
        const newMessage = await this.channel.send({embeds: [embed], components: [row]});
        fs.writeFileSync("./queue.json", JSON.stringify({id: newMessage.id}, null, 2));
        if (!lastMessage || !lastMessage.deletable) return;
        lastMessage.delete().catch();
    }
}