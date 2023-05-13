import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../config.json";

export class PlatformActionRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        for (const role of config.guild.roles.platforms) {
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