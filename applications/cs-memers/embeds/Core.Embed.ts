import {EmbedBuilder} from "discord.js";

export class CoreEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setColor("#2f3136");
        this.setTitle("Core CS Courses");
    }
}