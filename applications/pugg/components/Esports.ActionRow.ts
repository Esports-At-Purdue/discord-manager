import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../config.json";

export class EsportsActionRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        this.addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.esports.coach)
                .setLabel("Coach")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.esports.captain)
                .setLabel("Captain")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.esports.player)
                .setLabel("Player")
                .setStyle(ButtonStyle.Secondary)
        );
    }
}