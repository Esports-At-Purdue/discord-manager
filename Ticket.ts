import {
    ActionRowBuilder, ButtonBuilder,
    ButtonInteraction, ButtonStyle,
    CategoryChannel,
    ChannelType,
    EmbedBuilder,
    PermissionsBitField
} from "discord.js";
import {Filter, UpdateFilter, UpdateOptions} from "mongodb";
import {Database} from "./Database";
import {Saveable} from "./Saveable";
import {Student} from "./Student";
import {Application} from "./Application";

export class Ticket implements Saveable {
    public id: string;
    public owner: string;
    public reason: string;
    public content: TicketMessage[];
    public status: TicketStatus;

    constructor(id: string, owner: string, reason: string, content: TicketMessage[], status: TicketStatus) {
        this.id = id;
        this.owner = owner;
        this.reason = reason;
        this.content = content;
        this.status = status;
    }

    public static fromObject(object): Ticket {
        if (!object) return null;
        const content = object.content.map((element) => TicketMessage.fromObject(element));
        return new Ticket(object.id, object.owner, object.reason, content, object.status as TicketStatus);
    }

    public async close(interaction: ButtonInteraction) {
        const channelMessagesPromise = await interaction.channel.messages.fetch({limit: 100})
        this.content = Array.from(channelMessagesPromise).map((element) => {
            const message = element[1];
            return new TicketMessage(message.author.username, message.author.id, message.content);
        }).reverse();
        this.status = TicketStatus.Closed;
        this.save().catch();
        interaction.channel.delete().catch();
    }

    public async save() {
        const query: Filter<any> = {id: this.id};
        const update: UpdateFilter<any> = {$set: this};
        const options: UpdateOptions = {upsert: true};
        await Database.tickets.updateOne(query, update, options);
        return this;
    }

    public static async open(student: Student, application: Application, category: CategoryChannel, reason: string): Promise<Ticket> {
        const ticketChannel = await category.children.create({
            name: `${student.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {id: application.guild.id, deny: [PermissionsBitField.Flags.ViewChannel]},
                {
                    id: student.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
                }
            ]
        });

        const embed = new EmbedBuilder()
            .setTitle(`${reason} Ticket`)
            .setDescription("Please let us know any details relevant to your situation.");
        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(new ButtonBuilder().setCustomId("close").setLabel("Close Ticket").setStyle(ButtonStyle.Danger));

        await ticketChannel.send({embeds: [embed], components: [row]});

        return new Ticket(ticketChannel.id, student.id, reason, [], TicketStatus.Open);
    }

    public static async fetch(id: string): Promise<Ticket> {
        const query = {id: id};
        const document = await Database.tickets.findOne(query);
        if (!document) return null;
        return Ticket.fromObject(document);
    }

    public static async fetchByStudent(student: Student): Promise<Ticket> {
        const query = {owner: student.id, status: TicketStatus.Open};
        const document = await Database.tickets.findOne(query);
        if (!document) return null;
        return Ticket.fromObject(document);
    }
}

export enum TicketStatus {
    Closed,
    Open
}

export class TicketMessage {
    public author: string;
    public authorId: string;
    public content: string;

    constructor(author: string, authorId: string, content: string) {
        this.author = author;
        this.authorId = authorId;
        this.content = content;
    }

    public static fromObject(object): TicketMessage {
        if (!object) return null;
        return new TicketMessage(object.author, object.authorId, object.content);
    }
}