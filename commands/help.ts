import {ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {Application} from "../Application";
import {GlobalCommand} from "../Command";

export const helpCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays info about other commands.")

        .addStringOption((string) => string
            .setName("command")
            .setDescription("The command view")
            .setRequired(false)
        )
    ,
    async function execute(interaction: ChatInputCommandInteraction, application: Application) {
        const command = interaction.options.getString("command") ?? "";
        let description = "";
        const list = [];

        await application.commands.forEach(command => {
            list.push([toTitleCase(command.builder.name), command.builder.description, command.builder.options])
        });

        list.sort();

        for (const [name, nextDescription, options] of list) {
            if (name.toLowerCase().includes(command.toLowerCase())) {
                description += `**${name}** - ${nextDescription}\n`;
                for (const option of options) {
                    description += mapOptions(name.toLowerCase(), option);
                }
                description += "\n";
            }
        }

        const embed = new EmbedBuilder().setDescription(description).setTitle("Help Menu").setColor("#5a69ea");
        interaction.reply({embeds: [embed], ephemeral: true}).catch();
    }
);

function mapOptions(name, option): string {
    let response = "";
    let options = option.options;
    if (option.type) {
        return response.concat(`⠀⠀⠀⠀\`<${option.name}>\` - ${option.description}\n`)
    }
    response = response.concat(`⠀⠀\`/${name} ${option.name}\` - ${option.description}\n`);
    for (let subOption of options) {
        response = response.concat(mapOptions(`${name} ${option.name}`, subOption))
    }
    return response;
}

function toTitleCase(string): string {
    string = string.toLowerCase().split('-');
    for (let i = 0; i < string.length; i++) {
        string[i] = string[i].charAt(0).toUpperCase() + string[i].slice(1);
    }
    return string.join('-');
}