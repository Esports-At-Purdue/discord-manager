import {EmbedBuilder} from "discord.js";

export class RolesEmbed extends EmbedBuilder {
    public constructor() {
        super();
        this.setTitle("BoilerCS Server Roles");
        this.setColor("#2f3136")
        this.setDescription(
            "• **Boilermaker** - React if you are an alumnus, student, or incoming freshman.\n" +
            "• **Visitors** - React if you are not associated with Purdue.\n" +
            "• **Pugs** - React to receive access to Pugs channels and notifications.\n" +
            "• **10mans** - React to receive access to 10mans channels and notifications.\n"
        )
    }
}