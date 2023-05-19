import {Application} from "../../Application";
import {Queue} from "../../Queue";
import {GameType} from "../../Game";
import {ActivityType} from "discord.js";
import {SetupCommand} from "./commands/setup";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class ValorantApp extends Application {

    public queue: Queue;

    constructor() {
        super("valorant", GameType.Valorant);
        this.queue = new Queue(3600000, 10, true, GameType.Valorant, new Map());
        this.commands = new CommandRegister()
            .registerCommand(SetupCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}