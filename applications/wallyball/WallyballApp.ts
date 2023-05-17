import {Application} from "../../Application";
import {Queue} from "../../Queue";
import {GameType} from "../../Game";
import {ActivityType} from "discord.js";
import {RegisterCommand} from "./commands/register";

export class WallyballApp extends Application {
    public queue: Queue;

    constructor() {
        super("wallyball");
        this.queue = new Queue(86400000, -1, GameType.Wallyball, new Map());
        this.commands
            .registerCommand(RegisterCommand)
    }
}