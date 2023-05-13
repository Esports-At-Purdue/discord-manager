import {Application} from "../../Application";
import {Queue} from "../../Queue";
import {GameType} from "../../Game";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class SiegeApp extends Application {
    public queue: Queue;

    constructor() {
        super("siege");
        this.queue = new Queue(3600000, 10, GameType.Siege, new Map());
        this.commands = new CommandRegister()
        this.ensureDataFilesExist(requiredFiles);
    }
}