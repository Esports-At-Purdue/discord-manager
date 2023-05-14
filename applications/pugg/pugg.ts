import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import * as express from "express";
import {Request, Response} from "express";
import {
    ButtonInteraction,
    CategoryChannel,
    Events,
    GuildMember,
    Interaction,
    Message,
    ModalSubmitInteraction, SelectMenuInteraction, TextBasedChannel,
} from "discord.js";
import {Verifier} from "../../Verifier";
import {PuggApp} from "./PuggApp";
import {Student} from "../../Student";
import {Ticket} from "../../Ticket";
import {PurdueModal} from "../../modals/Purdue.Modal";

SourceMaps.install();

export const Pugg = new PuggApp();
const Router = express.Router();

Pugg.client.login(config.token).then(() => {
    Pugg.load(config.token, config.guild.id, config.guild.channels.logs).catch();
    Router.use(express.json());
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

    if (interaction instanceof ButtonInteraction) {

        try {

            if (interaction.customId == "close") {
                const ticket = await Ticket.fetch(interaction.channelId);
                ticket.close(interaction).catch()
                return;
            }

            const role = await Pugg.guild.roles.fetch(interaction.customId);
            const member = interaction.member as GuildMember;

            if (role.id == config.guild.roles.purdue) {
                if (student) {
                    member.roles.add(role.id).catch();
                    interaction.reply({content: `You are verified. Thank you!`, ephemeral: true}).catch();
                    return;
                }

                const modal = new PurdueModal();
                interaction.showModal(modal).catch();
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

                const parentCategory = await Pugg.guild.channels.fetch(config.guild.channels.tickets) as CategoryChannel;
                const ticket = await Ticket.open(student, Pugg, parentCategory, role.name);
                ticket.save().catch();
                interaction.reply({content: `A ticket has been opened in <#${ticket.id}>`, ephemeral: true}).catch();
                return;
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true}).catch();
            } else {
                member.roles.add(role.id).catch();
                interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true}).catch();
            }
            return;

        } catch (error) {
            Pugg.logger.error(`Button by ${user.username} errored`, error);
            interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction instanceof ModalSubmitInteraction) {
        const email = interaction.fields.getTextInputValue("email");

        try {

            if (!Verifier.isValidEmail(email)) {
                interaction.reply({content: `Sorry, address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.`, ephemeral: true}).catch();
                return;
            }

            Verifier.registerNewStudent(user, email, interaction);
            interaction.reply({content: `A Verification Email has been sent to \`${email}\`.`, ephemeral: true}).catch();
            return;

        } catch (error) {
            Pugg.logger.error(`Modal by ${user.username} errored`, error);
            interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction instanceof SelectMenuInteraction) {

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
            interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
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

Router.get("/activate/:id", (request: Request, response: Response) => {
    const memberId = request?.params?.id;
    Pugg.guild.members.fetch(memberId).then((member) => {
        if (!member) return;
        if (member.roles.cache.has(config.guild.roles.purdue)) return;
        member.roles.add(config.guild.roles.purdue).catch();
        const timeout = Verifier.remove(memberId);
        if (!timeout) return;
        clearTimeout(timeout.timeout);
        timeout.interaction.followUp({content: `Hey <@${memberId}>, you have successfully been verified. Thank you!`, ephemeral: true}).catch();
    });
});