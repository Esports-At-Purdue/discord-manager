import {Application} from "../../Application";
import {ActivityType} from "discord.js";
import {DraftFormat, Queue} from "../../Queue";
import {GameType} from "../../Game";
import {SetupCommand} from "./commands/setup";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class OverwatchApp extends Application {

    constructor() {
        super("overwatch", GameType.Overwatch);
        this.queue = new Queue(3600000, 10, true, GameType.Overwatch, DraftFormat.Linear, new Map());
        this.commands = new CommandRegister()
            .registerCommand(SetupCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}