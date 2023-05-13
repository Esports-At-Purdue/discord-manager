import {EmbedBuilder} from "discord.js";
import * as config from "../config.json";

export class ClassEmbed extends EmbedBuilder {
    constructor() {
        super();
        let description = "";
        for (const element in config.courses) {
            const course = config.courses[element];
            const name: string = course.name;
            const desc: string = course.desc;
            description = description.concat(`**${name}**: ${desc}\n`);
        }
        this.setDescription(description);
        this.setTitle("Purdue Math Courses");
        this.setColor("#2f3136");
    }
}