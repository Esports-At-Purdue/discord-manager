import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {Events, Interaction, TextBasedChannel} from "discord.js";
import {Database} from "../../Database";
import {Player} from "../../Player";
import {GameType} from "../../Game";
import {Student} from "../../Student";
import {CSGOApp} from "./CSGOApp";
import {Router} from "../../Router";

SourceMaps.install();

export const CSGO = new CSGOApp();

CSGO.client.login(config.token).then(() => {
    CSGO.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const channel = await CSGO.guild.channels.fetch(config.guild.channels.queue) as TextBasedChannel;
        await CSGO.queue.load(channel).catch();
        await Database.updateRankings(GameType.CSGO, CSGO);
    });
});

CSGO.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;
    const player = await Player.fetch(user.id);
    const student = await Student.fetch(user.id);

    if (interaction.isChatInputCommand()) {
        const command = CSGO.commands.get(interaction.commandName);

        try {
            command.execute(interaction, CSGO).catch();
        } catch (error) {
            CSGO.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId.startsWith("page")) {
                const game = interaction.customId.split("-")[1];
                const pageNumber = Number.parseInt(interaction.customId.split("-")[2]);
                CSGO.handleLeaderboardButton(interaction, game as GameType, pageNumber).catch();
            }

            if (interaction.customId == "join") {
                CSGO.handleQueueJoinButton(interaction, player, CSGO.queue).catch();
                return;
            }

            if (interaction.customId == "leave") {
                CSGO.handleQueueLeaveButton(interaction, player, CSGO.queue).catch();
                return;
            }

            if (interaction.customId == "bump") {
                CSGO.handleQueueBumpButton(interaction, player, CSGO.queue).catch();
                return;
            }

            const role = await CSGO.guild.roles.fetch(interaction.customId);
            const member = await CSGO.guild.members.fetch(user.id);

            if (role.id == config.guild.roles.purdue) {
                CSGO.handlePurdueButton(interaction, student, member, role.id).catch();
                return;
            }

            if (role.id == config.guild.roles.tenmans) {
                CSGO.handlePlayerButton(interaction, player).catch();
                // No Return
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                return;
            } else {
                member.roles.add(role.id).catch();
                interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                return;
            }

        } catch (error) {
            CSGO.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {

        try {

            const name = interaction.customId;

            if (name == "register") {
                CSGO.handlePlayerModal(interaction, GameType.CSGO, config.guild.roles.tenmans).catch();
                return;
            }

            if (name == "purdue") {
                CSGO.handlePurdueModal(user, interaction).catch();
                return;
            }

        } catch (error) {
            CSGO.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

Router.express.get(`/activate/:id`, (request, response) => {
    CSGO.handleAutomaticRole(request, response, config.guild.roles.purdue).catch(error =>
        CSGO.logger.error("Error Applying Automatic Role", error)
    );
});
