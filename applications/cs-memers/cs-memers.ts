import {CSMemersApp} from "./CSMemersApp";
import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {
   Events,
   Interaction,
   Message,
   MessageInteraction,
   MessageReaction,
   PermissionsBitField,
   TextChannel,
   User
} from "discord.js";
import * as fs from "fs";
import {Reaction} from "./Reaction";
import {Reddit} from "./Reddit";
import {Router} from "../../Router";

SourceMaps.install();

const CSMemers = new CSMemersApp();

CSMemers.client.login(config.token).then(async () => {
   await CSMemers.load(config.token, config.guild.id, config.guild.channels.logs);
   const channels = CSMemers.guild.channels.cache.filter((channel) => channel instanceof TextChannel);

   for (const channel of channels.values()) {
      try {
         if (channel instanceof TextChannel) {
            await channel.messages.fetch({limit: 100});
         }
      } catch {}
   }

   reddit();
});

CSMemers.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
   const user = interaction.user;

   if (interaction.isChatInputCommand()) {
      const command = CSMemers.commands.get(interaction.commandName);

      try {
         command.execute(interaction, CSMemers).catch();
      } catch (error) {
         CSMemers.logger.error(`Command by ${user.username} errored`, error);
         if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
         else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
      }
   }

   if (interaction.isButton()) {
      const role = await CSMemers.guild.roles.fetch(interaction.customId);
      const member = await CSMemers.guild.members.fetch(user);

      try {

         if (interaction.customId.startsWith("page")) {
            CSMemers.handleLeaderboardButton(interaction).catch();
            return;
         }

         if (!role) {
            await interaction.reply({content: "This is a legacy course/role. You can't have it, sorry!", ephemeral: true});
            return;
         }

         if (member.roles.cache.has(role.id)) {
            member.roles.remove(role.id).catch();
            interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
            return;
         }

         const blacklist = JSON.parse(fs.readFileSync("./blacklist.json").toString());

         if (blacklist[role.id] != null && blacklist[role.id].includes(member.id)) {
            interaction.reply({content: "I'm sorry, you have been blacklisted from this role, please contact an admin if you believe this is in error.", ephemeral: true}).catch();
            return;
         }

         member.roles.add(role.id).catch();
         await interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true}).catch();

         if (role.id == config.guild.roles.specialty.ta) {
            interaction.followUp({content: "This role is for UTAs and GTAs. Please de-equip if it if you are not a UTA or GTA.", ephemeral: true}).catch();
         }

      } catch (error) {
         CSMemers.logger.error(`Button by ${user.username} errored`, error);
         if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
         else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
      }
   }

   if (interaction.isModalSubmit()) {
      const name = interaction.customId;

      try {

         if (name == "purdue") {
            CSMemers.handlePurdueModal(user, interaction).catch();
         }

         if (name == "register") {
            CSMemers.handlePlayerModal(interaction, null).catch();
            return;
         }

         if (name == "wallyball") {
            CSMemers.handleWallyballModal(interaction, null).catch();
            return;
         }

      } catch (error) {
         CSMemers.logger.error(`Modal by ${user.username} errored`, error);
         if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
         else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
      }
   }
});

CSMemers.client.on(Events.MessageReactionAdd, async (reaction: MessageReaction, user: User) => {
   if (!reaction.message.guild || reaction.message.guild.id != CSMemers.guild.id || user.bot) return;

   if (reaction.emoji.id == "490279418850181141") {
      const featuredReactions = CSMemers.readReactionsFile();
      const userReactionsEntry = featuredReactions.get(user.id);
      const currentTime = new Date().getTime();

      if (!userReactionsEntry) {
         const firstReaction = new Reaction(reaction.message.id, reaction.message.channelId, currentTime);
         featuredReactions.set(user.id, [firstReaction]);
         CSMemers.writeReactionsFile(featuredReactions);
         return;
      }

      const MAX_TIME = 24 * 60 * 60 * 1000; // 24 Hours
      const totalReactions = userReactionsEntry.filter(reaction => (currentTime - reaction.time) >= MAX_TIME).length;

      const MAX_REACTIONS = 10;
      if (totalReactions <= MAX_REACTIONS) {
         userReactionsEntry.push(new Reaction(reaction.message.id, reaction.message.channelId, currentTime));
         featuredReactions.set(user.id, userReactionsEntry);
         CSMemers.writeReactionsFile(featuredReactions);
         return;
      }

      reaction.users.remove(user).catch();
      const response = await reaction.message.channel.send({content: `Sorry <@${user.id}>, you have exceeded the maximum number of featured reactions in the last 24 hours.`});
      setTimeout(() => response.delete(), 5000);
      return;
   }

   if (isWastebasket(reaction.emoji.name) && reaction.message.author.id == config.users.bruv) {
      if (reaction.count < 5) return;
      reaction.message.delete().catch();
   }

   if (isWastebasket(reaction.emoji.name) && reaction.message.author.id == "134073775925886976") {
      const interaction: MessageInteraction = await reaction.message.interaction;
      const member = await CSMemers.guild.members.fetch(user.id);

      if ((!interaction || interaction.user.id != member.id) && (!member.permissions.has(PermissionsBitField.Flags.ViewAuditLog) || user.bot)) {
         return;
      }

      await reaction.message.delete();
      return;
   }
});

CSMemers.client.on(Events.MessageReactionRemove, (reaction: MessageReaction, user: User) => {
   if (!reaction.message.guild || reaction.message.guild.id != CSMemers.guild.id || user.bot) return;

   if (reaction.emoji.id == "490279418850181141") {

      const featuredReactions = CSMemers.readReactionsFile();
      const userReactionsEntry = featuredReactions.get(user.id);
      const entryIndex = userReactionsEntry.findIndex((entry) => entry.messageId == reaction.message.id);

      if (entryIndex > -1) {
         userReactionsEntry.splice(entryIndex, 1);
         featuredReactions.set(user.id, userReactionsEntry);
         CSMemers.writeReactionsFile(featuredReactions);
         return;
      }
   }
});

CSMemers.client.on(Events.MessageCreate, (message: Message) => {
   if (message.author.id == config.users.bruv) {
      const messages = CSMemers.readMessagesFile();
      messages.push(message.content);
      CSMemers.writeMessagesFile(messages);
   }
});

function isWastebasket(name: string): boolean {
   return name == '🗑' || name == '🗑️';
}

function reddit() {
   const now = new Date();
   const hour = 60 * 60 * 1000;
   const minutes = now.getMinutes();
   const seconds = now.getSeconds();
   const delay = hour - (minutes * 60 * 1000) - (seconds * 1000);
   setTimeout(() => {
      Reddit.parse(CSMemers).catch();
      reddit();
   }, delay);
}

Router.express.get(`/activate/:id`, (request, response) => {
   CSMemers.handleAutomaticRole(request, response, config.guild.roles.specialty.verified).catch(error =>
       CSMemers.logger.error("Error Applying Automatic Role", error)
   );
});