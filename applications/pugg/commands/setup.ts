import {ChatInputCommandInteraction, MessageReplyOptions, SlashCommandBuilder} from "discord.js";
import {Command} from "../../../Command";
import * as config from "../config.json";
import {PurdueEmbed} from "../../../embeds/Purdue.Embed";
import {PurdueRow} from "../../../components/Purdue.Row";
import {EsportsEmbed} from "../embeds/Esports.Embed";
import {EsportsActionRow} from "../components/Esports.ActionRow";
import {GamesEmbed} from "../embeds/Games.Embed";
import {GamesActionRows} from "../components/Games.ActionRows";
import {PlatformsEmbed} from "../embeds/Platforms.Embed";
import {PlatformActionRow} from "../components/Platform.ActionRow";
import {GenresEmbed} from "../embeds/Genres.Embed";
import {GenresActionRow} from "../components/Genres.ActionRow";
import {WelcomeEmbed} from "../embeds/Welcome.Embed";
import {WelcomeActionRow} from "../components/WelcomeActionRow";
import {CommunityEmbed} from "../embeds/Community.Embed";
import {CommunityActionRow} from "../components/CommunityActionRow";

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
                {name: "esports", value: "esports_menu"},
                {name: "games", value: "games_menu"},
                {name: "platforms", value: "platform_menu"},
                {name: "genres", value: "genre_menu"},
                {name: "welcome", value: "welcome_menu"},
                {name: "community", value: "community_menu"}
            )
        )
    ,
    async function execute(interaction: ChatInputCommandInteraction) {
        const menuName = interaction.options.getString("menu_name");
        switch(menuName) {
            case "verification_menu":   await interaction.channel.send(buildVerificationMenu()); break;
            case "esports_menu":        await interaction.channel.send(buildEsportsMenu()); break;
            case "games_menu":          await interaction.channel.send(buildGamesMenu()); break;
            case "platform_menu":       await interaction.channel.send(buildPlatformsMenu()); break;
            case "genre_menu":          await interaction.channel.send(buildGenresMenu()); break;
            case "welcome_menu":        await interaction.channel.send(buildWelcomeMenu()); break;
            case "community_menu":      await interaction.channel.send(buildCommunityMenu()); break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
)


function buildVerificationMenu(): MessageReplyOptions {
    const embed = new PurdueEmbed();
    const actionRow = new PurdueRow(config.guild.roles.purdue, config.guild.emotes.purdue);

    return ({embeds: [embed], components: [actionRow]});
}

function buildEsportsMenu(): MessageReplyOptions {
    const embed = new EsportsEmbed();
    const actionRow = new EsportsActionRow();

    return ({embeds: [embed], components: [actionRow]});
}

function buildGamesMenu(): MessageReplyOptions {
    const embed = new GamesEmbed();
    const actionRows = new GamesActionRows();

    return ({ embeds: [embed], components: actionRows });
}

function buildPlatformsMenu(): MessageReplyOptions {
    const embed = new PlatformsEmbed();
    const actionRow = new PlatformActionRow()

    return ({embeds: [embed], components: [actionRow]});
}

function buildGenresMenu(): MessageReplyOptions {
    const embed = new GenresEmbed();
    const actionRow = new GenresActionRow();

    return ({ embeds: [embed] , components: [actionRow] });
}

function buildWelcomeMenu(): MessageReplyOptions {
    const embed = new WelcomeEmbed();
    const actionRow = new WelcomeActionRow();

    return ({embeds: [embed], components: [actionRow]});
}

function buildCommunityMenu(): MessageReplyOptions {
    const embed = new CommunityEmbed();
    const actionRow = new CommunityActionRow();

    return ({embeds: [embed], components: [actionRow]});
}