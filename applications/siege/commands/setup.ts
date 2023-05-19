import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    ChatInputCommandInteraction, EmbedBuilder,
    MessageReplyOptions,
    SlashCommandBuilder
} from "discord.js";
import {Command} from "../../../Command";
import * as config from "../config.json";

export const SetupCommand = new Command(
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('General-purpose command for menu setup')
        .addStringOption(option => option
            .setName("menu_name")
            .setDescription("The name of the menu to setup")
            .setRequired(true)
            .setChoices(
                {name: "roles", value: "roles_menu"},
                {name: "welcome", value: "welcome_menu"},
                {name: "ranks", value: "ranks_menu"},
                {name: "league", value: "league_menu"},
            )
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const menu = interaction.options.getString("menu_name");
        switch (menu) {
            case "roles_menu": await interaction.channel.send(buildRoleMenu()) ; break;
            case "ranks_menu": await interaction.channel.send(buildRanksMenu()) ; break;
            case "welcome_menu": await interaction.channel.send(buildWelcomeMenu()) ; break;
            case "league_menu": await interaction.channel.send(buildLeagueMenu()) ; break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
)

function buildLeagueMenu(): MessageReplyOptions {
    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.summer)
                .setLabel("Click Me For Summer League!")
                .setStyle(ButtonStyle.Primary)
                .setEmoji(config.guild.emotes.summer)
        )

    return ({components: [row]});
}

function buildWelcomeMenu(): MessageReplyOptions {
    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.r6)
                .setLabel("Access R6@Purdue!")
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.guild.emotes.logo)
        )
    return ({components: [row]});
}

function buildRanksMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Ranked Roles")
        .setColor("#2f3136")
        .setDescription("Select your R6 Rank!");

    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.copper)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.copper),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.bronze)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.bronze),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.silver)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.silver),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.gold)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.gold),
        );

    let row2 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.platinum)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.platinum),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.emerald)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.emerald),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.diamond)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.diamond),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.ranks.champion)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.champion)
        );

    return ({embeds: [embed], components: [row, row2]});
}

function buildRoleMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("R6@Purdue Server Roles")
        .setColor("#2f3136")
        .setDescription("" +
            "• **Purdue** - React if you are an alumnus, student, or incoming freshman.\n" +
            "• **10 Mans** - React to receive access to 10-mans channels and notifications.\n" +
            "• **Game Night** - React to receive access game night channels and notifications.");

    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel("Purdue")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.purdue)
                .setCustomId(config.guild.roles.purdue),
            new ButtonBuilder()
                .setLabel("Games")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🎲")
                .setCustomId(config.guild.roles.games),
            new ButtonBuilder()
                .setLabel("10 Mans")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.pupl)
                .setCustomId(config.guild.roles.tenmans)
        )

    return ({embeds: [embed], components: [row]});
}