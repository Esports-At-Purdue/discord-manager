import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {
    CategoryChannel,
    Events,
    GuildMember,
    Interaction,
    Message,
    TextBasedChannel,
} from "discord.js";
import {PuggApp} from "./PuggApp";
import {Student} from "../../Student";
import {Ticket} from "../../Ticket";
import {Router} from "../../Router";

SourceMaps.install();

export const Pugg = new PuggApp();

Pugg.client.login(config.token).then(() => {
    Pugg.load(config.token, config.guild.id, config.guild.channels.logs).catch();
});

Pugg.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;
    const student = await Student.fetch(user.id);

    if (interaction.isChatInputCommand()) {
        const command = Pugg.commands.get(interaction.commandName);

        try {
            command.execute(interaction, Pugg).catch();
        } catch (error) {
            Pugg.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId == "close") {
                const ticket = await Ticket.fetch(interaction.channelId);
                ticket.close(interaction).catch()
                return;
            }

            const role = await Pugg.guild.roles.fetch(interaction.customId);
            const member = interaction.member as GuildMember;

            if (role.id == config.guild.roles.purdue) {
                Pugg.handlePurdueButton(interaction, student, member, role.id).catch();
                return;
            }

            if (Object.values(config.guild.roles.esports).includes(role.id)) {
                if (member.roles.cache.has(role.id)) {
                    member.roles.remove(role.id).catch();
                    interaction.reply({content: `You removed **<@&${role.id}>**. You must open a new ticket to add it back.`, ephemeral: true}).catch();
                    return;
                }

                if (!student) {
                    interaction.reply({content: `You must verify yourself as a student first. <#${config.guild.channels.verify}>`, ephemeral: true}).catch();
                    return;
                }

                const openTicket = await Ticket.fetchByStudent(student);

                if (openTicket) {
                    interaction.reply({content: `You already have a ticket open in <#${openTicket.id}>`, ephemeral: true}).catch();
                    return;
                }

                const parentCategory = await Pugg.guild.channels.fetch(config.guild.channels.support);
                const ticket = await Ticket.open(student, Pugg, parentCategory as CategoryChannel, role.name);
                ticket.save().catch();
                interaction.reply({content: `A ticket has been opened in <#${ticket.id}>`, ephemeral: true}).catch();
                return;
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true}).catch();
                return;
            } else {
                member.roles.add(role.id).catch();
                interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true}).catch();
                return;
            }


        } catch (error) {
            Pugg.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {
        const name = interaction.customId;

        try {
            if (name == "purdue") {
                Pugg.handlePurdueModal(user, interaction).catch();
                return;
            }
        } catch (error) {
            Pugg.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isStringSelectMenu()) {

        try {

            const role = await Pugg.guild.roles.fetch(interaction.values[0]);
            const member = await Pugg.guild.members.fetch(user.id);

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true}).catch();
            } else {
                member.roles.add(role.id).catch();
                interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true}).catch();
            }
            return;

        } catch (error) {
            Pugg.logger.error(`Menu by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

Pugg.client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const channel = await Pugg.guild.channels.fetch(config.guild.channels.join) as TextBasedChannel;
    channel.send({content: `${member.nickname} has joined.`}).catch();
});

Pugg.client.on(Events.GuildMemberRemove, async (member: GuildMember) => {
    const channel = await Pugg.guild.channels.fetch(config.guild.channels.leave) as TextBasedChannel;
    channel.send({content: `**${member.user.username}** has left.`}).catch();
});

Pugg.client.on(Events.MessageCreate, (message: Message) => {

});

Router.express.get(`/activate/:id`, (request, response) => {
    Pugg.handleAutomaticRole(request, response, config.guild.roles.purdue).catch(error =>
        Pugg.logger.error("Error Applying Automatic Role", error)
    );
});