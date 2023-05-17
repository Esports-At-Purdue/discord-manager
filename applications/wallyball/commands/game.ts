import {Command} from "../../../Command";
import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {GameType} from "../../../Game";
import {GameModal} from "../../../modals/Game.Modal";

export const GameCommand = new Command(
    new SlashCommandBuilder()
        .setName("game")
        .setDescription("general purpose game command")

        .addSubcommand((command) => command
            .setName("record")
            .setDescription("Record a new game")
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const command = interaction.options.getSubcommand();

        if (command == "record") {

            const gameModal = new GameModal();
            interaction.showModal(gameModal).catch();
            return;
        }
    }
)