import {Application} from "../../Application";
import {ActivityType} from "discord.js";
import {Queue} from "../../Queue";
import {GameType} from "../../Game";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class OverwatchApp extends Application {
    public queue: Queue;

    constructor() {
        super("overwatch");
        this.queue = new Queue(3600000, 10, GameType.Overwatch, new Map());
        this.commands = new CommandRegister();
        this.ensureDataFilesExist(requiredFiles);
    }
}