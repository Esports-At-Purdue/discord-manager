import {GlobalCommand} from "../Command";
import {SlashCommandBuilder} from "discord.js";
import {PlayerModal} from "../modals/Player.Modal";

export const UsernameCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("username")
        .setDescription("Update your player username."),
    async function execute(interaction, application) {
        const modal = new PlayerModal();
        await interaction.showModal(modal);
    }
)