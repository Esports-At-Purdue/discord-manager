import {Command, GlobalCommand} from "./Command";
import {FlipCommand} from "./commands/flip";
import {HelpCommand} from "./commands/help";
import {LeaderboardCommand} from "./commands/leaderboard";
import {PingCommand} from "./commands/ping";
import {StatusCommand} from "./commands/status";
import {UsernameCommand} from "./commands/username";
import {NameCommand} from "./commands/name";
import {QueueCommand} from "./commands/queue";

export class CommandRegister extends Map<string, Command | GlobalCommand>{

    public constructor() {
        super();
        for (const command of CommandRegister.GlobalCommands)
            this.registerCommand(command);
    }

    public static GlobalCommands: GlobalCommand[] = [
        FlipCommand,
        HelpCommand,
        LeaderboardCommand,
        PingCommand,
        StatusCommand,
        UsernameCommand,
        NameCommand,
        QueueCommand
    ];

    public registerCommand(command: Command): CommandRegister {
        this.set(command.builder.name, command);
        return this;
    }
}