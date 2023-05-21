import {Command} from "../../../Command";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import * as fs from "fs";
import {Message} from "../Message";

export const BruvgrepCommand = new Command(
    new SlashCommandBuilder()
        .setName("bruvgrep")
        .setDescription("Has bruv said something?")
        .addStringOption((string) => string
            .setName("pattern")
            .setDescription("What is something?")
            .setRequired(true)
        ),
    async function execute(interaction: ChatInputCommandInteraction) {

        const validIds = ["266293442248835083", "363543084124078081", "397179931223785484", "751910711218667562", "822510445838598204"];

        if (!validIds.includes(interaction.user.id)) {
            await interaction.reply({content: `This command not available for public consumption.. *yet*`, ephemeral: true});
            return;
        }

        const pattern = interaction.options.getString("pattern");
        const bruvlog = Message.readMessagesFile();
        const parsedBruvLog = parseArrayForStringsWithNewlines(bruvlog);
        const matches = grep(parsedBruvLog, pattern);

        if (matches.length < 1) {
            interaction.reply({content: `Sorry, there were no matches for \`${pattern}\`.`, ephemeral: true}).catch();
            return;
        }

        const messages = matches.map(message => `> ${replacePatternWithMarkup(message.replace("https://", ""), pattern)}`);
        const splitMessages = splitArrayByCharacterLimit(messages, 1900);
        const firstMessageBatch = splitMessages[0];

        const message = `**${messages.length} matches found for \`${pattern}\`**\n` + firstMessageBatch.join("\n");
        console.log(message.length);
        await interaction.reply({content: message, ephemeral: true});

        for (let i = 1; i < splitMessages.length; i++) {
            const nextMessage =  splitMessages[i].join("\n");
            await interaction.followUp({content: nextMessage, ephemeral: true}).catch();
        }

    }
)

function grep(strings: string[], pattern: string) {
    const regex = new RegExp(pattern, 'i');
    return strings.filter((string) => regex.test(string));
}

function splitArrayByCharacterLimit(array: string[], characterLimit: number) {
    const result: string[][] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const element of array) {
        const elementLength = element.length;

        if (currentLength + elementLength <= characterLimit) {
            currentChunk.push(element);
            currentLength += elementLength;
        } else {
            result.push(currentChunk);
            currentChunk = [element];
            currentLength = elementLength;
        }
    }

    if (currentChunk.length > 0) {
        result.push(currentChunk);
    }

    return result;
}

function parseArrayForStringsWithNewlines(array: Message[]) {
    return array.flatMap(splitStringWithNewlines);
}


function splitStringWithNewlines(message: Message) {
    return message.content.split('\n');
}

function replacePatternWithMarkup(string, pattern) {
    const regex = new RegExp(pattern, 'gi');
    return string.replace(regex, (match) => {
        const mask = `**${match}**`;
        return match === match.toUpperCase() ? mask.toUpperCase() : mask;
    });
}