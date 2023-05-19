import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../config.json";

export class RolesRow extends ActionRowBuilder<ButtonBuilder> {
    public constructor() {
        super();
        this.addComponents(
            new ButtonBuilder()
                .setLabel("Boilermaker")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.purdue)
                .setCustomId(config.guild.roles.purdue),
            new ButtonBuilder()
                .setLabel("Pugs")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.pugs)
                .setCustomId(config.guild.roles.pugs),
            new ButtonBuilder()
                .setLabel("10-mans")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.tenmans)
                .setCustomId(config.guild.roles.tenmans)
        )
    }
}