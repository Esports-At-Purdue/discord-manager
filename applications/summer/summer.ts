import {SummerApp} from "./SummerApp";
import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {
    Events,
    Interaction,
} from "discord.js";
import * as fs from "fs";
import {Request, Response, Router} from "express";

SourceMaps.install();

const Summer = new SummerApp();

Summer.client.login(config.token).then(async () => {
    await Summer.load(config.token, config.guild.id, config.guild.channels.logs);
});

Summer.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;

    if (interaction.isChatInputCommand()) {
        const command = Summer.commands.get(interaction.commandName);

        try {
            command.execute(interaction, Summer).catch();
        } catch (error) {
            Summer.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {
        const role = await Summer.guild.roles.fetch(interaction.customId);
        const member = await Summer.guild.members.fetch(user);

        try {

            if (interaction.customId.startsWith("page")) {
                Summer.handleLeaderboardButton(interaction).catch();
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

        } catch (error) {
            Summer.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {
        const name = interaction.customId;

        try {

            if (name == "purdue") {
                Summer.handlePurdueModal(user, interaction).catch();
            }

            if (name == "register") {
                Summer.handlePlayerModal(interaction, null).catch();
                return;
            }

            if (name == "wallyball") {
                Summer.handleWallyballModal(interaction, null).catch();
                return;
            }

        } catch (error) {
            Summer.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});