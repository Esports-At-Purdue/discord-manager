import {EmbedBuilder} from "discord.js";

export class RedditEmbed extends EmbedBuilder {
    constructor(title: string, link: string, date: Date, score: number, body: string, image: string) {
        super();
        if (title != null) this.setTitle(title);
        if (link != null)  this.setURL(link);
        if (body != null && body != "")  this.setDescription(body);
        if (date != null)  this.setTimestamp(date);
        if (image != null) this.setImage(image);
        if (score != null) this.setFooter({text: `Score: ${score}`, iconURL: `https://www.iconpacks.net/icons/2/free-reddit-logo-icon-2436-thumb.png`});
    }
}