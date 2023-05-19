import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {Events, Interaction, Role, TextChannel} from "discord.js";
import {SiegeApp} from "./SiegeApp";
import {Database} from "../../Database";
import {Player} from "../../Player";
import {GameType} from "../../Game";
import {Student} from "../../Student";
import {Router} from "../../Router";

SourceMaps.install();

const Siege = new SiegeApp();

Siege.client.login(config.token).then(() => {
    Siege.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const channel = await Siege.guild.channels.fetch(config.guild.channels.queue) as TextChannel;
        await Siege.queue.load(channel).catch();
        await Database.updateRankings(GameType.Siege, Siege);
    });
});

Siege.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;
    const player = await Player.fetch(user.id);
    const student = await Student.fetch(user.id);

    if (interaction.isChatInputCommand()) {
        const command = Siege.commands.get(interaction.commandName);

        try {
            command.execute(interaction, Siege).catch();
        } catch (error) {
            Siege.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId.startsWith("page")) {
                const game = interaction.customId.split("-")[1];
                const pageNumber = Number.parseInt(interaction.customId.split("-")[2]);
                Siege.handleLeaderboardButton(interaction, game as GameType, pageNumber).catch();
            }

            if (interaction.customId == "join") {
                Siege.handleQueueJoinButton(interaction, player, Siege.queue).catch();
                return;
            }

            if (interaction.customId == "leave") {
                Siege.handleQueueLeaveButton(interaction, player, Siege.queue).catch();
                return;
            }

            if (interaction.customId == "bump") {
                Siege.handleQueueBumpButton(interaction, player, Siege.queue).catch();
                return;
            }

            const role = await Siege.guild.roles.fetch(interaction.customId);
            const member = await Siege.guild.members.fetch(user.id);

            if (role.id == config.guild.roles.purdue) {
                Siege.handlePurdueButton(interaction, student, member, role.id).catch();
                return;
            }

            if (role.id == config.guild.roles.tenmans) {
                Siege.handlePlayerButton(interaction, player).catch();
                // No Return
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                await interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                const reply = getRoleRemovedMessage(role);
                if (reply) interaction.followUp({content: reply, ephemeral: true}).catch()
                return;
            } else {
                member.roles.add(role.id).catch();
                await interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                const reply = getRoleAddedMessage(role);
                if (reply) interaction.followUp({content: reply, ephemeral: true}).catch()
                return;
            }

        } catch (error) {
            Siege.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isStringSelectMenu()) {
        try {

            await interaction.reply({content: `Content unavailable.`, ephemeral: true});
        } catch (error) {
            Siege.logger.error(`Menu by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {
        const name = interaction.customId;

        try {

            if (name == "register") {
                Siege.handlePlayerModal(interaction, GameType.Siege, config.guild.roles.tenmans).catch();
                return;
            }

            if (name == "purdue") {
                Siege.handlePurdueModal(user, interaction).catch();
                return;
            }

        } catch (error) {
            Siege.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

Router.express.get(`/activate/:id`, (request, response) => {
    Siege.handleAutomaticRole(request, response, config.guild.roles.purdue).catch(error =>
        Siege.logger.error("Error Applying Automatic Role", error)
    );
});

function getRoleAddedMessage(role: Role) {
    switch (role.id) {
        case config.guild.roles.ranks.champion: return config.guild.roles.ranks.onMessages.champion;
        case config.guild.roles.ranks.diamond: return config.guild.roles.ranks.onMessages.diamond;
        case config.guild.roles.ranks.emerald: return config.guild.roles.ranks.onMessages.emerald;
        case config.guild.roles.ranks.platinum: return config.guild.roles.ranks.onMessages.platinum;
        case config.guild.roles.ranks.gold: return config.guild.roles.ranks.onMessages.gold;
        case config.guild.roles.ranks.silver: return config.guild.roles.ranks.onMessages.silver;
        case config.guild.roles.ranks.bronze: return config.guild.roles.ranks.onMessages.bronze;
        case config.guild.roles.ranks.copper: return config.guild.roles.ranks.onMessages.copper;
    }
    return null;
}

function getRoleRemovedMessage(role: Role) {
    switch (role.id) {
        case config.guild.roles.ranks.champion: return config.guild.roles.ranks.offMessages.champion;
        case config.guild.roles.ranks.diamond: return config.guild.roles.ranks.offMessages.diamond;
        case config.guild.roles.ranks.emerald: return config.guild.roles.ranks.offMessages.emerald;
        case config.guild.roles.ranks.platinum: return config.guild.roles.ranks.offMessages.platinum;
        case config.guild.roles.ranks.gold: return config.guild.roles.ranks.offMessages.gold;
        case config.guild.roles.ranks.silver: return config.guild.roles.ranks.offMessages.silver;
        case config.guild.roles.ranks.bronze: return config.guild.roles.ranks.offMessages.bronze;
        case config.guild.roles.ranks.copper: return config.guild.roles.ranks.offMessages.copper;
    }
    return null;
}