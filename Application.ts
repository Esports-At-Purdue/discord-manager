import {Logger} from "./Logger";
import {
    ActivityType, AttachmentBuilder, ButtonInteraction,
    Client,
    ClientOptions, Colors,
    Guild, GuildMember,
    IntentsBitField, ModalSubmitInteraction,
    REST, Routes,
    TextBasedChannel, User
} from "discord.js";
import {GlobalCommand} from "./Command";
import * as fs from "fs";
import {Database} from "./Database";
import {Verifier} from "./Verifier";
import {GameType} from "./Game";
import {CommandRegister} from "./CommandRegister";
import {LeaderboardRow} from "./components/Leaderboard.Row";
import {Player, PlayerStats} from "./Player";
import {Queue} from "./Queue";
import {PlayerModal} from "./modals/Player.Modal";
import {Student} from "./Student";
import {PurdueModal} from "./modals/Purdue.Modal";
import {WallyballModal} from "./applications/wallyball/modals/Wallyball.Modal";
import {Router} from "./Router";

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
    public commands: CommandRegister;

    public constructor(name: string) {
        this.name = name;
        this.client = new Client(options);
        this.commands = new CommandRegister();
        for (const globalCommand of CommandRegister.GlobalCommands) this.commands.registerCommand(globalCommand);
    }

    public async load(token: string, guildId: string, logChannelId: string) {
        const status = JSON.parse(fs.readFileSync("./status.json").toString());
        this.guild = await this.client.guilds.fetch(guildId);
        this.logger = new Logger(await this.client.channels.fetch(logChannelId) as TextBasedChannel);
        this.status(status.type as ActivityType, status.name);
        this.registerCommands(token).catch();
        await Database.load();
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

    public ensureDataFilesExist(requiredFiles: {name: string, default: object}[]) {
        for (const file of requiredFiles) {
            const exists = fileExists(`./${file.name}`);
            if (exists) continue;
            fs.writeFileSync(`./${file.name}`, JSON.stringify(file.default, null, 2));
        }
    }

    public async handleLeaderboardButton(interaction: ButtonInteraction, game: GameType, pageNumber: number) {
        await interaction.deferUpdate();
        const maxPages = Math.ceil(await Database.players.countDocuments() / 5);
        const actionRow = new LeaderboardRow(pageNumber, maxPages);
        const filePath = `./media/${game}/leaderboards/${pageNumber}.png`;
        const image = new AttachmentBuilder(filePath);
        interaction.editReply({content: null, files: [image], components: [actionRow]}).catch();
        return;
    }

    public async handleQueueJoinButton(interaction: ButtonInteraction, player: Player, queue: Queue) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            interaction.showModal(modal).catch();
            return;
        }
        if (queue.queue.has(player.id)) {
            interaction.reply({content: `You are already in the queue.`, ephemeral: true}).catch();
            return;
        }

        queue.join(player, interaction);
        if (queue.queue.size != queue.capacity) return;
        queue.update(`A new Game has began!`, Colors.Gold).catch();
        for (const entry of queue.queue) clearTimeout(entry[1]);
        // ToDo New Game
        queue.queue = new Map();
    }

    public async handleQueueLeaveButton(interaction: ButtonInteraction, player: Player, queue: Queue) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            interaction.showModal(modal).catch();
            return;
        }
        if (!queue.queue.has(player.id)) {
            interaction.reply({content: `You are not in the queue.`, ephemeral: true}).catch();
            return;
        }
        queue.leave(player);
    }

    public async handleQueueBumpButton(interaction: ButtonInteraction, player: Player, queue: Queue) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            interaction.showModal(modal).catch();
            return;
        }
        queue.bump(player);
    }

    public async handlePurdueButton(interaction: ButtonInteraction, student: Student, member: GuildMember, roleId: string) {
        if (student && student.verified) {
            member.roles.add(roleId).catch();
            interaction.reply({content: `You are verified. Thank you!`, ephemeral: true}).catch();
            return;
        }

        const modal = new PurdueModal();
        interaction.showModal(modal).catch();
        return;
    }

    public async handlePlayerButton(interaction: ButtonInteraction, player: Player) {
        if (!player || !player.username) {
            const modal = new PlayerModal();
            interaction.showModal(modal).catch();
            return;
        }
    }

    public async handleWallyballButton(interaction: ButtonInteraction, player: Player) {
        if (!player || !player.firstName || !player.lastName) {
            const modal = new WallyballModal();
            interaction.showModal(modal).catch();
            return;
        }
    }

    public async handlePurdueModal(user: User, interaction: ModalSubmitInteraction) {
        const email = interaction.fields.getTextInputValue("email");

        if (!Verifier.isValidEmail(email)) {
            interaction.reply({content: `Sorry, address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.`, ephemeral: true}).catch();
            return;
        }

        this.logger.info(`Verification Email Sent: ${user.username}`);
        Verifier.registerNewStudent(user, email, interaction).catch();
        interaction.reply({content: `A Verification Email has been sent to \`${email}\`.`, ephemeral: true}).catch();
        return;
    }

    public async handlePlayerModal(interaction: ModalSubmitInteraction, gameType: GameType, roleId: string) {
        const username = interaction.fields.getTextInputValue("username");
        const member = await this.guild.members.fetch(interaction.user.id);
        let player = await Player.fetch(interaction.user.id);

        if (!player) {
            player = new Player(interaction.user.id, null, null, null, await PlayerStats.newStats());
        }

        player.username = username;
        player.save().catch();
        member.roles.add(roleId).catch();
        interaction.reply({content: `You have been registered as ${player.getName(gameType)}.`, ephemeral: true}).catch();
        Database.updateRankings(gameType, this).catch();
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
        player.save().catch();
        member.roles.add(roleId).catch();
        interaction.reply({content: `You have been registered as ${player.getName(GameType.Wallyball)}.`, ephemeral: true}).catch();
        Database.updateRankings(GameType.Wallyball, this).catch();
        return;
    }

    public async handleAutomaticRole(request, response, roleId: string) {
        const memberId = request?.params?.id;
        this.guild.members.fetch(memberId).then((member) => {
            if (!member) return;
            member.roles.add(roleId).catch();
            const timeout = Verifier.remove(memberId);
            if (!timeout) return;
            timeout.interaction.followUp({content: `Hey <@${memberId}>, you have successfully been verified. Thank you!`, ephemeral: true}).catch();
            this.logger.info(`Automatic Role Applied: ${member.user.username}`);
        });
        response.sendStatus(200);
    }

    status(type, name: string): void {
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