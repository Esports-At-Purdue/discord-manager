import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export class PurdueRow extends ActionRowBuilder<ButtonBuilder> {
    constructor(id: string, emote: string) {
        super();
        this.addComponents(new ButtonBuilder()
            .setCustomId(id)
            .setEmoji(emote)
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Purdue")
        );

    }
}