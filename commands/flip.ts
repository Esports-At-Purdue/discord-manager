import {GlobalCommand} from "../Command";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {Application} from "../Application";
import {FlipEmbed} from "../embeds/Flip.Embed";

export const flipCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("flip")
        .setDescription("Flip a coin")
    ,
    async function execute(interaction: ChatInputCommandInteraction, application: Application) {
        const random = Math.random();
        const result = random < 0.5;
        const embed = new FlipEmbed(result);
        interaction.reply({embeds: [embed]}).catch();
    }
);
