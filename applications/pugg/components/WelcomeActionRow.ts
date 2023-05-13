import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../config.json";

export class WelcomeActionRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        this.addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.pugger)
                .setLabel("Become A PUGGer")
                .setStyle(ButtonStyle.Primary)
        )
    }
}