import {Logger} from "./Logger";
import {
    ActivityType,
    AttachmentBuilder,
    ButtonInteraction,
    ChannelType,
    Client,
    ClientOptions,
    Colors,
    Guild,
    GuildMember,
    IntentsBitField,
    ModalSubmitInteraction,
    REST,
    Routes,
    StringSelectMenuInteraction,
    TextBasedChannel, TextChannel,
    User, GatewayIntentBits
} from "discord.js";
import {GlobalCommand} from "./Command";
import * as fs from "fs";
import {Database} from "./Database";
import {Verifier} from "./Verifier";
import {Game, GameMap, GameOutcome, GameType} from "./Game";
import {CommandRegister} from "./CommandRegister";
import {LeaderboardRow} from "./components/Leaderboard.Row";
import {Player, PlayerStats} from "./Player";
import {Queue} from "./Queue";
import {PlayerModal} from "./modals/Player.Modal";
import {Student} from "./Student";
import {PurdueModal} from "./modals/Purdue.Modal";
import {WallyballModal} from "./modals/Wallyball.Modal";
import {Router} from "./Router";
import {QueueEmbed} from "./embeds/Queue.Embed";
import {Team} from "./Team";
import {GameEmbed} from "./embeds/Game.Embed";
import {GameRow} from "./components/Game.Row";
import {registerFont} from "canvas";

const options = {
    intents: [
        IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildBans, IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages, IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMessageReactions, IntentsBitField.Flags.DirectMessageReactions,
        IntentsBitField.Flags.MessageContent
    ],
    allowedMentions: {
        parse: ["users"]
    }
} as ClientOptions;

export class Application {
    public name: string;
    public client: Client;
    public guild: Guild;
    public logger: Logger;
    public game: GameType;
    public queue: Queue;
    public commands: CommandRegister;

    public constructor(name: string, game: GameType) {
        this.name = name;
        this.game = game;
        this.client = new Client(options);
    }

    public async load(token: string, guildId: string, logChannelId: string) {
        const status = JSON.parse(fs.readFileSync("./status.json").toString());
        this.guild = await this.client.guilds.fetch(guildId);
        this.logger = new Logger(await this.client.channels.fetch(logChannelId) as TextBasedChannel);
        this.status(status.type as ActivityType, status.name);
        this.registerFonts();
        await Database.load();
        await this.registerCommands(token);
        await Router.express.listen(Router.ports.get(this.name));
    }

    private async registerCommands(token: string) {
        const rest = new REST({ version: "9" }).setToken(token);

        const guildCommandsJSONBody = Array.from(this.commands.values())
            .filter(command => !(command instanceof GlobalCommand))
            .map(command => command.builder.toJSON())

        const globalCommandsJSONBody = Array.from(this.commands.values())
            .filter(command => command instanceof GlobalCommand)
            .map(command => command.builder.toJSON())

        try {
            await rest.put(
                Routes.applicationGuildCommands(this.client.application.id, this.guild.id),
                { body: guildCommandsJSONBody }
            );
            await rest.put(Routes.applicationCommands(this.client.application.id),
                { body: globalCommandsJSONBody }
            );
            this.logger.info("Application Commands Uploaded");
        } catch (error) {
            this.logger.error("Failed to register commands:", error);
        }
    }

    private registerFonts() {
        registerFont("../../media/fonts/font.ttf", { family: 'CustomFont' });
    }

    public ensureDataFilesExist(requiredFiles: FileTemplate[]) {
        for (const file of requiredFiles) {
            if (fileExists(`./${file.name}`)) continue;
            fs.writeFileSync(`./${file.name}`, JSON.stringify(file.default, null, 2));
        }
    }

