import {Command} from "../../../Command";
import * as config from "../config.json";
import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    ChatInputCommandInteraction, Colors, EmbedBuilder,
    MessageReplyOptions,
    SlashCommandBuilder
} from "discord.js";

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
                {name: "welcome", value: "welcome_menu"},
                {name: "roles", value: "roles_menu"},
                {name: "ranks", value: "ranks_menu"},
                {name: "tournament", value: "tournament_menu"}
            )
        )
    ,
    async function execute(interaction: ChatInputCommandInteraction) {
        const menuName = interaction.options.getString("menu_name");
        switch(menuName) {
            case "verification_menu": await interaction.channel.send(buildVerificationMenu()); break;
            case "ranks_menu": await interaction.channel.send(buildRanksMenu()); break;
            case "roles_menu": await interaction.channel.send(buildRolesMenu()); break;
            case "welcome_menu": await interaction.channel.send(buildWelcomeMenu()); break;
            case "tournament_menu": await interaction.channel.send(buildTournamentMenu()); break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
)

function buildTournamentMenu(): MessageReplyOptions {
    const embed = new EmbedBuilder()
        .setColor(Colors.Gold)
        .setTitle("A Valorant At Purdue Tournament")
        .setDescription("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris diam dui, sagittis accumsan tellus non, rutrum venenatis diam. Quisque iaculis pellentesque dapibus. Mauris at sagittis elit. Integer ornare justo dolor.\nSign up now with the button below!")

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.tournament)
                .setLabel("Sign Up")
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.guild.emotes.logo)
        );

    return {embeds: [embed], components: [row]};
}

function buildVerificationMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Student Email Verification")
        .setColor("#2f3136")
        .setDescription(
            "**How to authenticate yourself as a Purdue Student!**\n" +
            "1. Click the **Purdue Button** to have a verification email sent to you.\n" +
            "2. Click the link within the verification email.\n"
        );

    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.purdue)
                .setLabel("Purdue")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(config.guild.emotes.purdue),
        );
    return ({embeds: [embed], components: [row]});
}

function buildRanksMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Valorant Ranked Roles")
        .setColor("#2f3136")

    let iron = new ButtonBuilder().setCustomId(config.guild.roles.ranks.iron).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.iron);
    let bronze = new ButtonBuilder().setCustomId(config.guild.roles.ranks.bronze).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.bronze);
    let silver = new ButtonBuilder().setCustomId(config.guild.roles.ranks.silver).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.silver);
    let gold = new ButtonBuilder().setCustomId(config.guild.roles.ranks.gold).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.gold);
    let platinum = new ButtonBuilder().setCustomId(config.guild.roles.ranks.platinum).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.platinum);
    let diamond = new ButtonBuilder().setCustomId(config.guild.roles.ranks.diamond).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.diamond);
    let ascendant = new ButtonBuilder().setCustomId(config.guild.roles.ranks.ascendant).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.ascendant);
    let immortal = new ButtonBuilder().setCustomId(config.guild.roles.ranks.immortal).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.immortal);
    let radiant = new ButtonBuilder().setCustomId(config.guild.roles.ranks.radiant).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.ranks.radiant);

    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(iron, bronze, silver);
    let row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(gold, platinum, diamond);
    let row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(ascendant, immortal, radiant);

    return ({embeds: [embed], components: [row, row2, row3]});
}

function buildRolesMenu(): MessageReplyOptions {
    let embed = new EmbedBuilder()
        .setTitle("Miscellaneous Roles")
        .setColor("#2f3136")
        .setDescription("" +
            "• **Purdue** - React if you are an alumnus, student, or incoming freshman.\n" +
            "• **Wallyball** - React if you want to know when we are doing club wallyball. (VERY FUN PLEASE COME!).\n" +
            "• **PUGS** - React if you are interested in PUGs (pick up games).\n" +
            "• **10mans** - React to receive access 10mans channels and notifications.");

    let purdue = new ButtonBuilder().setLabel("Purdue").setCustomId(config.guild.roles.purdue).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.purdue);
    let walleyball = new ButtonBuilder().setLabel("Wallyball").setCustomId(config.guild.roles.wallyball).setStyle(ButtonStyle.Secondary).setEmoji('🏐');
    let pugs = new ButtonBuilder().setLabel("PUGs").setCustomId(config.guild.roles.pugs).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.pugs);
    let tenmans = new ButtonBuilder().setLabel("10mans").setCustomId(config.guild.roles.tenmans).setStyle(ButtonStyle.Secondary).setEmoji(config.guild.emotes.tenmans);

    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(purdue, walleyball, pugs, tenmans);

    return ({embeds: [embed], components: [row]});
}

function buildWelcomeMenu(): MessageReplyOptions {
    let row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.valorant)
                .setLabel(`Access Valorant at Purdue!`)
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.guild.emotes.logo)
        )
    return ({components: [row]});
}