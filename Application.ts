import {Logger} from "./Logger";
import {
    ActivityType,
    Client,
    ClientOptions,
    Collection,
    Guild,
    IntentsBitField,
    REST, Routes,
    TextBasedChannel
} from "discord.js";
import {Command, GlobalCommand} from "./Command";
import * as fs from "fs";
import {Database} from "./Database";
import {Verifier} from "./Verifier";
import {GameType} from "./Game";
import {Valorant} from "./applications/valorant/valorant";
import {CommandRegister} from "./CommandRegister";

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