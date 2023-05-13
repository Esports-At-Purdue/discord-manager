import {Command} from "../../../Command";
import * as config from "../config.json";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction, MessageReplyOptions,
    SlashCommandBuilder
} from "discord.js";
import {ClassEmbed} from "../embeds/Class.Embed";
import {MajorEmbed} from "../embeds/Major.Embed";
import {StandingEmbed} from "../embeds/Standing.Embed";
import {StandingRow} from "../components/Standing.Row";
import {PurdueEmbed} from "../../../embeds/Purdue.Embed";
import {PurdueRow} from "../../../components/Purdue.Row";

export const SetupCommand = new Command(
    new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Creates a various-purpose menu.")
        .addStringOption(option => option
            .setName("menu_name")
            .setDescription("The name of the menu to setup")
            .setRequired(true)
            .setChoices(
                {name: "verification", value: "verification_menu"},
                {name: "classes", value: "class_menu"},
                {name: "majors", value: "major_menu"},
                {name: "standings", value: "standing_menu"}

            )
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const menuName = interaction.options.getString("menu_name");
        switch(menuName) {
            case "verification_menu":
                await interaction.channel.send(buildVerificationMenu());
                break;
            case "class_menu":
                await interaction.channel.send(buildClassMenu());
                break;
            case "major_menu":
                await interaction.channel.send(buildMajorMenu());
                break;
            case "standing_menu":
                await interaction.channel.send(buildStandingMenu());
                break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
)



function buildVerificationMenu(): MessageReplyOptions {
    const embed = new PurdueEmbed();
    const row = new PurdueRow(config.guild.roles.purdue, config.guild.emotes.purdue);
    return ({embeds: [embed], components: [row]});
}

function buildStandingMenu(): MessageReplyOptions {
    const embed = new StandingEmbed();
    const row = new StandingRow();
    return {embeds: [embed], components: [row]};
}

function buildMajorMenu(): MessageReplyOptions {
    const embed = new MajorEmbed();
    const rowOne = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.agriculture)
                .setEmoji("🌿")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.biology)
                .setEmoji("🧬")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.chemistry)
                .setEmoji("👩‍🔬")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.cs)
                .setEmoji("💻")
                .setStyle(ButtonStyle.Secondary)
        );
    const rowTwo = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.eaps)
                .setEmoji("🌎")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.engineering)
                .setEmoji("⚙")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.hhs)
                .setEmoji("💉")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.math)
                .setEmoji("🔢")
                .setStyle(ButtonStyle.Secondary)
        );
    const rowThree = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.pharmacy)
                .setEmoji("🧪")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.physics)
                .setEmoji("☢")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.polytechnic)
                .setEmoji("📐")
                .setStyle(ButtonStyle.Secondary)
            , new ButtonBuilder()
                .setCustomId(config.guild.roles.majors.veterinary)
                .setEmoji("🐴")
                .setStyle(ButtonStyle.Secondary)
        )
    return {embeds: [embed], components: [rowOne, rowTwo, rowThree]}
}

function buildClassMenu(): MessageReplyOptions {
    const embed = new ClassEmbed();
    const rowOne = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(config.courses.ma161.id)
            .setLabel(config.courses.ma161.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.ma165.id)
            .setLabel(config.courses.ma165.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.ma162.id)
            .setLabel(config.courses.ma161.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.ma166.id)
            .setLabel(config.courses.ma166.name)
            .setStyle(ButtonStyle.Secondary)
    )
    const rowTwo = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(config.courses.ma261.id)
            .setLabel(config.courses.ma261.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.ma362.id)
            .setLabel(config.courses.ma362.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.ma265.id)
            .setLabel(config.courses.ma265.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.ma351.id)
            .setLabel(config.courses.ma351.name)
            .setStyle(ButtonStyle.Secondary)

    )
    const rowThree = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(config.courses.ma262.id)
            .setLabel(config.courses.ma262.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.ma266.id)
            .setLabel(config.courses.ma266.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.stat350.id)
            .setLabel(config.courses.stat350.name)
            .setStyle(ButtonStyle.Secondary)
        , new ButtonBuilder()
            .setCustomId(config.courses.stat511.id)
            .setLabel(config.courses.stat511.name)
            .setStyle(ButtonStyle.Secondary)
    )

    const rowFour = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(config.guild.roles.ta)
            .setLabel("I'm a TA!")
            .setStyle(ButtonStyle.Success)
    )

    return {embeds: [embed], components: [rowOne, rowTwo, rowThree, rowFour]};
}
