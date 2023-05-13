import {ColorResolvable, EmbedBuilder} from "discord.js";

export class LogEmbed extends EmbedBuilder {
    public constructor(title: string, description: string, color: ColorResolvable) {
        super();
        this.setTitle(title);
        this.setColor(color);
        if (description) this.setDescription(description);
    }
}