import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {WallyballModal} from "../modals/Wallyball.Modal";
import {Command} from "../../../Command";
import {Player} from "../../../Player";
import {GameType} from "../../../Game";

module.exports = {
    command: new Command(
        new SlashCommandBuilder()
            .setName("register")
            .setDescription("Sign up for Wallyball!"),
        async function execute(interaction: ChatInputCommandInteraction) {
            const player = await Player.fetch(interaction.user.id);

            if (player && player.firstName && player.lastName) {
                await interaction.reply({content: `You are already registered as ${player.getName(GameType.Wallyball)}`, ephemeral: true});
                return;
            }

            interaction.showModal(new WallyballModal()).catch();
        }
    )
}