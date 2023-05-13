export class Reaction {
    public messageId: string;
    public channelId: string;
    public time: number;

    public constructor(messageId: string, channelId: string, time: number) {
        this.messageId = messageId;
        this.channelId = channelId;
        this.time = time;
    }
}