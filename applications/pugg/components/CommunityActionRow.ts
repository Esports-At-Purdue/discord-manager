import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../config.json";

export class CommunityActionRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        this.addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles["community-night"])
                .setLabel("Community Night")
                .setStyle(ButtonStyle.Secondary)
        )
    }
}