import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";

const teamOneName = "Please type team one's name";
const teamTwoName = "Please type team two's name";
const teamOneScore = "Please type team one's score";
const teamTwoScore = "Please type team two's score";


export class GameModal extends ModalBuilder {
    constructor() {
        super();
        const rowOne = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(new TextInputBuilder().setLabel(teamOneName).setStyle(TextInputStyle.Short));
        const rowTwo = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(new TextInputBuilder().setLabel(teamOneScore).setStyle(TextInputStyle.Short));
        const rowThree = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(new TextInputBuilder().setLabel(teamTwoName).setStyle(TextInputStyle.Short));
        const rowFour = new ActionRowBuilder<TextInputBuilder>()
            .addComponents(new TextInputBuilder().setLabel(teamTwoScore).setStyle(TextInputStyle.Short));
        this.addComponents(rowOne, rowTwo, rowThree, rowFour);
    }
}