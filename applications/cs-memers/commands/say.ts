import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {Command} from "../../../Command";

export const SayCommand = new Command(
    new SlashCommandBuilder()
        .setName("say")
        .setDescription("Compels me to send a message of your crafting.")
        .addStringOption((string) => string
            .setName("text")
            .setDescription("Aforementioned message")
            .setRequired(true)
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const text = interaction.options.getString("text");

        if (interaction.user.id != "266293442248835083" && interaction.user.id != "751910711218667562") {
            await interaction.reply({content: "No.", ephemeral: true});
            return;
        }

        await interaction.channel.send({content: text});
        await interaction.reply({content: "Success", ephemeral: true});
    }
);