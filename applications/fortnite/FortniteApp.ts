import {Application} from "../../Application";
import {Queue} from "../../Queue";
import {SetupCommand} from "./commands/setup";
import {CommandRegister} from "../../CommandRegister";

const requiredFiles = [
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class FortniteApp extends Application {

    public queue: Queue;

    public constructor() {
        super("fortnite", null);
        this.commands = new CommandRegister()
            .registerCommand(SetupCommand)
        this.ensureDataFilesExist(requiredFiles);
    }
}