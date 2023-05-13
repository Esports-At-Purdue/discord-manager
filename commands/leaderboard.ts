import {AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {LeaderboardRow} from "../components/Leaderboard.Row";
import {Application} from "../Application";
import {GlobalCommand} from "../Command";
import {Database} from "../Database";
import {GameType} from "../Game";

export const leaderboardCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the Leaderboard')
        .addStringOption((string) => string
            .setName("game")
            .setDescription("The game for which the leaderboard is associated")
            .setRequired(true)
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
    async function execute(interaction: ChatInputCommandInteraction, application: Application) {
        await interaction.deferReply();

        const maxPages = Math.ceil(await Database.players.countDocuments() / 5);
        const page =  Math.min(interaction.options.getInteger('page') ?? 1, maxPages);
        const game = interaction.options.getString("game") as GameType;
        const filePath = `./media/${game}/leaderboards/${page}.png`;
        const attachment = new AttachmentBuilder(filePath);
        const actionRow = new LeaderboardRow(page, maxPages);

        interaction.editReply({files: [attachment], components: [actionRow]}).catch();
    }
)
