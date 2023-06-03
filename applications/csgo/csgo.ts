import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {Events, Interaction, TextChannel} from "discord.js";
import {Database} from "../../Database";
import {Player} from "../../Player";
import {GameType} from "../../Game";
import {Student} from "../../Student";
import {CSGOApp} from "./CSGOApp";
import {Router} from "../../Router";

SourceMaps.install();

const CSGO = new CSGOApp();

CSGO.client.login(config.token).then(() => {
    CSGO.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const queueChannel = await CSGO.guild.channels.fetch(config.guild.channels.queue) as TextChannel;
        await CSGO.queue.load(queueChannel);
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
            await command.execute(interaction, CSGO);
        } catch (error) {
            CSGO.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) await interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true});
            else await interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true});
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId.startsWith("page")) {
                await CSGO.handleLeaderboardButton(interaction);
                return;
            }

            if (interaction.customId == "join") {
                await CSGO.handleQueueJoinButton(interaction, player, CSGO.queue);
                return;
            }

            if (interaction.customId == "leave") {
                await CSGO.handleQueueLeaveButton(interaction, player, CSGO.queue);
                return;
            }

            if (interaction.customId == "bump") {
                await CSGO.handleQueueBumpButton(interaction, player, CSGO.queue);
                return;
            }

            const role = await CSGO.guild.roles.fetch(interaction.customId);
            const member = await CSGO.guild.members.fetch(user.id);

            if (role.id == config.guild.roles.purdue) {
                await CSGO.handlePurdueButton(interaction, student, member, role.id);
                return;
            }

            if (role.id == config.guild.roles.tenmans) {
                if (await CSGO.handlePlayerButton(interaction, player)) return;
            }

            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role.id);
                await interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                return;
            } else {
                await member.roles.add(role.id);
                await interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                return;
            }

        } catch (error) {
            CSGO.logger.error(`Button by ${user.username} errored`, error);
            try {
                if (interaction.replied) await interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true});
                else await interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true});
            } catch {}
        }
    }

    if (interaction.isStringSelectMenu()) {
        try {
            await CSGO.handlePlayerPickMenu(interaction);
            return;
        } catch (error) {
            CSGO.logger.error(`Menu by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {

        try {

            const name = interaction.customId;

            if (name == "register") {
                await CSGO.handlePlayerModal(interaction, config.guild.roles.tenmans);
                return;
            }

            if (name == "wallyball") {
                await CSGO.handleWallyballModal(interaction, null);
                return;
            }

            if (name == "purdue") {
                await CSGO.handlePurdueModal(user, interaction);
                return;
            }

        } catch (error) {
            CSGO.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) await interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true});
            else await interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true});
        }
    }
});

Router.express.get(`/activate/:id`, (request, response) => {
    CSGO.handleAutomaticRole(request, response, config.guild.roles.purdue).catch(error =>
        CSGO.logger.error("Error Applying Automatic Role", error)
    );
});

Router.express.get(`/invalid/:id`, (request: Request, response: Response) => {
    CSGO.handleUnreachableEmail(request, response).catch(error =>
        CSGO.logger.error("Error handling unreachable email", error)
    );
});
