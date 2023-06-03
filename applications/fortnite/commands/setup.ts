import {Command} from "../../../Command";
import * as config from "../config.json";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageReplyOptions,
    SlashCommandBuilder
} from "discord.js";
import {PurdueEmbed} from "../../../embeds/Purdue.Embed";
import {PurdueRow} from "../../../components/Purdue.Row";

export const SetupCommand = new Command(
    new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Creates a various-purpose menu.")
        .addStringOption((string) => string
            .setName("menu_name")
            .setDescription("The name of the menu to setup")
            .setRequired(true)
            .setChoices(
                {name: "verification", value: "verification_menu"},
                {name: "ranks", value: "ranks_menu"},
                {name: "lfg", value: "lfg_menu"},
            )
        )
    ,
    async function execute(interaction: ChatInputCommandInteraction) {
        const menuName = interaction.options.getString("menu_name");
        switch(menuName) {
            case "verification_menu": await interaction.channel.send(buildVerificationMenu()); break;
            case "ranks_menu": await interaction.channel.send(buildRanksMenu()); break;
            case "lfg_menu": await interaction.channel.send(buildLFGMenu()); break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
)

function buildLFGMenu(): MessageReplyOptions {
    const embed = new EmbedBuilder()
        .setTitle("LFG Roles")
        .setDescription(
            `- <:build:${config.guild.emotes.build}> Battle Royale\n` +
            `- <:nobuild:${config.guild.emotes.nobuild}> No Build\n` +
            `- <:creative:${config.guild.emotes.creative}> Creative\n`
        );

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.build)
                .setLabel("Battle Royale")
                .setEmoji(config.guild.emotes.build)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(config.guild.roles.nobuild)
                .setLabel("No Build")
                .setEmoji(config.guild.emotes.nobuild)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setLabel("Creative")
                .setEmoji(config.guild.emotes.creative)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId(config.guild.roles.creative)
        );

    return ({embeds: [embed], components: [row]});
}

function buildVerificationMenu(): MessageReplyOptions {
    const embed = new PurdueEmbed();
    const row = new PurdueRow(config.guild.roles.purdue, config.guild.emotes.purdue);
    return ({embeds: [embed], components: [row]});
}

function buildRanksMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Fortnite Ranked Roles")
        .setColor("#2f3136")

    let bronze = new ButtonBuilder().setCustomId(config.guild.roles.ranks.bronze).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.bronze);
    let silver = new ButtonBuilder().setCustomId(config.guild.roles.ranks.silver).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.silver);
    let gold = new ButtonBuilder().setCustomId(config.guild.roles.ranks.gold).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.gold);
    let platinum = new ButtonBuilder().setCustomId(config.guild.roles.ranks.platinum).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.platinum);
    let diamond = new ButtonBuilder().setCustomId(config.guild.roles.ranks.diamond).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.diamond);
    let elite = new ButtonBuilder().setCustomId(config.guild.roles.ranks.elite).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.elite);
    let champion = new ButtonBuilder().setCustomId(config.guild.roles.ranks.champion).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.champion);
    let unreal = new ButtonBuilder().setCustomId(config.guild.roles.ranks.unreal).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.unreal);

    let row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(bronze, silver, gold, platinum);
    let row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(diamond, elite, champion, unreal);

    return ({embeds: [embed], components: [row1, row2]});
}