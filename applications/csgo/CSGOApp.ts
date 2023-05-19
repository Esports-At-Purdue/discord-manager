import {Application} from "../../Application";
import {Queue} from "../../Queue";
import {GameType} from "../../Game";
import {SetupCommand} from "./commands/setup";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class CSGOApp extends Application {

    public queue: Queue;

    public constructor() {
        super("csgo", GameType.CSGO);
        this.queue = new Queue(3600000, 10, true, GameType.CSGO, new Map());
        this.commands = new CommandRegister()
            .registerCommand(SetupCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}