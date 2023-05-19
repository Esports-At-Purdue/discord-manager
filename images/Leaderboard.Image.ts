import * as cnv from "canvas";
import {Canvas} from "canvas";
import {Player} from "../Player";
import {GameType} from "../Game";
import Utils from "./Utils";
import {Application} from "../Application";

export class LeaderboardImage {
    public canvas: Canvas;

    public static width = 2560;
    public static height = 1440;
    public static path = "../../media/Leaderboard.png";

    constructor(canvas: Canvas) {
        this.canvas = canvas;
    }

    public static async build(players: Player[], game: GameType, application: Application): Promise<LeaderboardImage> {
        const canvas = cnv.createCanvas(LeaderboardImage.width, LeaderboardImage.height);
        const context = canvas.getContext("2d");
        const background = await cnv.loadImage(LeaderboardImage.path);
        const gameLogo = await cnv.loadImage(Utils.getGameLogoPath(game));

        Utils.printImage(context, background, 0, 0, canvas.width, canvas.height);
        Utils.printImage(context, gameLogo, 2420, 40, 100, 100);

        for (let i = 0; i < 5; i++) {
            const player = players[i];
            if (!player) continue;
            const user = await application.client.users.fetch(player.id);
            const avatarUrl = user.displayAvatarURL({extension: "png", size: 256});
            const avatar = await cnv.loadImage(avatarUrl);
            const rank = await cnv.loadImage(Utils.getGameRankPath(game, player));
            Utils.printImage(context, rank, 144, 400 + 200 * i, 125, 125);
            Utils.printProfilePicture(context, avatar, 980, 460 + 200 * i, 64);
            Utils.printText(context, player.getName(game), 1080, 490 + 200 * i, "#FFFFFF", "90px sans-serif","left");
            Utils.printText(context, `${player.getElo(game)} Elo`, 2200, 490 + 200 * i, "#FFFFFF", "90px sans-serif","center");
            Utils.printText(context, `${Utils.getOrdinalSuffix(player.getRank(game))}`, 550, 490 + 200 * i, "#FFFFFF", "90x sans-serif", "center");
        }

        return new LeaderboardImage(canvas);
    }
}