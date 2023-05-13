import {EmbedBuilder} from "discord.js";

export class GamesEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Game Specific Roles");
        this.setColor("#2f3136");
    }
}