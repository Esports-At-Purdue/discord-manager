import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const firstNamePrompt = "What is your preferred first name?";
const lastNamePrompt = "What is your last name or last initial?";

export class WallyballModal extends ModalBuilder {
    public constructor() {
        super();
        this.setCustomId("wallyball");
        this.setTitle("Wallyball Registration")
        const firstNameInput = new TextInputBuilder().setCustomId("first-name").setLabel(firstNamePrompt).setStyle(TextInputStyle.Short);
        const lastNameInput = new TextInputBuilder().setCustomId("last-name").setLabel(lastNamePrompt).setStyle(TextInputStyle.Short);
        const firstNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstNameInput);
        const lastNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(lastNameInput);
        this.addComponents(firstNameRow, lastNameRow);
    }
}