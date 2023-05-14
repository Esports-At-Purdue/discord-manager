import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {
    AttachmentBuilder,
    Colors,
    Events,
    Interaction,
    TextBasedChannel
} from "discord.js";
import {Database} from "../../Database";
import {LeaderboardRow} from "../../components/Leaderboard.Row";
import {Player, PlayerStats} from "../../Player";
import {GameType} from "../../Game";
import {PlayerModal} from "../../modals/Player.Modal";
import {Student} from "../../Student";
import {PurdueModal} from "../../modals/Purdue.Modal";
import {Verifier} from "../../Verifier";
import {CSGOApp} from "./CSGOApp";

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
                if (CSGO.queue.queue.has(player.id)) {
                    interaction.reply({content: `You are already in the queue.`, ephemeral: true}).catch();
                    return;
                }

                CSGO.queue.join(player, interaction);
                if (CSGO.queue.queue.size != CSGO.queue.capacity || CSGO.queue.capacity > 0) return;
                CSGO.queue.update(`A new Game has began!`, Colors.Gold).catch();
                for (const entry of CSGO.queue.queue) clearTimeout(entry[1]);
                // ToDo New Game
                CSGO.queue.queue = new Map();

            }

            if (interaction.customId == "leave") {
                if (!player) {
                    const modal = new PlayerModal();
                    interaction.showModal(modal).catch();
                    return;
                }
                if (!CSGO.queue.queue.has(player.id)) {
                    interaction.reply({content: `You are not in the queue.`, ephemeral: true}).catch();
                    return;
                }
                CSGO.queue.leave(player);
            }

            if (interaction.customId == "bump") {
                if (!player) {
                    const modal = new PlayerModal();
                    interaction.showModal(modal).catch();
                    return;
                }
                CSGO.queue.bump(player);
            }

            const role = await CSGO.guild.roles.fetch(interaction.customId);
            const member = await CSGO.guild.members.fetch(user.id);

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
                const username = interaction.fields.getTextInputValue("username");
                const member = await CSGO.guild.members.fetch(interaction.user.id);
                let player = await Player.fetch(interaction.user.id);

                if (!player) {
                    player = new Player(interaction.user.id, null, null, username, PlayerStats.newStats());
                }

                player.save().catch();
                member.roles.add(config.guild.roles.tenmans).catch();
                interaction.reply({content: `You have been registered as ${player.getName(GameType.CSGO)}.`, ephemeral: true}).catch();
                Database.updateRankings(GameType.CSGO, CSGO).catch();
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
            CSGO.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});