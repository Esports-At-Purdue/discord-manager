import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import * as config from "../config.json";

export class StandingRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        this.addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.freshman)
                .setEmoji("🇫")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.sophomore)
                .setEmoji("🇸")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.junior)
                .setEmoji("🇯")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.senior)
                .setEmoji("🎓")
                .setStyle(ButtonStyle.Secondary)
            ,
        )
    }
}