    public async handleLeaderboardButton(interaction: ButtonInteraction) {
        await interaction.deferUpdate();
        const leaderboardProperties = interaction.customId.split("-");
        const page = Number.parseInt(leaderboardProperties[1]);
        const game = String(leaderboardProperties[2]) as GameType;
        const totalPlayers = await Database.getTotalPlayers(game);
        const maxPages = Math.ceil(totalPlayers / 5);
        const actionRow = new LeaderboardRow(game, page, maxPages);
        const filePath = `../../media/leaderboards/${game}/${page}.png`;
        const image = new AttachmentBuilder(filePath);
        await interaction.editReply({content: null, files: [image], components: [actionRow]});
        return;
    }

    public async handleQueueJoinButton(interaction: ButtonInteraction, player: Player, queue: Queue) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            await interaction.showModal(modal);
            return;
        }

        await interaction.deferUpdate();

        if (queue.queue.has(player.id)) {
            await interaction.followUp({content: `You are already in the queue.`, ephemeral: true});
            return;
        }

        const message = `${player.getName(queue.game)} has joined`;
        await queue.join(message, [player], interaction);
        if (queue.queue.size != queue.capacity) return;
        const embed = new QueueEmbed(`A new Game has begun!`, await queue.getPlayers(), queue.capacity, queue.game, Colors.Gold);
        await interaction.channel.send({embeds: [embed]});
        for (const entry of queue.queue) clearTimeout(entry[1]);

        const gameId = await Database.games.countDocuments() + 1;
        const category = queue.channel.parent;
        const gameChannel = await category.children.create({ name: `game-${gameId}`, type: ChannelType.GuildText, permissionOverwrites: [{id: "631319898454360095", deny: "ViewChannel"}] });
        const unsortedPlayers = await queue.getPlayers();
        const players = unsortedPlayers.sort((a, b) => a.getElo(queue.game) - b.getElo(queue.game));
        const teamId = await Database.teams.countDocuments();
        const teamOne = await new Team(String(teamId + 1), await Team.generateName(), null, [players[0].id], 0, 0, 0).save();
        const teamTwo = await new Team(String(teamId + 2), await Team.generateName(), null, [players[1].id], 0, 0, 0).save();
        const gameMaps = Game.getMaps(queue.game);
        const gameMap = gameMaps[Math.floor(Math.random() * gameMaps.length)];
        const game = await new Game(String(gameId), gameChannel.id, teamOne.id, teamTwo.id, players.map(player => player.id), queue.game, GameOutcome.InProgress, gameMap).save();

        const gameEmbed = await GameEmbed.build(game, teamOne, teamTwo);
        const gameRow = new GameRow(players.splice(2), queue.game);
        const mapFilePath = Game.getMapFilePath(gameMap, game.type);
        const mentions = players.map(player => `<@${player.id}>`).join("");

        if (fileExists(mapFilePath)) {
            const gameAttachment = new AttachmentBuilder(Game.getMapFilePath(gameMap, game.type), { name: "map.png" });
            await gameChannel.send({content: mentions, embeds: [gameEmbed], files: [gameAttachment]});
        } else {
            await gameChannel.send({content: mentions, embeds: [gameEmbed]});
        }

        await gameChannel.send({content: `\n\n<@${teamOne.captain}> please pick the first player.`, components: [gameRow]});

        queue.queue = new Map();
        await queue.update(`A new Queue has started.`, Colors.Aqua);

        // ToDo New Game
    }

    public async handleQueueLeaveButton(interaction: ButtonInteraction, player: Player, queue: Queue) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            await interaction.showModal(modal);
            return;
        }

        await interaction.deferUpdate();

        if (!queue.queue.has(player.id)) {
            await interaction.followUp({content: `You are not in the queue.`, ephemeral: true});
            return;
        }

        await queue.leave(`${player.getName(queue.game)} has left`, [player]);
    }

    public async handleQueueBumpButton(interaction: ButtonInteraction, player: Player, queue: Queue) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            await interaction.showModal(modal);
            return;
        }

        await interaction.deferUpdate();
        await queue.bump(player);
    }

    public async handlePurdueButton(interaction: ButtonInteraction, student: Student, member: GuildMember, roleId: string) {
        if (student && student.verified) {
            await member.roles.add(roleId);
            await interaction.reply({content: `You are verified. Thank you!`, ephemeral: true});
            return;
        }

        const modal = new PurdueModal();
        await interaction.showModal(modal);
        return;
    }

    public async handlePlayerButton(interaction: ButtonInteraction, player: Player) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            await interaction.showModal(modal);
            return true;
        }
        return false;
    }

    public async handleWallyballButton(interaction: ButtonInteraction, player: Player) {
        if (!player || !player.firstName || !player.lastName) {
            const modal = new WallyballModal();
            await interaction.showModal(modal);
            return true;
        }
        return false;
    }

    public async handlePlayerPickMenu(interaction: StringSelectMenuInteraction) {
        const game = await Game.fetchByChannel(interaction.channelId);
        const targetPlayerId = interaction.values[0];

        if (!game) {
            await interaction.reply({content: "Sorry, this game couldn't be retrieved.", ephemeral: true});
            return;
        }

        const unpickedPlayers = await game.getUnpickedPlayers();
        const targetPlayer = unpickedPlayers.find(player => player.id == targetPlayerId);
        const unpickedPlayer = unpickedPlayers.find(player => player.id != targetPlayerId);

        if (!targetPlayer) {
            await interaction.reply({content: `Sorry, you can't pick <@${targetPlayer}>}`, ephemeral: true});
            return;
        }

        const teamOne = await game.getTeamOne()
        const teamTwo = await game.getTeamTwo();
        const teamOneCaptain = await Player.fetch(teamOne.captain);
        const teamTwoCaptain = await Player.fetch(teamTwo.captain);
        const totalRemainingPlayers = unpickedPlayers.length;

        if (totalRemainingPlayers == 8 || totalRemainingPlayers == 5 || totalRemainingPlayers == 4 || totalRemainingPlayers == 2) {
            if (interaction.user.id != teamOneCaptain.id && interaction.user.id != "751910711218667562") {
                await interaction.reply({content: "It is not your turn to pick", ephemeral: true});
                return;
            }

            teamOne.players.push(targetPlayerId);
            await teamOne.save();
        }
        if (totalRemainingPlayers == 7 || totalRemainingPlayers == 6 || totalRemainingPlayers == 3) {
            if (interaction.user.id != teamTwoCaptain.id && interaction.user.id != "751910711218667562") {
                await interaction.reply({content: "It is not your turn to pick", ephemeral: true});
                return;
            }

            teamTwo.players.push(targetPlayerId);
            await teamTwo.save();
        }
        if (totalRemainingPlayers == 2) {
            teamTwo.players.push(unpickedPlayer.id);
            await teamTwo.save();
        }

        await interaction.update({components: []});
        const row = new GameRow(await game.getUnpickedPlayers(), game.type);
        const messages = {
            8: {
                content: `**${teamOneCaptain.username}** has picked **${targetPlayer.username}**. <@!${teamTwoCaptain.id}> please pick two players.`,
                components: [row]
            },
            7: {
                content: `**${teamTwoCaptain.username}** has picked **${targetPlayer.username}**. <@!${teamTwoCaptain.id}> please pick another player.`,
                components: [row]
            },
            6: {
                content: `**${teamTwoCaptain.username}** has picked **${targetPlayer.username}**. <@!${teamOneCaptain.id}> please pick two players.`,
                components: [row]
            },
            5: {
                content: `**${teamOneCaptain.username}** has picked **${targetPlayer.username}**. <@!${teamOneCaptain.id}> please pick another player.`,
                components: [row]
            },
            4: {
                content: `**${teamOneCaptain.username}** has picked **${targetPlayer.username}**. <@!${teamTwoCaptain.id}> please pick a player.`,
                components: [row]
            },
            3: {
                content: `**${teamTwoCaptain.username}** has picked **${targetPlayer.username}**. <@!${teamOneCaptain.id}> please pick your final player.`,
                components: [row]
            },
            2: {
                content: `**${teamOneCaptain.username}** has picked **${targetPlayer.username}**.\n**${teamTwoCaptain.username}** has received **${unpickedPlayer.username}**.`,
                channel: game.channel
            }
        };
        const message = messages[totalRemainingPlayers];

        await interaction.channel.send({ content: message.content, components: message.components });
        if (message.channel) {
            const channel = await this.guild.channels.fetch(message.channel) as TextChannel;
            setTimeout(async () => { await game.start(channel); }, 1000);
        }
    }

    public async handlePurdueModal(user: User, interaction: ModalSubmitInteraction) {
        const email = interaction.fields.getTextInputValue("email");

        if (!Verifier.isValidEmail(email)) {
            await interaction.reply({content: `Sorry, address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.`, ephemeral: true});
            return;
        }

        this.logger.info(`Verification Email Sent: ${user.username}`);
        await Verifier.registerNewStudent(user, email, interaction);
        await interaction.reply({content: `A Verification Email has been sent to \`${email}\`.`, ephemeral: true});
        return;
    }

    public async handlePlayerModal(interaction: ModalSubmitInteraction, roleId: string) {
        const username = interaction.fields.getTextInputValue("username");
        const member = await this.guild.members.fetch(interaction.user.id);
        let player = await Player.fetch(interaction.user.id);

        if (!player) {
            player = new Player(interaction.user.id, null, null, null, await PlayerStats.newStats());
        }

        player.username = username;
        await player.save();
        if (roleId) await member.roles.add(roleId);
        await interaction.reply({content: `You have been registered as ${player.username}.`, ephemeral: true});
        return;
    }

    public async handleWallyballModal(interaction: ModalSubmitInteraction, roleId: string) {
        const firstName = interaction.fields.getTextInputValue("first-name");
        const lastName = interaction.fields.getTextInputValue("last-name");
        const member = await this.guild.members.fetch(interaction.user.id);
        let player = await Player.fetch(interaction.user.id);

        if (!player) {
            player = new Player(interaction.user.id, null, null, null, await PlayerStats.newStats());
        }

        player.firstName = firstName;
        player.lastName = lastName;
        await player.save();
        if (roleId) await member.roles.add(roleId);
        await interaction.reply({content: `You have been registered as ${player.getName(GameType.Wallyball)}.`, ephemeral: true});
        return;
    }

    public async handleAutomaticRole(request, response, roleId: string) {
        const memberId = request?.params?.id;
        try {
            const member = await this.guild.members.fetch(memberId);
            if (!member) return;
            if (!member.roles.cache.has(roleId)) {
                this.logger.info(`Automatic Role Applied: ${member.user.username}`);
                await member.roles.add(roleId);
            }
            const timeout = Verifier.remove(memberId);
            if (!timeout) return;
            await timeout.interaction.followUp({content: `Hey <@${memberId}>, you have successfully been verified. Thank you!`, ephemeral: true});
        } catch {}
        response.sendStatus(200);
    }

    public async handleUnreachableEmail(request, response) {
        const studentId = request?.params?.id;
        const student = await Student.fetch(studentId);
        if (!student) return;
        const timeout = Verifier.remove(studentId);
        if (!timeout) return;
        await timeout.interaction.followUp({content: `Hey <@${studentId}>, the email you provided, \`${student.email}\`, was not reachable. Please submit a valid purdue mail address.`, ephemeral: true});
        response.sendStatus(200);
    }

    public status(type, name: string): void {
        this.client.user.setActivity({name: name, type: type});
    }
}

function fileExists(path) {
    try {
        fs.accessSync(path);
        return true;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return false;
        } else {
            throw error;
        }
    }
}

type FileTemplate = { name: string, default: object };