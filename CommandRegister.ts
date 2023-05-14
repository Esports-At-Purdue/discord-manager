import {Command, GlobalCommand} from "./Command";
import {flipCommand} from "./commands/flip";
import {helpCommand} from "./commands/help";
import {leaderboardCommand} from "./commands/leaderboard";
import {pingCommand} from "./commands/ping";
import {statusCommand} from "./commands/status";

export class CommandRegister extends Map<string, Command | GlobalCommand>{

    public constructor() {
        super();
    }

    public static GlobalCommands: GlobalCommand[] = [
        flipCommand,
        helpCommand,
        leaderboardCommand,
        pingCommand,
        statusCommand
    ];

    public registerCommand(command: Command): CommandRegister {
        this.set(command.builder.name, command);
        return this;
    }
}