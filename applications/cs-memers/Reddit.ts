import {RedditEmbed} from "./embeds/Reddit.Embed";
import {TextBasedChannel} from "discord.js";
import {CSMemers} from "./cs-memers";
import * as config from "./config.json";
import * as fs from "fs";

export class Reddit {

    private static parsedIds: Array<string>;
    private static data: JSON;
    private static readFilePath = "./reddit.read.json";
    private static dataFilePath = "./reddit.json";

    private static loadFromFile(): void {
        Reddit.parsedIds = JSON.parse(fs.readFileSync(Reddit.readFilePath).toString());
        Reddit.data = JSON.parse(fs.readFileSync(Reddit.dataFilePath).toString());
    }

    private static writeFile(): void {
        fs.writeFileSync(Reddit.readFilePath, JSON.stringify(Reddit.parsedIds, null, 2));
    }

    public static async parse(): Promise<void> {
        Reddit.loadFromFile();

        const channels = [
            await CSMemers.client.channels.fetch(config.guild.channels.reddit) as TextBasedChannel
        ] as TextBasedChannel[];

        const entries: Entry[] = [];

        for (const entry in Reddit.data) {
            const value = new Entry(Reddit.data[entry], entry);
            entries.push(value);
        }

        entries.sort((a, b) => a.date.getTime() - b.date.getTime());

        for (const entry of entries) {
            if (Reddit.parsedIds.indexOf(entry.id) > -1) continue;

            if (entry.images.length > 0) {
                const embeds = [];
                embeds.push(new RedditEmbed(entry.title, entry.link, entry.date, entry.score, entry.body, entry.images[0]))
                for (let i = 1; i < 5 && i < entry.images.length; i++) {
                    embeds.push(new RedditEmbed(null, entry.link, null, null, null, entry.images[i]))
                }
                await channels.forEach(channel => channel.send({embeds: embeds}));
            } else {
                const embed = new RedditEmbed(entry.title, entry.link, entry.date, entry.score, entry.body, null);
                await channels.forEach(channel => channel.send({embeds: [embed]}));
            }

            Reddit.parsedIds.push(entry["id"]);
            break;
        }

        Reddit.writeFile();
    }
}


class Entry {
    public id: string;
    public title: string;
    public link: string;
    public date: Date;
    public score: number;
    public body: string;
    public images: string[];

    public constructor(data: object, id: string) {
        this.id = id;
        this.title = data["title"];
        this.link = data["link"].toString();
        this.date = new Date(data["date"] * 1000);
        this.score = data["score"];
        this.body = data["body"];
        this.images = data["previews"];
    }
}

class NewEntry {
    public id: string;
    public title: string;
    public link: string;
    public date: Date;
    public score: number;
    public body: string;
    public images: string[];

    constructor(id: string, title: string, link: string, date: Date, score: number, body: string, images: string[]) {
        this.id = id;
        this.title = title;
        this.link = link;
        this.date = date;
        this.score = score;
        this.body = body;
        this.images = images;
    }

    public static fromObject(object: any): NewEntry {
        const { id, title, link, date, score, body, images } = object;
        return new NewEntry(id, title, link, new Date(date), score, body, images);
    }
}