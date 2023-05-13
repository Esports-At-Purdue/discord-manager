import {GlobalCommand} from "../Command";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {Application} from "../Application";

export const pingCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong")
    ,
    async function execute(interaction: ChatInputCommandInteraction, application: Application) {
        interaction.reply({content: `${application.name}, pong!`, ephemeral: true}).catch();
    }
)
