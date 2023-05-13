import {EmbedBuilder} from "discord.js";

export class GenresEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Genre Roles");
        this.setColor("#2f3136");
    }
}