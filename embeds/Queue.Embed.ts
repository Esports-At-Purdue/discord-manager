import {ColorResolvable, EmbedBuilder} from "discord.js";
import {Player} from "../Player";
import {GameType} from "../Game";

export class QueueEmbed extends EmbedBuilder {
    public constructor(message: string, players: Array<Player>, capacity: number, game: GameType, color: ColorResolvable) {
        super();
        const description = players.map((player, index) => `**${index + 1}.** ${player.getName(game)}`).join('\n');
        if (players.length > 0) this.setDescription(description);
        if (capacity > 1) this.setTitle(message.concat(` [${players.length}/${capacity}]`));
        else this.setTitle(message);
        this.setColor(color);
    }
}