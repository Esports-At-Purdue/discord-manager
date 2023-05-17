import {
    ChatInputCommandInteraction,
    SlashCommandBuilder
} from "discord.js";
import {Application} from "./Application";

export class Command {
    public readonly builder: SlashCommandBuilder;
    public readonly execute: CommandFunction;

    public constructor(builder: any, execute: CommandFunction) {
        this.builder = builder;
        this.execute = execute;
    }
}

export class GlobalCommand extends Command {
    constructor(builder: any, execute: GlobalCommandFunction) {
        super(builder, execute);
    }
}

type GlobalCommandFunction = (interaction: ChatInputCommandInteraction, application: Application) => Promise<void>;

type GuildCommandFunction = (interaction: ChatInputCommandInteraction) => Promise<void>;

type CommandFunction = GuildCommandFunction | GlobalCommandFunction;