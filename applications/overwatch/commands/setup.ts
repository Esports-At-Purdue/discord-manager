import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageReplyOptions,
    SlashCommandBuilder
} from "discord.js";
import {Command} from "../../../Command";
import * as config from "../config.json";
import {PurdueEmbed} from "../../../embeds/Purdue.Embed";
import {PurdueRow} from "../../../components/Purdue.Row";

export const SetupCommand = new Command(
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('General-purpose command for menu setup')
        .addStringOption(option => option
            .setName("menu_name")
            .setDescription("The name of the menu to setup")
            .setRequired(true)
            .setChoices(
                {name: "verification", value: "verification_menu"},
                {name: "welcome", value: "welcome_menu"},
                {name: "ranks", value: "ranks_menu"},
                {name: "roles", value: "roles_menu"},
                {name: "lfg-roles", value: "lfg-menu"},
                {name: "pronouns", value: "pronouns_menu"},
                {name: "pugs", value: "pugs_button"}
            )
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const menu = interaction.options.getString("menu_name");
        switch (menu) {
            case "verification_menu": await interaction.channel.send(buildVerificationMenu()) ; break;
            case "welcome_menu": await interaction.channel.send(buildWelcomeMenu()) ; break;
            case "ranks_menu": await interaction.channel.send(buildRanksMenu()) ; break;
            case "roles_menu": await interaction.channel.send(buildRolesMenu()) ; break;
            case "pronouns_menu": await interaction.channel.send(buildPronounsMenu()) ; break;
            case "pugs_button": await interaction.channel.send(buildPugsMenu()); break;
            case "lfg-menu": await interaction.channel.send(buildLFGMenu()); break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
)


function buildPugsMenu(): MessageReplyOptions {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setLabel("PUGs")
                .setStyle(ButtonStyle.Primary)
                .setCustomId(config.guild.roles.pugs)
        )
    return {components: [row]};
}

function buildLFGMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("LFG Ranked Roles")
        .setDescription("Members ping these roles to form groups")
        .setColor("#2f3136")

    let bronze = new ButtonBuilder().setCustomId(config.guild.roles.lfg.bronze).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.bronze);
    let silver = new ButtonBuilder().setCustomId(config.guild.roles.lfg.silver).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.silver);
    let gold = new ButtonBuilder().setCustomId(config.guild.roles.lfg.gold).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.gold);
    let platinum = new ButtonBuilder().setCustomId(config.guild.roles.lfg.platinum).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.platinum);
    let diamond = new ButtonBuilder().setCustomId(config.guild.roles.lfg.diamond).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.diamond);
    let master = new ButtonBuilder().setCustomId(config.guild.roles.lfg.master).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.master);
    let grandmaster = new ButtonBuilder().setCustomId(config.guild.roles.lfg.grandmaster).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.grandmaster);
    let god = new ButtonBuilder().setCustomId(config.guild.roles.lfg.god).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.god);

    let rowA = new ActionRowBuilder<ButtonBuilder>().addComponents(bronze, silver, gold, platinum);
    let rowB = new ActionRowBuilder<ButtonBuilder>().addComponents(diamond, master, grandmaster, god);

    return ({embeds: [embed], components: [rowA, rowB]});
}

function buildVerificationMenu(): MessageReplyOptions {
    const embed = new PurdueEmbed();
    const row = new PurdueRow(config.guild.roles.purdue, config.guild.emotes.purdue);
    return ({embeds: [embed], components: [row]});
}

function buildRanksMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Ranked Roles")
        .setDescription("Show off your highest rank")
        .setColor("#2f3136")

    let bronze = new ButtonBuilder().setCustomId(config.guild.roles.ranks.bronze).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.bronze);
    let silver = new ButtonBuilder().setCustomId(config.guild.roles.ranks.silver).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.silver);
    let gold = new ButtonBuilder().setCustomId(config.guild.roles.ranks.gold).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.gold);
    let platinum = new ButtonBuilder().setCustomId(config.guild.roles.ranks.platinum).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.platinum);
    let diamond = new ButtonBuilder().setCustomId(config.guild.roles.ranks.diamond).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.diamond);
    let master = new ButtonBuilder().setCustomId(config.guild.roles.ranks.master).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.master);
    let grandmaster = new ButtonBuilder().setCustomId(config.guild.roles.ranks.grandmaster).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.grandmaster);
    let god = new ButtonBuilder().setCustomId(config.guild.roles.ranks.god).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.god);

    let rowA = new ActionRowBuilder<ButtonBuilder>().addComponents(bronze, silver, gold, platinum);
    let rowB = new ActionRowBuilder<ButtonBuilder>().addComponents(diamond, master, grandmaster, god);

    return ({embeds: [embed], components: [rowA, rowB]});
}

function buildRolesMenu(): MessageReplyOptions {
    const embed = new EmbedBuilder()
        .setTitle("Roles")
        .setDescription("Let everyone know what roles you like to play")
        .setColor("#2f3136")

    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.roles.tank)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.tank),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.roles.support)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.support),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.roles.damage)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.damage)
        )

    return ({embeds: [embed], components: [row]});
}

function buildPronounsMenu(): MessageReplyOptions {
    const embed = new EmbedBuilder()
        .setTitle("Pronoun Roles Menu")
        .setColor("#2f3136")

    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.pronouns["they/them"])
                .setLabel("They/Them")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.pronouns["she/her"])
                .setLabel("She/Her")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.pronouns["he/him"])
                .setLabel("He/Him")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.pronouns["she/they"])
                .setLabel("She/They")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.pronouns["he/they"])
                .setLabel("He/They")
                .setStyle(ButtonStyle.Secondary)
        )

    return ({embeds: [embed], components: [row]});
}

function buildWelcomeMenu(): MessageReplyOptions {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.overwatch)
                .setLabel("Access Purdue Overwatch!")
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.guild.emotes.logo)
        )
    return ({components: [row]});
}
