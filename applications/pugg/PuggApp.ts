import {Application} from "../../Application";
import {
    ActivityType
} from "discord.js";
import {CommandRegister} from "../../CommandRegister";
import {SetupCommand} from "./commands/setup";

const requiredFiles = [
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class PuggApp extends Application {
    public constructor() {
        super("pugg");
        this.commands = new CommandRegister()
            .registerCommand(SetupCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}