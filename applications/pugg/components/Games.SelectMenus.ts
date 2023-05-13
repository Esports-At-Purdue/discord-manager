import {SelectMenuBuilder} from "discord.js";
import * as config from "../config.json";

export class GamesSelectMenus extends Array<SelectMenuBuilder> {
    constructor() {
        super();
        const games = sortGames(config.guild.roles.games);

        for (let i = 0; i < Math.ceil(games.length / 25); i++) {
            const selectMenu = new SelectMenuBuilder()
                .setCustomId(`select_${i}`)
                .setPlaceholder("Select your favorite games!");

            for (let j = i * 25; j < (i * 25) + 25; j++) {
                if (games[j] !== undefined) {
                    selectMenu.addOptions([
                        {
                            label: `${games[j]["name"]}`,
                            value: `${games[j]["id"]}`,
                            emoji: games[j]["emote_id"]
                        }
                    ]);
                }
            }
            this.push(selectMenu);
        }
    }
}

function sortGames(array) {
    array.sort(function(a,b) {
        let name1 = a.name.toLowerCase();
        let name2 = b.name.toLowerCase();
        if (name1 < name2) {
            return -1;
        }
        if (name2 < name1) {
            return 1;
        }
        return 0;
    });
    return array;
}