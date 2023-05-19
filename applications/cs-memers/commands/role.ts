import {Command} from "../../../Command";
import {ChatInputCommandInteraction, GuildMember, PermissionsBitField, Role, SlashCommandBuilder} from "discord.js";

export const RoleCommand = new Command(
    new SlashCommandBuilder()
        .setName("role")
        .setDescription("role management cmd")

        // add - subcommand
        .addSubcommand((command) => command
            .setName('add')
            .setDescription('Adds and removes roles')
            .addRoleOption((role) => role
                .setName("role")
                .setDescription("role to add")
                .setRequired(true)
            )
            .addUserOption((user) => user
                .setName("target")
                .setDescription("user to modify")
                .setRequired(true)
            )
        )

        // remove - subcommand
        .addSubcommand((command) => command
            .setName('remove')
            .setDescription('Command to remove role')
            .addRoleOption((role) => role
                .setName("role")
                .setDescription("role to remove")
                .setRequired(true)
            )
            .addUserOption((user) => user
                .setName("target")
                .setDescription("user to modify")
                .setRequired(true)
            )
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand();
        const role = interaction.options.getRole("role") as Role;
        const highestRolePosition = (interaction.member as GuildMember).roles.highest.position;
        const member = await interaction.guild.members.fetch(interaction.options.getUser("target"));

        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            interaction.reply({content: `You are not permitted to use this command.`, ephemeral: true}).catch();
            return;
        }

        if (role.position > highestRolePosition) {
            interaction.reply({content: "You don't have permission to manage this role", ephemeral: true}).catch();
            return;
        }

        if (subcommand == "add") {
            member.roles.add(role.id).catch();
            interaction.reply({content: `<@&${role.id}> added to <@!${member.id}>`, ephemeral: true}).catch();
            return;
        }

        if (subcommand == "remove") {
            member.roles.remove(role.id).catch();
            interaction.reply({content: `<@&${role.id}> removed from <@!${member.id}>`, ephemeral: true}).catch();
            return;
        }

    })