import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {
    AttachmentBuilder,
    Colors,
    Events,
    Interaction,
    TextBasedChannel
} from "discord.js";
import {ValorantApp} from "./ValorantApp";
import {Database} from "../../Database";
import {LeaderboardRow} from "../../components/Leaderboard.Row";
import {Player, PlayerStats} from "../../Player";
import {GameType} from "../../Game";
import {PlayerModal} from "../../modals/Player.Modal";
import {Student} from "../../Student";
import {PurdueModal} from "../../modals/Purdue.Modal";
import {Verifier} from "../../Verifier";
import {WallyballModal} from "../wallyball/modals/Wallyball.Modal";

SourceMaps.install();

export const Valorant = new ValorantApp();

Valorant.client.login(config.token).then(() => {
    Valorant.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const channel = await Valorant.guild.channels.fetch(config.guild.channels.queue) as TextBasedChannel;
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

                await interaction.deferUpdate();
                const page = Number.parseInt(interaction.customId.slice(5));
                const maxPages = Math.ceil(await Database.players.countDocuments() / 5);
                const actionRow = new LeaderboardRow(page, maxPages);
                const filePath = `./media/${page}-leaderboard.png`;
                const image = new AttachmentBuilder(filePath);
                interaction.editReply({content: null, files: [image], components: [actionRow]}).catch();
                return;
            }

            if (interaction.customId == "join") {
                if (!player) {
                    const modal = new PlayerModal();
                    interaction.showModal(modal).catch();
                    return;
                }
                if (Valorant.queue.queue.has(player.id)) {
                    interaction.reply({content: `You are already in the queue.`, ephemeral: true}).catch();
                    return;
                }

                Valorant.queue.join(player, interaction);
                if (Valorant.queue.queue.size != Valorant.queue.capacity || Valorant.queue.capacity > 0) return;
                Valorant.queue.update(`A new Game has began!`, Colors.Gold).catch();
                for (const entry of Valorant.queue.queue) clearTimeout(entry[1]);
                // ToDo New Game
                Valorant.queue.queue = new Map();

            }

            if (interaction.customId == "leave") {
                if (!player) {
                    const modal = new PlayerModal();
                    interaction.showModal(modal).catch();
                    return;
                }
                if (!Valorant.queue.queue.has(player.id)) {
                    interaction.reply({content: `You are not in the queue.`, ephemeral: true}).catch();
                    return;
                }
                Valorant.queue.leave(player);
            }

            if (interaction.customId == "bump") {
                if (!player) {
                    const modal = new PlayerModal();
                    interaction.showModal(modal).catch();
                    return;
                }
                Valorant.queue.bump(player);
            }

            const role = await Valorant.guild.roles.fetch(interaction.customId);
            const member = await Valorant.guild.members.fetch(user.id);

            if (role.id == config.guild.roles.purdue) {
                if (student && student.verified) {
                    member.roles.add(role.id).catch();
                    interaction.reply({content: `You are verified. Thank you!`, ephemeral: true}).catch();
                    return;
                }

                const modal = new PurdueModal();
                interaction.showModal(modal).catch();
                return;
            }

            if (role.id == config.guild.roles.tenmans) {
                if (!player) {
                    const modal = new PlayerModal();
                    interaction.showModal(modal).catch();
                    return;
                }
            }

            if (role.id == config.guild.roles.wallyball) {
                if (!player || !player.firstName || !player.lastName) {
                    const modal = new WallyballModal();
                    interaction.showModal(modal).catch();
                    return;
                }
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

        try {

            const name = interaction.customId;

            if (name == "register") {
                const username = interaction.fields.getTextInputValue("username");
                const member = await Valorant.guild.members.fetch(interaction.user.id);
                let player = await Player.fetch(interaction.user.id);

                if (!player) {
                    player = new Player(interaction.user.id, null, null, username, PlayerStats.newStats());
                }

                player.save().catch();
                member.roles.add(config.guild.roles.tenmans).catch();
                interaction.reply({content: `You have been registered as ${player.getName(GameType.Valorant)}.`, ephemeral: true}).catch();
                Database.updateRankings(GameType.Valorant, Valorant).catch();
                return;
            }

            if (name == "wallyball") {
                const firstName = interaction.fields.getTextInputValue("first-name");
                const lastName = interaction.fields.getTextInputValue("last-name");
                const member = await Valorant.guild.members.fetch(interaction.user.id);
                let player = await Player.fetch(interaction.user.id);

                if (!player) {
                    player = new Player(interaction.user.id, firstName, lastName, interaction.user.username, PlayerStats.newStats());
                }

                player.save().catch();
                member.roles.add(config.guild.roles.wallyball).catch();
                interaction.reply({content: `You have been registered as ${player.getName(GameType.Wallyball)}.`, ephemeral: true}).catch();
                Database.updateRankings(GameType.Wallyball, Valorant).catch();
                return;
            }

            if (name == "purdue") {
                const email = interaction.fields.getTextInputValue("email");

                if (!Verifier.isValidEmail(email)) {
                    interaction.reply({content: `Sorry, address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.`, ephemeral: true}).catch();
                    return;
                }

                Verifier.registerNewStudent(user, email, interaction).catch();
                interaction.reply({content: `A Verification Email has been sent to \`${email}\`.`, ephemeral: true}).catch();
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