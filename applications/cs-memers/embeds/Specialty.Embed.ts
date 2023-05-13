import {EmbedBuilder} from "discord.js";

export class SpecialtyEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setColor("#2f3136");
        this.setTitle("Specialty Roles")
    }
}