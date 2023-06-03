import {Application} from "../../Application";
import {GameType} from "../../Game";
import {ActivityType} from "discord.js";
import {CommandRegister} from "../../CommandRegister";
import {SetupCommand} from "./commands/setup";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}},
    { name: "blacklist.json", default: {} },
];

export class SummerApp extends Application {

    constructor() {
        super("summer", GameType.Valorant);
        this.commands = new CommandRegister()
            .registerCommand(SetupCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}