import {CanvasRenderingContext2D, Image} from "canvas";
import {GameType} from "../Game";
import {Player} from "../Player";

export default class Utils {
    public static printText
    (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, font: string, alignment: CanvasTextAlign) {
        ctx.fillStyle = color;
        ctx.textAlign = alignment;
        ctx.font = font;
        ctx.fillText(text, x, y);
        ctx.save();
    }

    public static printImage
    (ctx: CanvasRenderingContext2D, image: Image, x: number, y: number, width: number, height: number) {
        ctx.drawImage(image, x, y, width, height);
        ctx.restore();
        ctx.save();
    }

    public static printProfilePicture
    (ctx: CanvasRenderingContext2D, image: Image, x: number, y: number, radius: number) {
        ctx.beginPath();
        ctx.arc(x, y, radius * 1.05, 0, Math.PI * 2, true)
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, true)
        ctx.clip();
        ctx.drawImage(image, x - radius, y - radius, 2 * radius, 2 * radius);
        ctx.restore();
        ctx.save();
    }

    public static getGameRankPath(game: GameType, player: Player) {
        if (game == GameType.CSGO) {
            if (player.stats.csgo.elo < 50) return "./media/csgo/s1.png";
            if (player.stats.csgo.elo < 100) return "./media/csgo/s2.png";
            if (player.stats.csgo.elo < 150) return "./media/csgo/s3.png";
            if (player.stats.csgo.elo < 200) return "./media/csgo/s4.png";
            if (player.stats.csgo.elo < 250) return "./media/csgo/se.png";
            if (player.stats.csgo.elo < 300) return "./media/csgo/sem.png";
            if (player.stats.csgo.elo < 350) return "./media/csgo/gn1.png";
            if (player.stats.csgo.elo < 400) return "./media/csgo/gn2.png";
            if (player.stats.csgo.elo < 450) return "./media/csgo/gn3.png";
            if (player.stats.csgo.elo < 500) return "./media/csgo/gnm.png";
            if (player.stats.csgo.elo < 550) return "./media/csgo/mg1.png";
            if (player.stats.csgo.elo < 600) return "./media/csgo/mg2.png";
            if (player.stats.csgo.elo < 650) return "./media/csgo/mge.png";
            if (player.stats.csgo.elo < 700) return "./media/csgo/dmg.png";
            if (player.stats.csgo.elo < 750) return "./media/csgo/le.png";
            if (player.stats.csgo.elo < 800) return "./media/csgo/lem.png";
            if (player.stats.csgo.elo < 850) return "./media/csgo/smfc.png";
            if (player.stats.csgo.rank > 2) return "./media/csgo/smfc.png";
            return "./media/csgo/ge.png";
        }
        if (game == GameType.Siege) {
            if (player.stats.siege.elo < 20)   return "./media/siege/copper-5.png";
            if (player.stats.siege.elo < 40)   return "./media/siege/copper-4.png";
            if (player.stats.siege.elo < 60)   return "./media/siege/copper-3.png";
            if (player.stats.siege.elo < 80)   return "./media/siege/copper-2.png";
            if (player.stats.siege.elo < 100)  return "./media/siege/copper-1.png";
            if (player.stats.siege.elo < 120)  return "./media/siege/bronze-5.png";
            if (player.stats.siege.elo < 140)  return "./media/siege/bronze-4.png";
            if (player.stats.siege.elo < 160)  return "./media/siege/bronze-3.png";
            if (player.stats.siege.elo < 180)  return "./media/siege/bronze-2.png";
            if (player.stats.siege.elo < 200)  return "./media/siege/bronze-1.png";
            if (player.stats.siege.elo < 220)  return "./media/siege/silver-5.png";
            if (player.stats.siege.elo < 240)  return "./media/siege/silver-4.png";
            if (player.stats.siege.elo < 260)  return "./media/siege/silver-3.png";
            if (player.stats.siege.elo < 280)  return "./media/siege/silver-2.png";
            if (player.stats.siege.elo < 300)  return "./media/siege/silver-1.png";
            if (player.stats.siege.elo < 320)  return "./media/siege/gold-5.png";
            if (player.stats.siege.elo < 340)  return "./media/siege/gold-4.png";
            if (player.stats.siege.elo < 360)  return "./media/siege/gold-3.png";
            if (player.stats.siege.elo < 380)  return "./media/siege/gold-2.png";
            if (player.stats.siege.elo < 400)  return "./media/siege/gold-1.png";
            if (player.stats.siege.elo < 420)  return "./media/siege/platinum-5.png";
            if (player.stats.siege.elo < 440)  return "./media/siege/platinum-4.png";
            if (player.stats.siege.elo < 460)  return "./media/siege/platinum-3.png";
            if (player.stats.siege.elo < 480)  return "./media/siege/platinum-2.png";
            if (player.stats.siege.elo < 500)  return "./media/siege/platinum-1.png";
            if (player.stats.siege.elo < 520)  return "./media/siege/emerald-5.png";
            if (player.stats.siege.elo < 540)  return "./media/siege/emerald-4.png";
            if (player.stats.siege.elo < 560)  return "./media/siege/emerald-3.png";
            if (player.stats.siege.elo < 580)  return "./media/siege/emerald-2.png";
            if (player.stats.siege.elo < 600)  return "./media/siege/emerald-1.png";
            if (player.stats.siege.elo < 640)  return "./media/siege/diamond-5.png";
            if (player.stats.siege.elo < 680)  return "./media/siege/diamond-4.png";
            if (player.stats.siege.elo < 720)  return "./media/siege/diamond-3.png";
            if (player.stats.siege.elo < 760)  return "./media/siege/diamond-2.png";
            if (player.stats.siege.elo < 800)  return "./media/siege/diamond-1.png";
            if (player.stats.siege.rank > 2)   return "./media/siege/diamond-1.png";
            return "./media/siege/champions.png";
        }
        if (game == GameType.Overwatch) {
            //if (player.stats.overwatch.elo < 20)   return "./media/overwatch/bronze-5.png";
            //if (player.stats.overwatch.elo < 40)   return "./media/overwatch/bronze-4.png";
            //if (player.stats.overwatch.elo < 60)   return "./media/overwatch/bronze-3.png";
            //if (player.stats.overwatch.elo < 80)   return "./media/overwatch/bronze-2.png";
            if (player.stats.overwatch.elo < 100)   return "./media/overwatch/bronze-1.png";
            //if (player.stats.overwatch.elo < 120)  return "./media/overwatch/silver-5.png";
            //if (player.stats.overwatch.elo < 140)  return "./media/overwatch/silver-4.png";
            //if (player.stats.overwatch.elo < 160)  return "./media/overwatch/silver-3.png";
            //if (player.stats.overwatch.elo < 180)  return "./media/overwatch/silver-2.png";
            if (player.stats.overwatch.elo < 200)  return "./media/overwatch/silver-1.png";
            //if (player.stats.overwatch.elo < 220)  return "./media/overwatch/gold-5.png";
            //if (player.stats.overwatch.elo < 240)  return "./media/overwatch/gold-4.png";
            //if (player.stats.overwatch.elo < 260)  return "./media/overwatch/gold-3.png";
            //if (player.stats.overwatch.elo < 280)  return "./media/overwatch/gold-2.png";
            if (player.stats.overwatch.elo < 300)  return "./media/overwatch/gold-1.png";
            //if (player.stats.overwatch.elo < 320)  return "./media/overwatch/platinum-5.png";
            //if (player.stats.overwatch.elo < 340)  return "./media/overwatch/platinum-4.png";
            //if (player.stats.overwatch.elo < 360)  return "./media/overwatch/platinum-3.png";
            //if (player.stats.overwatch.elo < 380)  return "./media/overwatch/platinum-2.png";
            if (player.stats.overwatch.elo < 400)  return "./media/overwatch/platinum-1.png";
            //if (player.stats.overwatch.elo < 420)  return "./media/overwatch/diamond-5.png";
            //if (player.stats.overwatch.elo < 440)  return "./media/overwatch/diamond-4.png";
            //if (player.stats.overwatch.elo < 460)  return "./media/overwatch/diamond-3.png";
            //if (player.stats.overwatch.elo < 480)  return "./media/overwatch/diamond-2.png";
            if (player.stats.overwatch.elo < 500)  return "./media/overwatch/diamond-1.png";
            //if (player.stats.overwatch.elo < 520)  return "./media/overwatch/master-5.png";
            //if (player.stats.overwatch.elo < 540)  return "./media/overwatch/master-4.png";
            //if (player.stats.overwatch.elo < 560)  return "./media/overwatch/master-3.png";
            //if (player.stats.overwatch.elo < 580)  return "./media/overwatch/master-2.png";
            if (player.stats.overwatch.elo < 600)  return "./media/overwatch/master-1.png";
            //if (player.stats.overwatch.elo < 640)  return "./media/overwatch/grandmaster-5.png";
            //if (player.stats.overwatch.elo < 680)  return "./media/overwatch/grandmaster-4.png";
            //if (player.stats.overwatch.elo < 720)  return "./media/overwatch/grandmaster-3.png";
            //if (player.stats.overwatch.elo < 760)  return "./media/overwatch/grandmaster-2.png";
            if (player.stats.overwatch.elo < 800)  return "./media/overwatch/grandmaster-1.png";
            if (player.stats.overwatch.rank > 2)   return "./media/overwatch/grandmaster-1.png";
            return "./media/overwatch/god.png";
        }
        if (game == GameType.Valorant) {
            if (player.stats.valorant.elo < 30)   return "./media/valorant/iron-1.png";
            if (player.stats.valorant.elo < 60)   return "./media/valorant/iron-2.png";
            if (player.stats.valorant.elo < 100)  return "./media/valorant/iron-3.png";
            if (player.stats.valorant.elo < 130)  return "./media/valorant/bronze-1.png";
            if (player.stats.valorant.elo < 160)  return "./media/valorant/bronze-2.png";
            if (player.stats.valorant.elo < 200)  return "./media/valorant/bronze-3.png";
            if (player.stats.valorant.elo < 230)  return "./media/valorant/silver-1.png";
            if (player.stats.valorant.elo < 260)  return "./media/valorant/silver-2.png";
            if (player.stats.valorant.elo < 300)  return "./media/valorant/silver-3.png";
            if (player.stats.valorant.elo < 330)  return "./media/valorant/gold-1.png";
            if (player.stats.valorant.elo < 360)  return "./media/valorant/gold-2.png";
            if (player.stats.valorant.elo < 400)  return "./media/valorant/gold-3.png";
            if (player.stats.valorant.elo < 430)  return "./media/valorant/platinum-1.png";
            if (player.stats.valorant.elo < 460)  return "./media/valorant/platinum-2.png";
            if (player.stats.valorant.elo < 500)  return "./media/valorant/platinum-3.png";
            if (player.stats.valorant.elo < 530)  return "./media/valorant/diamond-1.png";
            if (player.stats.valorant.elo < 560)  return "./media/valorant/diamond-2.png";
            if (player.stats.valorant.elo < 600)  return "./media/valorant/diamond-3.png";
            if (player.stats.valorant.elo < 630)  return "./media/valorant/ascendant-1.png";
            if (player.stats.valorant.elo < 660)  return "./media/valorant/ascendant-2.png";
            if (player.stats.valorant.elo < 700)  return "./media/valorant/ascendant-3.png";
            if (player.stats.valorant.elo < 730)  return "./media/valorant/immortal-1.png";
            if (player.stats.valorant.elo < 760)  return "./media/valorant/immortal-2.png";
            if (player.stats.valorant.elo < 800)  return "./media/valorant/immortal-3.png";
            if (player.stats.valorant.rank > 2)   return "./media/valorant/immortal-3.png";
            return "./media/valorant/radiant.png"
        }
        if (game == GameType.Wallyball) {
            if (player.stats.wallyball.elo < 30)   return "./media/wallyball/iron-1.png";
            if (player.stats.wallyball.elo < 60)   return "./media/wallyball/iron-2.png";
            if (player.stats.wallyball.elo < 100)  return "./media/wallyball/iron-3.png";
            if (player.stats.wallyball.elo < 130)  return "./media/wallyball/bronze-1.png";
            if (player.stats.wallyball.elo < 160)  return "./media/wallyball/bronze-2.png";
            if (player.stats.wallyball.elo < 200)  return "./media/wallyball/bronze-3.png";
            if (player.stats.wallyball.elo < 230)  return "./media/wallyball/silver-1.png";
            if (player.stats.wallyball.elo < 260)  return "./media/wallyball/silver-2.png";
            if (player.stats.wallyball.elo < 300)  return "./media/wallyball/silver-3.png";
            if (player.stats.wallyball.elo < 330)  return "./media/wallyball/gold-1.png";
            if (player.stats.wallyball.elo < 360)  return "./media/wallyball/gold-2.png";
            if (player.stats.wallyball.elo < 400)  return "./media/wallyball/gold-3.png";
            if (player.stats.wallyball.elo < 430)  return "./media/wallyball/platinum-1.png";
            if (player.stats.wallyball.elo < 460)  return "./media/wallyball/platinum-2.png";
            if (player.stats.wallyball.elo < 500)  return "./media/wallyball/platinum-3.png";
            if (player.stats.wallyball.elo < 530)  return "./media/wallyball/diamond-1.png";
            if (player.stats.wallyball.elo < 560)  return "./media/wallyball/diamond-2.png";
            if (player.stats.wallyball.elo < 600)  return "./media/wallyball/diamond-3.png";
            if (player.stats.wallyball.elo < 630)  return "./media/wallyball/ascendant-1.png";
            if (player.stats.wallyball.elo < 660)  return "./media/wallyball/ascendant-2.png";
            if (player.stats.wallyball.elo < 700)  return "./media/wallyball/ascendant-3.png";
            if (player.stats.wallyball.elo < 730)  return "./media/wallyball/immortal-1.png";
            if (player.stats.wallyball.elo < 760)  return "./media/wallyball/immortal-2.png";
            if (player.stats.wallyball.elo < 800)  return "./media/wallyball/immortal-3.png";
            if (player.stats.wallyball.rank > 2)   return "./media/wallyball/immortal-3.png";
            return "./media/wallyball/radiant.png"
        }
    }

    public static getGameLogoPath(game: GameType): string {
        if (game == GameType.CSGO)  return "./media/csgo/logo.png";
        if (game == GameType.Siege) return "./media/siege/logo.png";
        if (game == GameType.Overwatch)  return "./media/overwatch/logo.png";
        if (game == GameType.Valorant)   return "./media/valorant/logo.png";
        if (game == GameType.Wallyball)  return "./media/wallyball/logo.png";
    }

    public static getOrdinalSuffix(i): string {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }
}