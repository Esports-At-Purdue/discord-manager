import {Application} from "../../Application";
import {DraftFormat, Queue} from "../../Queue";
import {GameType} from "../../Game";
import {ActivityType} from "discord.js";
import {RegisterCommand} from "./commands/register";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class WallyballApp extends Application {

    constructor() {
        super("wallyball", GameType.Wallyball);
        this.queue = new Queue(86400000, -1, false, GameType.Wallyball, DraftFormat.Auto, new Map());
        this.commands = new CommandRegister()
            .registerCommand(RegisterCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}