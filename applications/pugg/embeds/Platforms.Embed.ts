import {EmbedBuilder} from "discord.js";

export class PlatformsEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Platform Roles");
        this.setColor("#2f3136");
    }
}