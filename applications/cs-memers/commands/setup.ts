import {Command} from "../../../Command";
import {
    ChatInputCommandInteraction,
    MessageReplyOptions,
    PermissionsBitField,
    SlashCommandBuilder,
} from "discord.js";
import {PurdueEmbed} from "../../../embeds/Purdue.Embed";
import {PurdueRow} from "../../../components/Purdue.Row";
import {MiscellaneousComponents} from "../components/Miscellaneous.Components";
import {MiscellaneousEmbed} from "../embeds/Miscellaneous.Embed";
import {CoreEmbed} from "../embeds/Core.Embed";
import {CoreComponents} from "../components/Core.Components";
import {UpperEmbed} from "../embeds/Upper.Embed";
import {UpperComponents} from "../components/Upper.Components";
import {SpecialtyEmbed} from "../embeds/Specialty.Embed";
import {SpecialtyComponents} from "../components/Specialty.Components";
import * as config from "../config.json";

export const RegisterCommand = new Command(
    new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Creates a various-purpose menu.")
        .addStringOption(option => option
            .setName("menu_name")
            .setDescription("The name of the menu to setup")
            .setRequired(true)
            .setChoices(
                {name: "verification", value: "verification_menu"},
                {name: "miscellaneous", value: "miscellaneous_menu"},
                {name: "core", value: "core_menu"},
                {name: "upper", value: "upper_menu"},
                {name: "specialty", value: "specialty_menu"},
            )
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            await interaction.reply({content: `You are not permitted to use this command.`, ephemeral: true});
            return;
        }

        const menuName = interaction.options.getString("menu_name");
        switch(menuName) {
            case "verification_menu": await interaction.channel.send(buildVerificationMenu()); break;
            case "miscellaneous_menu": await interaction.channel.send(buildMiscellaneousMenu()); break;
            case "core_menu": await interaction.channel.send(buildCoreMenu()); break;
            case "upper_menu": await interaction.channel.send(buildUpperMenu()); break;
            case "specialty_menu": await interaction.channel.send(buildSpecialtyMenu()); break;
        }
        await interaction.reply({content: "Success", ephemeral: true});
    }
)


function buildVerificationMenu(): MessageReplyOptions {
    const embed = new PurdueEmbed();
    const row = new PurdueRow(config.guild.roles.specialty.verified, config.guild.emotes.purdue);
    return ({embeds: [embed], components: [row]});
}

function buildMiscellaneousMenu(): MessageReplyOptions {
    const embed = new MiscellaneousEmbed();
    const components = new MiscellaneousComponents();
    return ({embeds: [embed], components: components});
}

function buildCoreMenu(): MessageReplyOptions {
    const embed = new CoreEmbed();
    const components = new CoreComponents();
    return ({embeds: [embed], components: components});
}

function buildUpperMenu(): MessageReplyOptions {
    const embed = new UpperEmbed();
    const components = new UpperComponents();
    return ({embeds: [embed], components: components});
}

function buildSpecialtyMenu(): MessageReplyOptions {
    const embed = new SpecialtyEmbed();
    const row = new SpecialtyComponents();
    return ({embeds: [embed], components: row});
}