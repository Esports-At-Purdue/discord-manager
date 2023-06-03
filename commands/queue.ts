import {GlobalCommand} from "../Command";
import {Colors, SlashCommandBuilder} from "discord.js";
import {Queue} from "../Queue";
import {QueueEmbed} from "../embeds/Queue.Embed";
import {Player} from "../Player";
import {GameType} from "../Game";

export const QueueCommand = new GlobalCommand(
    new SlashCommandBuilder()
        .setName("queue")
        .setDescription("General-purpose queue command.")

        .addSubcommand((command) => command
            .setName("add")
            .setDescription("Add player(s) to the queue")
            .addUserOption((user) => user
                .setName("player-1")
                .setDescription("the user to act on")
                .setRequired(true)
            )
            .addUserOption((user) => user
                .setName("player-2")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-3")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-4")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-5")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-6")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-7")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-8")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-9")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-10")
                .setDescription("the user to act on")
                .setRequired(false)
            )
        )

        .addSubcommand((command) => command
            .setName("remove")
            .setDescription("Remove player(s) from the queue")
            .addUserOption((user) => user
                .setName("player-1")
                .setDescription("the user to act on")
                .setRequired(true)
            )
            .addUserOption((user) => user
                .setName("player-2")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-3")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-4")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-5")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-6")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-7")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-8")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-9")
                .setDescription("the user to act on")
                .setRequired(false)
            )
            .addUserOption((user) => user
                .setName("player-10")
                .setDescription("the user to act on")
                .setRequired(false)
            )
        )

        .addSubcommand((command) => command
            .setName("view")
            .setDescription("View the current queue")
        )

        .addSubcommand((command) => command
            .setName("clear")
            .setDescription("Clear the current queue")
        )
    ,
    async function execute(interaction, application)  {
        if (!application.queue) {
            await interaction.reply({content: "This application doesn't have a queue.", ephemeral: true});
            return;
        }

        const action = interaction.options.getSubcommand();
        const queue: Queue = application.queue;

        if (action == "clear") {
            for (const [id, timeout] of queue.queue) {
                clearTimeout(timeout);
                queue.queue.delete(id);
            }
            await interaction.reply({content: "The queue has been cleared.", ephemeral: true});
            if (queue.verbose) await queue.update(`The queue has been cleared by ${interaction.user.username}`, Colors.Aqua);
            return;
        }

        if (action == "view") {
            const embed = new QueueEmbed("Current Queue", await queue.getPlayers(), queue.capacity, queue.game, Colors.Aqua);
            await interaction.reply({embeds: [embed], ephemeral: true})
            return;
        }

        const players: Player[] = [];

        for (let i = 0; i < 10; i++) {
            const user = interaction.options.getUser(`player-${i}`);
            if (!user) continue;
            const player = await Player.fetch(user.id);

            if (!player) {
                await interaction.reply({content: `${user.username} is not registered for ${queue.game}.`, ephemeral: true});
                return;
            }

            if (queue.game == GameType.Wallyball) {
                if (!player.firstName || !player.lastName) {
                    await interaction.reply({content: `${user.username} is not registered for ${queue.game}.`, ephemeral: true});
                    return;
                }
            }

            else {
                if (!player.username) {
                    await interaction.reply({content: `${user.username} is not registered for ${queue.game}.`, ephemeral: true});
                    return;
                }
            }

            players.push(player);
        }

        if (action == "remove") {
            for (const player of players) {
                if (!queue.queue.has(player.id)) {
                    await interaction.reply({content: `${player.getName(queue.game)} is not in the queue.`, ephemeral: true});
                    return;
                }
            }

            if (players.length > 1) {
                await queue.leave(players.map(player => `${player.getName(queue.game)}`).join(", ").concat(` have been removed by ${interaction.user.username}`), players);
            } else {
                await queue.leave(players.map(player => `${player.getName(queue.game)}`).join(", ").concat(` has been removed by ${interaction.user.username}`), players);
            }


            await interaction.reply({content: "Success", ephemeral: true});
            return;
        }

        if (action == "add") {
            for (const player of players) {
                if (queue.queue.has(player.id)) {
                    await interaction.reply({content: `${player.getName(queue.game)} is already in the queue.`, ephemeral: true});
                    return;
                }
            }

            if (players.length > 1) {
                await queue.join(players.map(player => `${player.getName(queue.game)}`).join(", ").concat(` have been added by ${interaction.user.username}`), players, interaction);
            } else {
                await queue.join(players.map(player => `${player.getName(queue.game)}`).join(", ").concat(` has been added by ${interaction.user.username}`), players, interaction);
            }

            await interaction.reply({content: "Success", ephemeral: true});
            return;
        }
    }
);