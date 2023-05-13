import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const prompt = "Please type a username (3-16 characters)"

export class PlayerModal extends ModalBuilder {
    public constructor() {
        super();
        const input = new TextInputBuilder().setCustomId("username").setLabel(prompt).setStyle(TextInputStyle.Short);
        const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
        this.addComponents(actionRow).setCustomId("register").setTitle("Player Registration");
    }
}