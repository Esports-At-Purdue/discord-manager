import {ActionRowBuilder, SelectMenuBuilder} from "discord.js";
import {GamesSelectMenus} from "./Games.SelectMenus";

export class GamesActionRows extends Array<ActionRowBuilder<SelectMenuBuilder>> {
    constructor() {
        super();
        const selectMenus = new GamesSelectMenus();
        for (const selectMenu of selectMenus) {
            const actionRow = new ActionRowBuilder<SelectMenuBuilder>().addComponents(selectMenu);
            this.push(actionRow);
        }
    }
}