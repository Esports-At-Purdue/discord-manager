import {Command, GlobalCommand} from "./Command";
import {Collection} from "discord.js";
import {flipCommand} from "./commands/flip";
import {helpCommand} from "./commands/help";
import {leaderboardCommand} from "./commands/leaderboard";
import {pingCommand} from "./commands/ping";
import {statusCommand} from "./commands/status";

export class CommandRegister extends Collection<string, Command | GlobalCommand>{

    public constructor() {
        super();
    }

    public static GlobalCommandRegister = new CommandRegister()
        .registerCommand(flipCommand)
        .registerCommand(helpCommand)
        .registerCommand(leaderboardCommand)
        .registerCommand(pingCommand)
        .registerCommand(statusCommand)


    public registerCommand(command: Command): CommandRegister {
        this.set(command.builder.name, command);
        return this;
    }
}