import {CSMemersApp} from "./CSMemersApp";
import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import * as express from "express";
import {ChatInputCommandInteraction, Events, Interaction, Message, MessageReaction, User} from "discord.js";
import {Request, Response} from "express";
import {Verifier} from "../../Verifier";
import {GlobalCommand} from "../../Command";

SourceMaps.install();
export const CSMemers = new CSMemersApp();
const Router = express.Router();

CSMemers.client.login(config.token).then(() => {
   CSMemers.load(config.token, config.guild.id, config.guild.channels.logs).catch();
   Router.use(express.json());
});

CSMemers.client.on(Events.InteractionCreate, (interaction: Interaction) => {
   const user = interaction.user;

   if (interaction instanceof ChatInputCommandInteraction) {
      const command = CSMemers.commands.get(interaction.commandName);

      try {
         if (command instanceof GlobalCommand) command.execute(interaction, CSMemers);
         else command.execute(interaction);
      } catch (error) {
         CSMemers.logger.error(`Command by ${user.username} errored`, error);
      }
   }
});

CSMemers.client.on(Events.MessageReactionAdd, (reaction: MessageReaction, user: User) => {

});

CSMemers.client.on(Events.MessageReactionRemove, (reaction: MessageReaction, user: User) => {

});

CSMemers.client.on(Events.MessageCreate, (message: Message) => {

});

Router.get("/activate/:id", (request: Request, response: Response) => {
   const memberId = request?.params?.id;
   CSMemers.guild.members.fetch(memberId).then((member) => {
      if (!member) return;
      if (member.roles.cache.has(config.guild.roles.specialty.verified)) return;
      member.roles.add(config.guild.roles.specialty.verified).catch();
      const timeout = Verifier.remove(memberId);
      if (!timeout) return;
      clearTimeout(timeout.timeout);
      timeout.interaction.followUp({content: `Hey <@${memberId}>, you have successfully been verified. Thank you!`, ephemeral: true}).catch();
   });
});