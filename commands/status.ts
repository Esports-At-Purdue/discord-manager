import {ActivityType, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import {GlobalCommand} from "../Command";
import * as fs from "fs";

export const StatusCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("status")
        .setDescription("Sets the Bot activity status")

        .addIntegerOption((integer) => integer
            .setName("activity_type")
            .setDescription("The type of activity")
            .setRequired(true)
            .setChoices(
                {name: "Playing", value: 0},
                {name: "Streaming", value: 1},
                {name: "Listening", value: 2},
                {name: "Watching", value: 3},
                {name: "Competing", value: 5}
            )
        )

        .addStringOption(option => option
            .setName("activity_name")
            .setDescription("The name of the activity")
            .setRequired(true)
        ),
    async function execute(interaction, application) {
        const activityName = interaction.options.getString("activity_name");
        const activityType = interaction.options.getInteger("activity_type") as ActivityType;

        if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
            interaction.reply({content: `You are not permitted to use this command.`, ephemeral: true}).catch();
            return;
        }

        application.status(activityType, activityName);

        fs.writeFileSync("./status.json", JSON.stringify({name: activityName, type: activityType}, null, 2));

        interaction.reply({content: `Success!`, ephemeral: true}).catch();
    }
)
