import {EmbedBuilder} from "discord.js";

export class WelcomeEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Welcome to PUGG!");
        this.setColor("#2f3136")
        this.setDescription(
                "Welcome to the Purdue University Gamers Group discord server!\n" +
                "\n" +
                "To view the full server, click the button below.\n" +
                "\n" +
                "Custom roles can be found in <#887080782668136478>. To gain access to the verified Purdue-only channels, head over to <#887084374217072670>.\n" +
                "\n" +
                "Thanks again for checking us out, and if you have any questions, just find the relevant text channel! "
            );
    }
}