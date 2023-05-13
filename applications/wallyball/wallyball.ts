import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {
    AttachmentBuilder,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Events,
    Interaction,
    ModalSubmitInteraction,
    TextBasedChannel
} from "discord.js";
import {GlobalCommand} from "../../Command";
import {WallyballApp} from "./WallyballApp";
import {Database} from "../../Database";
import {LeaderboardRow} from "../../components/Leaderboard.Row";
import {Player, PlayerStats} from "../../Player";
import {GameType} from "../../Game";

SourceMaps.install();

export const Wallyball = new WallyballApp();

Wallyball.client.login(config.token).then(() => {
    Wallyball.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const channel = await Wallyball.guild.channels.fetch(config.guild.channels.queue) as TextBasedChannel;
        Wallyball.queue.load(channel).catch();
        Database.updateRankings(GameType.Wallyball, Wallyball).catch();
    });
});

Wallyball.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;

    if (interaction instanceof ChatInputCommandInteraction) {
        const command = Wallyball.commands.get(interaction.commandName);

        try {
            if (command instanceof GlobalCommand) command.execute(interaction, Wallyball);
            else command.execute(interaction);
        } catch (error) {
            Wallyball.logger.error(`Command by ${user.username} errored`, error);
            interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction instanceof ButtonInteraction) {

        try {

            if (interaction.customId.startsWith("page")) {

                await interaction.deferUpdate();
                const page = Number.parseInt(interaction.customId.slice(5));
                const maxPages = Math.ceil(await Database.players.countDocuments() / 5);
                const actionRow = new LeaderboardRow(page, maxPages);
                const filePath = `./media/${page}-leaderboard.png`;
                const image = new AttachmentBuilder(filePath);
                interaction.editReply({content: null, files: [image], components: [actionRow]}).catch();
                return;
            }

        } catch (error) {
            Wallyball.logger.error(`Button by ${user.username} errored`, error);
            interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction instanceof ModalSubmitInteraction) {

        try {

            const firstName = interaction.fields.getTextInputValue("first-name");
            const lastName = interaction.fields.getTextInputValue("last-name");
            const member = await Wallyball.guild.members.fetch(interaction.user.id);
            let player = await Player.fetch(interaction.user.id);

            if (!player) {
                player = new Player(interaction.user.id, firstName, lastName, interaction.user.username, PlayerStats.newStats());
            }

            player.save().catch();
            member.roles.add(config.guild.roles.wallyball).catch();
            interaction.reply({content: `You have been registered as ${player.getName(GameType.Wallyball)}.`, ephemeral: true}).catch();
            Database.updateRankings(GameType.Wallyball, Wallyball).catch();

        } catch (error) {
            Wallyball.logger.error(`Modal by ${user.username} errored`, error);
            interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});