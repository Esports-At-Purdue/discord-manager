import {ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder, time} from "discord.js";
import {Command} from "../../../Command";
import {CSMemers} from "../cs-memers";

export const PunishCommand = new Command(new SlashCommandBuilder()
        .setName("punish")
        .setDescription("A command to punish a user")
        .addUserOption((user) => user
            .setName("target")
            .setDescription("The user to be punished")
            .setRequired(true)
        )
        .addIntegerOption((integer) => integer
            .setName("length")
            .setDescription("The punishment magnitude")
            .setRequired(true)
        )
        .addStringOption((string) => string
            .setName("unit")
            .setDescription("The unit of time")
            .setRequired(true)
            .setChoices(
                {name: "minutes", value: "minute"},
                {name: "hours", value: "hour"},
                {name: "days", value: "day"},
                {name: "weeks", value: "week"},
            )
        ), async function execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            await interaction.reply({content: `You are not permitted to use this command.`, ephemeral: true});
            return;
        }

        const member = await CSMemers.guild.members.fetch(interaction.options.getUser("target").id);
        const magnitude = interaction.options.getInteger("length");
        const unit = interaction.options.getString("unit");
        let milliseconds = 0;

        if (unit == "minute") milliseconds += magnitude * 60000;
        if (unit == "hour") milliseconds += magnitude * 3600000;
        if (unit == "day") milliseconds += magnitude * 86400000;
        if (unit == "week") milliseconds += magnitude * 604800000;

        const maxOffset = 2419200000;

        if (milliseconds >= maxOffset) {
            await interaction.reply({content: `I'm sorry, the maximum timeout is 28 days.`, ephemeral: true});
            return;
        }

        const unixDate = Math.floor(Date.now() + milliseconds);
        member.timeout(milliseconds, "Spam Detect").catch();
        interaction.reply({
            content: `Member **${member.nickname}**'s punishment will expire <t:${unixDate}:R>`,
            ephemeral: true
        }).catch();
    });