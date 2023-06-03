import {RedditEmbed} from "./embeds/Reddit.Embed";
import {Application} from "../../Application";
import {TextBasedChannel} from "discord.js";
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

    public static async parse(application: Application): Promise<void> {
        Reddit.loadFromFile();

        const channels = [
            await application.client.channels.fetch(config.guild.channels.reddit) as TextBasedChannel
        ] as TextBasedChannel[];

        const entries = Object.entries(Reddit.data)
            .map(([entryId, entryData]) => Entry.fromObject(entryData, entryId))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        const unseenEntry = entries.find(entry => !Reddit.parsedIds.includes(entry.id));

        if (!unseenEntry) return;

        const embeds = [];

        if (unseenEntry.images.length > 0) {
            embeds.push(new RedditEmbed(unseenEntry.title, unseenEntry.link, unseenEntry.date, unseenEntry.score, unseenEntry.body, unseenEntry.images[0]));

            for (let i = 1; i < Math.min(5, unseenEntry.images.length); i++) {
                embeds.push(new RedditEmbed(null, unseenEntry.link, null, null, null, unseenEntry.images[i]));
            }
        } else {
            embeds.push(new RedditEmbed(unseenEntry.title, unseenEntry.link, unseenEntry.date, unseenEntry.score, unseenEntry.body, null));
        }

        channels.forEach(channel => channel.send({embeds: embeds}).catch());
        Reddit.parsedIds.push(unseenEntry.id);
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

    constructor(id: string, title: string, link: string, date: Date, score: number, body: string, images: string[]) {
        this.id = id;
        this.title = title;
        this.link = link;
        this.date = date;
        this.score = score;
        this.body = body;
        this.images = images;
    }

    public static fromObject(data: any, id: string) {
        const { title, link, date, score, body, previews } = data;
        return new Entry(id, title, link.toString(), new Date(date * 1000), score, body, previews);
    }
}

/*
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
 */