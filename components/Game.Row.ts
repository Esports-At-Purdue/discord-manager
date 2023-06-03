import {ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import {GameType} from "../Game";
import {Player} from "../Player";

export class GameRow extends ActionRowBuilder<StringSelectMenuBuilder> {
    public constructor(players: Player[], game: GameType) {
        super();
        this.addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("pick")
                .setPlaceholder("Select a player!")
                .addOptions(players.map(
                        player => new StringSelectMenuOptionBuilder()
                            .setLabel(player.getName(game))
                            .setValue(player.id)
                    )
                )
        )
    }
}