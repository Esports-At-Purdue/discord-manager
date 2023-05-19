import {AttachmentBuilder, SlashCommandBuilder} from "discord.js";
import {LeaderboardRow} from "../components/Leaderboard.Row";
import {GlobalCommand} from "../Command";
import {Database} from "../Database";
import {GameType} from "../Game";

export const LeaderboardCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the Leaderboard')
        .addStringOption((string) => string
            .setName("game")
            .setDescription("The game for which the leaderboard is associated")
            .setRequired(false)
            .setChoices(
                {name: "CSGO", value: "csgo"},
                {name: "Siege", value: "siege"},
                {name: "Overwatch", value: "overwatch"},
                {name: "Valorant", value: "valorant"},
                {name: "Wallyball", value: "wallyball"},
            )
        )
        .addIntegerOption((option) => option
            .setName('page')
            .setDescription('The page of the leaderboard')
            .setRequired(false)
            .setMinValue(1)
        )
    ,
    async function execute(interaction, application) {
        await interaction.deferReply();
        const game = interaction.options.getString("game") as GameType ?? application.game ?? GameType.CSGO;
        const totalPlayers = await Database.getTotalPlayers(game);
        const maxPages = Math.ceil(totalPlayers / 5);
        const page = Math.min(interaction.options.getInteger('page') ?? 1, maxPages);
        const filePath = `../../media/leaderboards/${game}/${page}.png`;

        try {
            const attachment = new AttachmentBuilder(filePath);
            const actionRow = new LeaderboardRow(game, page, maxPages);
            await interaction.editReply({files: [attachment], components: [actionRow]});
        } catch (error) {
            const reply = await interaction.editReply({content: `Sorry, this leaderboard is not currently available`});
            setTimeout(() => reply.delete(), 5000);
        }
    }
);