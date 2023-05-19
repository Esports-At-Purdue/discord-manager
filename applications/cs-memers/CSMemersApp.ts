import {ActivityType} from "discord.js";
import {Application} from "../../Application";
import {BlacklistCommand} from "./commands/blacklist";
import {DeleteCommand} from "./commands/delete";
import {SayCommand} from "./commands/say";
import {RegisterCommand} from "./commands/setup";
import {FeaturesCommand} from "./commands/features";
import {PunishCommand} from "./commands/punish";
import {RoleCommand} from "./commands/role";
import {Reaction} from "./Reaction";
import * as fs from "fs";
import {CommandRegister} from "../../CommandRegister";
import {GameType} from "../../Game";

const requiredFiles = [
    { name: "status.json", default: {name: "Hello, World!", type: 0} },
    { name: "blacklist.json", default: {} },
    { name: "bruv.json", default: [] },
    { name: "reactions.json", default: {} },
    { name: "reddit.json", default: {} },
    { name: "reddit.read.json", default: [] }
];

export class CSMemersApp extends Application {

    public constructor() {
        super("cs-memers", null);
        this.commands = new CommandRegister()
            .registerCommand(BlacklistCommand)
            .registerCommand(DeleteCommand)
            .registerCommand(FeaturesCommand)
            .registerCommand(PunishCommand)
            .registerCommand(RoleCommand)
            .registerCommand(SayCommand)
            .registerCommand(RegisterCommand)
        this.ensureDataFilesExist(requiredFiles);
    }

    public readMessagesFile(): string[] {
        return JSON.parse(fs.readFileSync("./bruv.json").toString());
    }

    public writeMessagesFile(messages: string[]) {
        fs.writeFileSync("./bruv.json", JSON.stringify(messages, null, 2));
    }

    public readReactionsFile(): Map<string, Reaction[]> {
        const jsonString = fs.readFileSync("./reactions.json", "utf8");
        const reactionsMap = JSON.parse(jsonString) as Record<string, any[]>;

        const updatedReactionsMap = new Map<string, Reaction[]>();

        Object.entries(reactionsMap).forEach(([key, value]) => {
            const reactions = (value as any[]).map((element: any) => Reaction.fromObject(element));
            updatedReactionsMap.set(key, reactions);
        });

        return updatedReactionsMap;
    }

    public writeReactionsFile(reactionsMap: Map<string, Reaction[]>) {
        const plainObject = Object.fromEntries(reactionsMap);
        const jsonString = JSON.stringify(plainObject, null, 2);
        fs.writeFileSync("./reactions.json", jsonString, "utf8");
    }
}