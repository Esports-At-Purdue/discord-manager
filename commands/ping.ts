import {GlobalCommand} from "../Command";
import {SlashCommandBuilder} from "discord.js";

export const PingCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("pong")
    ,
    async function execute(interaction, application) {
        interaction.reply({content: `${application.name}, pong!`, ephemeral: true}).catch();
    }
)
