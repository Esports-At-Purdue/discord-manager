import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {ChatInputCommandInteraction, Events, Interaction, Message, MessageReaction, User} from "discord.js";
import {Request, Response} from "express";
import {Verifier} from "../../Verifier";
import {GlobalCommand} from "../../Command";
import {MathApp} from "./MathApp";

SourceMaps.install();
export const Math = new MathApp();

Math.client.login(config.token).then(() => {
    Math.load(config.token, config.guild.id, config.guild.channels.logs).catch();
});

Math.client.on(Events.InteractionCreate, (interaction: Interaction) => {
    const user = interaction.user;

    if (interaction instanceof ChatInputCommandInteraction) {
        const command = Math.commands.get(interaction.commandName);

        try {
            if (command instanceof GlobalCommand) command.execute(interaction, Math);
            else command.execute(interaction);
        } catch (error) {
            Math.logger.error(`Command by ${user.username} errored`, error);
            interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

Math.client.on(Events.MessageReactionAdd, (reaction: MessageReaction, user: User) => {

});

Math.client.on(Events.MessageReactionRemove, (reaction: MessageReaction, user: User) => {

});

Math.client.on(Events.MessageCreate, (message: Message) => {

});

/*
Router.get("/activate/:id", (request: Request, response: Response) => {
    const memberId = request?.params?.id;
    Math.guild.members.fetch(memberId).then((member) => {
        if (!member) return;
        if (member.roles.cache.has(config.guild.roles.purdue)) return;
        member.roles.add(config.guild.roles.purdue).catch();
        const timeout = Verifier.remove(memberId);
        if (!timeout) return;
        clearTimeout(timeout.timeout);
        timeout.interaction.followUp({content: `Hey <@${memberId}>, you have successfully been verified. Thank you!`, ephemeral: true}).catch();
    });
});
 */