import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export class QueueRow extends ActionRowBuilder<ButtonBuilder> {
    constructor() {
        super();
        this.addComponents(
            new ButtonBuilder().setLabel("Join").setCustomId("join").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setLabel("Leave").setCustomId("leave").setStyle(ButtonStyle.Danger)
        );
    }
}