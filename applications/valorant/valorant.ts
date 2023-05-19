import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {Events, Interaction, TextChannel} from "discord.js";
import {ValorantApp} from "./ValorantApp";
import {Database} from "../../Database";
import {Player} from "../../Player";
import {GameType} from "../../Game";
import {Student} from "../../Student";
import {Router} from "../../Router";

SourceMaps.install();

const Valorant = new ValorantApp();

Valorant.client.login(config.token).then(() => {
    Valorant.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const channel = await Valorant.guild.channels.fetch(config.guild.channels.queue) as TextChannel;
        await Valorant.queue.load(channel).catch();
        await Database.updateRankings(GameType.Valorant, Valorant);
    });
});

Valorant.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;
    const player = await Player.fetch(user.id);
    const student = await Student.fetch(user.id);

    if (interaction.isChatInputCommand()) {
        const command = Valorant.commands.get(interaction.commandName);

        try {
            command.execute(interaction, Valorant).catch();
        } catch (error) {
            Valorant.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId.startsWith("page")) {
                const game = interaction.customId.split("-")[1];
                const pageNumber = Number.parseInt(interaction.customId.split("-")[2]);
                Valorant.handleLeaderboardButton(interaction, game as GameType, pageNumber).catch();
            }

            if (interaction.customId == "join") {
                Valorant.handleQueueJoinButton(interaction, player, Valorant.queue).catch();
                return;
            }

            if (interaction.customId == "leave") {
                Valorant.handleQueueLeaveButton(interaction, player, Valorant.queue).catch();
                return;
            }

            if (interaction.customId == "bump") {
                Valorant.handleQueueBumpButton(interaction, player, Valorant.queue).catch();
                return;
            }

            const role = await Valorant.guild.roles.fetch(interaction.customId);
            const member = await Valorant.guild.members.fetch(user.id);

            if (role.id == config.guild.roles.purdue) {
                Valorant.handlePurdueButton(interaction, student, member, role.id).catch();
                return;
            }

            if (role.id == config.guild.roles.tenmans) {
                Valorant.handlePlayerButton(interaction, player).catch();
                // No Return
            }

            if (role.id == config.guild.roles.wallyball) {
                Valorant.handleWallyballButton(interaction, player).catch();
                // No Return
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                const reply = removeRankedRoles(role.id);
                await interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                if (reply) interaction.followUp({content: reply, ephemeral: true}).catch();
                return;
            } else {
                member.roles.add(role.id).catch();
                const reply = applyRankedRoles(role.id);
                await interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                if (reply) interaction.followUp({content: reply, ephemeral: true}).catch();
                return;
            }

        } catch (error) {
            Valorant.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {
        const name = interaction.customId;

        try {

            if (name == "register") {
                Valorant.handlePlayerModal(interaction, GameType.Valorant, config.guild.roles.tenmans).catch();
                return;
            }

            if (name == "wallyball") {
                Valorant.handleWallyballModal(interaction, config.guild.roles.wallyball).catch();
                return;
            }

            if (name == "purdue") {
                Valorant.handlePurdueModal(user, interaction).catch();
                return;
            }

        } catch (error) {
            Valorant.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

function applyRankedRoles(roleId: string) {
    switch (roleId) {
        case config.guild.roles.ranks.radiant: return config.guild.roles.ranks.onMessages.radiant;
        case config.guild.roles.ranks.immortal: return config.guild.roles.ranks.onMessages.immortal;
        case config.guild.roles.ranks.ascendant: return config.guild.roles.ranks.onMessages.ascendant;
        case config.guild.roles.ranks.diamond: return config.guild.roles.ranks.onMessages.diamond;
        case config.guild.roles.ranks.platinum: return config.guild.roles.ranks.onMessages.platinum;
        case config.guild.roles.ranks.gold: return config.guild.roles.ranks.onMessages.gold;
        case config.guild.roles.ranks.silver: return config.guild.roles.ranks.onMessages.silver;
        case config.guild.roles.ranks.bronze: return config.guild.roles.ranks.onMessages.bronze;
        case config.guild.roles.ranks.iron: return config.guild.roles.ranks.onMessages.iron;
    }
    return undefined;
}

function removeRankedRoles(roleId: string) {
    switch (roleId) {
        case config.guild.roles.ranks.radiant: return config.guild.roles.ranks.offMessages.radiant;
        case config.guild.roles.ranks.immortal: return config.guild.roles.ranks.offMessages.immortal;
        case config.guild.roles.ranks.ascendant: return config.guild.roles.ranks.offMessages.ascendant;
        case config.guild.roles.ranks.diamond: return config.guild.roles.ranks.offMessages.diamond;
        case config.guild.roles.ranks.platinum: return config.guild.roles.ranks.offMessages.platinum;
        case config.guild.roles.ranks.gold: return config.guild.roles.ranks.offMessages.gold;
        case config.guild.roles.ranks.silver: return config.guild.roles.ranks.offMessages.silver;
        case config.guild.roles.ranks.bronze: return config.guild.roles.ranks.offMessages.bronze;
        case config.guild.roles.ranks.iron: return config.guild.roles.ranks.offMessages.iron;
    }
    return undefined;
}

Router.express.get(`/activate/:id`, (request, response) => {
    Valorant.handleAutomaticRole(request, response, config.guild.roles.purdue).catch(error =>
        Valorant.logger.error("Error Applying Automatic Role", error)
    );
});