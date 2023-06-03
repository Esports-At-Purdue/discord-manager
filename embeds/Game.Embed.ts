import {ColorResolvable, Colors, EmbedBuilder, EmbedField} from "discord.js";
import {Game, GameOutcome} from "../Game";
import {Team} from "../Team";

export class GameEmbed extends EmbedBuilder {
    public constructor(title: string, fields: EmbedField[], color: ColorResolvable) {
        super();
        this.setTitle(title);
        this.setColor(color);
        this.setFields(fields);
        this.setImage("attachment://map.jpg");
    }

    public static async build(game: Game, teamOne: Team, teamTwo: Team): Promise<GameEmbed> {
        const teamOnePlayers = await teamOne.getPlayers();
        const teamTwoPlayers = await teamTwo.getPlayers();

        const fieldOne = {
            name: teamOne.getName(),
            value: teamOnePlayers.map((player) => player.getName(game.type)).join("\n"),
            inline: true,
        };
        const fieldTwo = {
            name: teamTwo.getName(),
            value: teamTwoPlayers.map((player) => player.getName(game.type)).join("\n"),
            inline: true,
        };

        const outcomes = {
            [GameOutcome.InProgress]: {
                title: `Game ${game.id} - ${convertToTitleCase(game.type)}`,
                color: Colors.Yellow,
            },
            [GameOutcome.Draw]: {
                title: `Game ${game.id} - ${teamOne.name} & ${teamTwo.name} draw`,
                color: Colors.DarkBlue,
            },
            [GameOutcome.TeamOneWin]: {
                title: `Game ${game.id}: ${teamOne.name} wins ${teamOne.points} - ${teamTwo.points}`,
                color: Colors.DarkGreen,
            },
            [GameOutcome.TeamTwoWin]: {
                title: `Game ${game.id}: ${teamTwo.name} wins ${teamTwo.points} - ${teamOne.points}`,
                color: Colors.DarkRed,
            },
        };

        const outcome = outcomes[game.outcome];
        return new GameEmbed(outcome.title, [fieldOne, fieldTwo], outcome.color);
    }
}

function convertToTitleCase(input: string): string {
    const words = input.split(/[ _]/);
    const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalizedWords.join(' ');
}

