import {EmbedBuilder} from "discord.js";

export class MajorEmbed extends EmbedBuilder {
    constructor() {
        super();
        this.setTitle("Purdue STEM Majors");
        this.setColor("#2f3136");
        this.setDescription(
            "🌿 - Agriculture\n" +
            "🧬 - Biology\n" +
            "👩‍🔬 - Chemistry\n" +
            "💻 - Computer Science\n" +
            "🌎 - Earth & Planetary Science\n" +
            "⚙ - Engineering\n" +
            "💉 - Health & Human Science\n" +
            "🔢 - Math\n" +
            "🧪 - Pharmacy\n" +
            "☢ - Physics\n" +
            "📐 - Polytechnic\n" +
            "🐴 - Veterinary Science"
        )
    }
}