import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../config.json";

export class GenresActionRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        for (const role of config.guild.roles.genres) {
            this.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${role.id}`)
                    .setLabel(`${role.name}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(role["emote_id"])
            )
        }
    }
}