import {
    SlashCommandBuilder
} from "discord.js";

export class Command {
    public readonly builder: SlashCommandBuilder;
    public readonly execute: Function;

    public constructor(builder: any, execute: Function) {
        this.builder = builder;
        this.execute = execute;
    }
}

export class GlobalCommand extends Command {
    constructor(builder: any, execute: Function) {
        super(builder, execute);
    }
}