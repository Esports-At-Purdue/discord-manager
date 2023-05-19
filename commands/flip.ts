import {GlobalCommand} from "../Command";
import {SlashCommandBuilder} from "discord.js";
import {FlipEmbed} from "../embeds/Flip.Embed";

export const FlipCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("flip")
        .setDescription("Flip a coin")
    ,
    async function execute(interaction, application) {
        const random = Math.random();
        const result = random < 0.5;
        const embed = new FlipEmbed(result);
        interaction.reply({embeds: [embed]}).catch();
    }
);
