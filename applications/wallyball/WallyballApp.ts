import {Application} from "../../Application";
import {Queue} from "../../Queue";
import {GameType} from "../../Game";
import {ActivityType} from "discord.js";
import {RegisterCommand} from "./commands/register";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class WallyballApp extends Application {
    public queue: Queue;

    constructor() {
        super("wallyball", GameType.Wallyball);
        this.queue = new Queue(86400000, -1, GameType.Wallyball, new Map(), false);
        this.commands = new CommandRegister()
            .registerCommand(RegisterCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}