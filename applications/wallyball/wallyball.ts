import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {
    Events,
    Interaction,
    TextBasedChannel
} from "discord.js";
import {WallyballApp} from "./WallyballApp";
import {Database} from "../../Database";
import {GameType} from "../../Game";

SourceMaps.install();

const Wallyball = new WallyballApp();

Wallyball.client.login(config.token).then(() => {
    Wallyball.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const channel = await Wallyball.guild.channels.fetch(config.guild.channels.queue) as TextBasedChannel;
        Wallyball.queue.load(channel).catch();
        Database.updateRankings(GameType.Wallyball, Wallyball).catch();
    });
});

Wallyball.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;

    if (interaction.isChatInputCommand()) {
        const command = Wallyball.commands.get(interaction.commandName);

        try {
            command.execute(interaction, Wallyball).catch();
        } catch (error) {
            Wallyball.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId.startsWith("page")) {
                const game = interaction.customId.split("-")[2];
                const pageNumber = Number.parseInt(interaction.customId.split("-")[1]);
                Wallyball.handleLeaderboardButton(interaction, game as GameType, pageNumber).catch();
                return;
            }

        } catch (error) {
            Wallyball.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {
        const name = interaction.customId;

        try {

            if (name == "wallyball") {
                Wallyball.handleWallyballModal(interaction, config.guild.roles.wallyball).catch();
                return;
            }
        } catch (error) {
            Wallyball.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});