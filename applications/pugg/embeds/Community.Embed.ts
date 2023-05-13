import {EmbedBuilder} from "discord.js";
import * as config from "../config.json";

export class CommunityEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Community Engagement Menu");
        this.setColor("#2f3136")
        this.setDescription(`• <@&${config.guild.roles["community-night"]}> - If you would like notifications for each Community Night.`)
    }
}