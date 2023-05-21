import {Command} from "../../../Command";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import * as fs from "fs";
import {Message} from "../Message";

export const BruvLogCommand = new Command(
    new SlashCommandBuilder()
        .setName("bruvlog")
        .setDescription("What has bruv been saying lately?")
        .addIntegerOption((integer) => integer
            .setName("messages")
            .setDescription("How many messages?")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(20)
        ),
    async function execute(interaction: ChatInputCommandInteraction) {

        const validIds = ["266293442248835083", "363543084124078081", "397179931223785484", "751910711218667562", "822510445838598204"];

        if (!validIds.includes(interaction.user.id)) {
            await interaction.reply({content: `This command not available for public consumption.. *yet*`, ephemeral: true});
            return;
        }

        const totalMessages = interaction.options.getInteger("messages");
        const bruvlog: Message[] = Message.readMessagesFile();
        console.log(bruvlog);
        const parsedBruvLog = parseArrayForStringsWithNewlines(bruvlog);
        const messages = parsedBruvLog.slice(-totalMessages).map(message => `> ${message.replace("https://", "")}`);
        const message = messages.join("\n");
        interaction.reply({content: message, ephemeral: true}).catch();
    }
)

function parseArrayForStringsWithNewlines(array: Message[]) {
        return array.flatMap(splitStringWithNewlines);
}

function splitStringWithNewlines(message: Message) {
        return message.content.split('\n');
}