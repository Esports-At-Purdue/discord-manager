import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {Colors, EmbedBuilder, Events, GuildAuditLogsEntry, Interaction, TextChannel, AuditLogEvent} from "discord.js";
import {Database} from "../../Database";
import {Player} from "../../Player";
import {GameType} from "../../Game";
import {Student} from "../../Student";
import {Router} from "../../Router";
import {OverwatchApp} from "./OverwatchApp";

SourceMaps.install();

const Overwatch = new OverwatchApp();

Overwatch.client.login(config.token).then(() => {
    Overwatch.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {
        const channel = await Overwatch.guild.channels.fetch(config.guild.channels.queue) as TextChannel;
        await Overwatch.queue.load(channel).catch();
        await Database.updateRankings(GameType.Overwatch, Overwatch);
    });
});

Overwatch.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;
    const player = await Player.fetch(user.id);
    const student = await Student.fetch(user.id);

    if (interaction.isChatInputCommand()) {
        const command = Overwatch.commands.get(interaction.commandName);

        try {
            command.execute(interaction, Overwatch).catch();
        } catch (error) {
            Overwatch.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId.startsWith("page")) {
                const game = interaction.customId.split("-")[1];
                const pageNumber = Number.parseInt(interaction.customId.split("-")[2]);
                Overwatch.handleLeaderboardButton(interaction, game as GameType, pageNumber).catch();
            }

            if (interaction.customId == "join") {
                Overwatch.handleQueueJoinButton(interaction, player, Overwatch.queue).catch();
                return;
            }

            if (interaction.customId == "leave") {
                Overwatch.handleQueueLeaveButton(interaction, player, Overwatch.queue).catch();
                return;
            }

            if (interaction.customId == "bump") {
                Overwatch.handleQueueBumpButton(interaction, player, Overwatch.queue).catch();
                return;
            }

            const role = await Overwatch.guild.roles.fetch(interaction.customId);
            const member = await Overwatch.guild.members.fetch(user.id);

            if (role.id == config.guild.roles.purdue) {
                Overwatch.handlePurdueButton(interaction, student, member, role.id).catch();
                return;
            }

            if (role.id == config.guild.roles.pugs) {
                Overwatch.handlePlayerButton(interaction, player).catch();
                // No Return
            }


            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                await interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                return;
            } else {
                member.roles.add(role.id).catch();
                await interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                return;
            }

        } catch (error) {
            Overwatch.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {
        const name = interaction.customId;

        try {

            if (name == "register") {
                Overwatch.handlePlayerModal(interaction, GameType.Overwatch, config.guild.roles.pugs).catch();
                return;
            }

            if (name == "purdue") {
                Overwatch.handlePurdueModal(user, interaction).catch();
                return;
            }

        } catch (error) {
            Overwatch.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

Overwatch.client.on(Events.GuildMemberAdd, async member => {
    const channel = await Overwatch.guild.channels.fetch(config.guild.channels.join) as TextChannel;
    const embed = new EmbedBuilder().setTitle(`${member.user.username} has joined`).setColor("#2f3136");
    await channel.send({content: `${member.user}`, embeds: [embed]});
    const student = await Student.fetch(member.id);
    if (student && student.verified) await member.roles.add(config.guild.roles.purdue);
});

Overwatch.client.on(Events.GuildMemberRemove, async member => {
    const channel = await Overwatch.guild.channels.fetch(config.guild.channels.leave) as TextChannel;
    const embed = new EmbedBuilder().setTitle(`${member.user.username} has left`).setColor("#2f3136");
    await channel.send({embeds: [embed]});
});

Overwatch.client.on(Events.GuildAuditLogEntryCreate, async entry => {
    if (entry.action != AuditLogEvent.MemberBanAdd && entry.action != AuditLogEvent.MemberBanRemove) return;
    const embed = await banEmbed(entry as GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd | AuditLogEvent.MemberBanRemove>);
    const channel = await Overwatch.guild.channels.fetch(config.guild.channels.bans) as TextChannel;
    await channel.send({embeds: [embed]});
});

Router.express.get(`/activate/:id`, (request, response) => {
    Overwatch.handleAutomaticRole(request, response, config.guild.roles.purdue).catch(error =>
        Overwatch.logger.error("Error Applying Automatic Role", error)
    );
});

async function banEmbed(log: GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd | AuditLogEvent.MemberBanRemove> | null): Promise<EmbedBuilder> {

    const targetName = log.target.username;

    if (!log && log.action == AuditLogEvent.MemberBanAdd) {
        return new EmbedBuilder().setTitle(`${targetName} was banned but no audit log could be found.`).setColor(Colors.Red)
    } else if (!log && log.action == AuditLogEvent.MemberBanRemove) {
        return new EmbedBuilder().setTitle(`${targetName} was unbanned but no audit log could be found.`).setColor(Colors.Green)
    }

    if (log.action == AuditLogEvent.MemberBanAdd) {
        return new EmbedBuilder()
            .setTitle(`${targetName} was banned by the mighty ${log.executor.username}`)
            .setDescription(`Reason: ${log.reason ?? "None Provided"}`)
            .setColor(Colors.Red)
    } else {
        return new EmbedBuilder()
            .setTitle(`${targetName} was unbanned by the mighty ${log.executor.username}`)
            .setColor(Colors.Green)
    }
}