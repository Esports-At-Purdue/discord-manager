import {EmbedBuilder} from "discord.js";

export class StandingEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Standings Roles");
        this.setColor("#2f3136");
        this.setDescription(
            "🇫  - Freshmen\n" +
            "🇸  - Sophomore\n" +
            "🇯  - Junior\n" +
            "🎓  - Senior"
        );
    }
}