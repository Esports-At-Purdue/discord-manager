import {Colors, TextBasedChannel} from "discord.js";
import {LogEmbed} from "./embeds/Log.Embed";

export class Logger {
    public readonly channel: TextBasedChannel;

    constructor(channel: TextBasedChannel) {
        this.channel = channel;
    }

    public info(content: string): void {
        if (!this.channel) return;
        this.channel.send({embeds: [new LogEmbed(content, null, Colors.Blue)]}).catch();
    }

    public error(content: string = null, error: Error): void {
        if (!this.channel) return;
        const body = `${error.message}\`\`\`${error.stack}\`\`\``
        this.channel.send({embeds: [new LogEmbed(content, body, Colors.DarkOrange)]}).catch();
    }
}