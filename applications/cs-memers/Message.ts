import * as fs from "fs";

export class Message {
    public id: string;
    public author: string;
    public content: string;
    public parent: Message;

    constructor(id: string, author: string, content: string, parent: Message) {
        this.id = id;
        this.author = author;
        this.content = content;
        this.parent = parent;
    }

    public static fromObject(object) {
        if (!object) return null;
        const { id, author, content, parent } = object;
        return new Message(id, author, content, Message.fromObject(parent));
    }

    public static readMessagesFile(): Message[] {
        const data: any[] = JSON.parse(fs.readFileSync("./bruv.json").toString());
        return data.map(element => Message.fromObject(element));
    }

    public static writeMessagesFile(messages: Message[]) {
        fs.writeFileSync("./bruv.json", JSON.stringify(messages, null, 2));
    }
}