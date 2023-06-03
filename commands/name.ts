import {GlobalCommand} from "../Command";
import {SlashCommandBuilder} from "discord.js";
import {WallyballModal} from "../modals/Wallyball.Modal";

export const NameCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("name")
        .setDescription("Update your first and last name."),
    async function execute(interaction, application) {
        const modal = new WallyballModal();
        await interaction.showModal(modal);
    }
)