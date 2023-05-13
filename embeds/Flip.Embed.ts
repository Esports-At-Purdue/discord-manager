import {Colors, EmbedBuilder} from "discord.js";

export class FlipEmbed extends EmbedBuilder {
    public constructor(heads: boolean) {
        super();
        if (heads) {
            this.setTitle("Heads!")
            this.setThumbnail("https://static.thenounproject.com/png/365780-200.png");
            this.setColor(Colors.Gold);
        }
        else {
            this.setTitle("Tails!")
            this.setThumbnail("https://static.thenounproject.com/png/365781-200.png")
            this.setColor(Colors.LightGrey);
        }
    }
}