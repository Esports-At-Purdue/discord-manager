import {Command} from "../../../Command";
import {ChatInputCommandInteraction, PermissionsBitField, SlashCommandBuilder} from "discord.js";

export const DeleteCommand= new Command(
    new SlashCommandBuilder()
        .setName("delete")
        .setDescription("Deletes a message")
        .addStringOption((string) => string
            .setName("id")
            .setDescription("message id")
            .setRequired(true)
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.channel;
        const messageId = interaction.options.getString("id");
        const message = await channel.messages.fetch(messageId);

        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            await interaction.reply({content: "Sorry, you don't have permission to do this.", ephemeral: true});
            return;
        }

        if (!message || !message.deletable) {
            console.log(message);
            await interaction.reply({content: "This message ID is invalid", ephemeral: true})
            return;
        }

        await message.delete();
        await interaction.reply({content: "Success!", ephemeral: true});
    })