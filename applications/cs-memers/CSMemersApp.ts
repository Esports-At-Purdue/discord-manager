import {
    ActivityType

} from "discord.js";
import {Application} from "../../Application";
import {CommandRegister} from "../../CommandRegister";
import {BlacklistCommand} from "./commands/blacklist";
import {DeleteCommand} from "./commands/delete";
import {SayCommand} from "./commands/say";
import {RegisterCommand} from "./commands/setup";
import {FeaturesCommand} from "./commands/features";
import {PunishCommand} from "./commands/punish";
import {RoleCommand} from "./commands/role";

const requiredFiles = [
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class CSMemersApp extends Application {
    public constructor() {
        super("cs-memers");
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
}