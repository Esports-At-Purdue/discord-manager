import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    ChatInputCommandInteraction,
    MessageReplyOptions,
    SlashCommandBuilder
} from "discord.js";
import * as config from "../config.json";
import {Command} from "../../../Command";
import {RolesEmbed} from "../embeds/Roles.Embed";
import {RolesRow} from "../components/Roles.Row";

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
            )
        )
    ,
    async function execute(interaction: ChatInputCommandInteraction) {
        const menuName = interaction.options.getString("menu_name");

        switch(menuName) {
            case "roles_menu": await interaction.channel.send(buildRolesMenu()); break;
            case "welcome_menu": await interaction.channel.send(buildWelcomeMenu()); break;
        }
    }
)

function buildRolesMenu(): MessageReplyOptions {
    const embed = new RolesEmbed();
    const row = new RolesRow();

    return {embeds: [embed], components: [row]};
}

function buildWelcomeMenu(): MessageReplyOptions {
    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(config.guild.roles.csgo)
                .setLabel("Access BoilerCS!")
                .setStyle(ButtonStyle.Success)
                .setEmoji(config.guild.emotes.logo)
        )
    return {components: [row]};
}