import {Command} from "../../../Command";
import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import * as config from "../config.json";

export const SetupCommand = new Command(
    new SlashCommandBuilder()
        .setName("setup")
        .setDescription("yeah")
        .addStringOption((string) => string
            .setName("menu")
            .setDescription("menu")
            .setChoices(
                { name: "roles", value: "roles" }
            )
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const menu = interaction.options.getString("menu");

        if (menu == "roles") {

            const firstRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Soccer")
                        .setCustomId(config.guild.roles.soccer)
                        .setEmoji(config.guild.emotes.soccer)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Volleyball")
                        .setCustomId(config.guild.roles.volleyball)
                        .setEmoji(config.guild.emotes.volleyball)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Football")
                        .setCustomId(config.guild.roles.football)
                        .setEmoji(config.guild.emotes.football)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Kickball")
                        .setCustomId(config.guild.roles.kickball)
                        .setEmoji(config.guild.emotes.kickball)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Hiking")
                        .setCustomId(config.guild.roles.treck)
                        .setEmoji(config.guild.emotes.treck)
                        .setStyle(ButtonStyle.Primary),
                )

            const secondRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel("Gym")
                        .setCustomId(config.guild.roles.gym)
                        .setEmoji(config.guild.emotes.gym)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Food")
                        .setCustomId(config.guild.roles.food)
                        .setEmoji(config.guild.emotes.food)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Movies")
                        .setCustomId(config.guild.roles.movies)
                        .setEmoji(config.guild.emotes.movies)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Nerf")
                        .setCustomId(config.guild.roles.nerf)
                        .setEmoji(config.guild.emotes.nerf)
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setLabel("Minecraft")
                        .setCustomId(config.guild.roles.minecraft)
                        .setEmoji(config.guild.emotes.minecraft)
                        .setStyle(ButtonStyle.Primary),
                )

            await interaction.channel.send({ components: [firstRow, secondRow] });
            await interaction.reply({ content: "Success", ephemeral: true });
        }
    }
)