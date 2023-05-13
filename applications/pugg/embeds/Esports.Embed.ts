import {EmbedBuilder} from "discord.js";

export class EsportsEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Student Esports Verification");
        this.setColor("#2f3136");
        this.setDescription("If you play on a competitive esports team for Purdue WL, select any of the positions to open a verification ticket.");
    }
}