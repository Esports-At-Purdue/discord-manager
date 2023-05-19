import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";
import {GameType} from "../Game";

export class LeaderboardRow extends ActionRowBuilder<ButtonBuilder> {
    constructor(game: GameType, page: number, totalPages: number) {
        super();
        if (page == 1) {
            this.addComponents(
                new ButtonBuilder()
                    .setEmoji("👈")
                    .setCustomId(`0`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setEmoji("👉")
                    .setCustomId(`page-2-${game}`)
                    .setStyle(ButtonStyle.Secondary)
            )
        }
        else if (page == totalPages) {
            this.addComponents(
                new ButtonBuilder()
                    .setEmoji("👈")
                    .setCustomId(`page-${totalPages - 1}-${game}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setEmoji("👉")
                    .setCustomId("0")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            )
        }
        else {
            this.addComponents(
                new ButtonBuilder()
                    .setEmoji("👈")
                    .setCustomId(`page-${page - 1}-${game}`)
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setEmoji("👉")
                    .setCustomId(`page-${page + 1}-${game}`)
                    .setStyle(ButtonStyle.Secondary)
            )
        }
    }
}