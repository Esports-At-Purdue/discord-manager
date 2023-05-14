import {ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import {Command} from "../../../Command";
import {CSMemers} from "../cs-memers";

export const PunishCommand = new Command(
    new SlashCommandBuilder()
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
                {name: "seconds", value: "second"},
                {name: "minutes", value: "minute"},
                {name: "hours", value: "hour"},
                {name: "days", value: "day"},
                {name: "weeks", value: "week"},
            )
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            await interaction.reply({content: `You are not permitted to use this command.`, ephemeral: true});
            return;
        }

        const member = await CSMemers.guild.members.fetch(interaction.options.getUser("target").id);
        const magnitude = interaction.options.getInteger("length");
        const unit = interaction.options.getString("unit");
        const milliseconds = magnitude * (unitToMilliseconds[unit] || 0);

        if (milliseconds >= MAX_TIMEOUT) {
            await interaction.reply({content: `I'm sorry, the maximum timeout is 28 days.`, ephemeral: true});
            return;
        }

        const unixDateMilliseconds = Math.floor(Date.now() + milliseconds);
        const unixDateSeconds = Math.floor(unixDateMilliseconds / 1000);
        member.timeout(milliseconds, "Spam Detected").catch();
        interaction.reply({
            content: `Member **${member.user.username}**'s punishment will expire <t:${unixDateSeconds}:R>`,
            ephemeral: true
        }).catch();
    }
);

const unitToMilliseconds: Record<string, number> = {
    second: 1000,
    minute: 60000,
    hour: 3600000,
    day: 86400000,
    week: 604800000,
};

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000; // 28 days in milliseconds