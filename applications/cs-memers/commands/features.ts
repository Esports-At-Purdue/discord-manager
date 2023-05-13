import {ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {Command} from "../../../Command";
import {CSMemers} from "../cs-memers";
import * as fs from "fs";

export const FeaturesCommand =  new Command(new SlashCommandBuilder()
        .setName("features")
        .setDescription("Check how many features a user has")

        .addUserOption((user) => user
            .setName("target")
            .setDescription("The target user")
            .setRequired(true)
        ),
    async function execute(interaction: ChatInputCommandInteraction) {
        const target = interaction.options.getUser("target");
        const allReactions = JSON.parse(fs.readFileSync("./reactions.json").toString());
        const reactions = allReactions[target.id];

        if (!reactions) {
            await interaction.reply({content: "This user has not featured any posts", ephemeral: true});
            return;
        }

        const urls = [];
        let totalReactions = 0;
        for (const reaction of reactions) {
            urls.push(`https://discord.com/channels/${CSMemers.guild.id}/${reaction["channelId"]}/${reaction["messageId"]}`);
            totalReactions += 1;
        }

        let content
        if (totalReactions == 1) content = `${target.username} has featured ${totalReactions} post.`;
        else content = `${target.username} has featured ${totalReactions} posts.`;
        for (const url of urls) content += `\n${url}`;

        await interaction.reply({content: content, ephemeral: true});
    })