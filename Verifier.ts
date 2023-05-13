import * as crypto from "crypto";
import * as mailer from "nodemailer";
import * as config from "./config.json";
import {ModalSubmitInteraction} from "discord.js";
import {Student} from "./Student";

export class Verifier {
    private static readonly timer = 870000;
    private static readonly regex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    private static timeouts: Map<string, Timeout> = new Map();

    public static insert(id: string, interaction: ModalSubmitInteraction) {
        Student.fetch(id).then((student) => {
            if (student && student.verified) return;
            const timeout = global.setTimeout(Verifier.timeout, Verifier.timer, id, interaction);
            Verifier.timeouts.set(id, new Timeout(timeout, interaction));
        });
    }

    public static remove(id: string) {
        const entry = Verifier.timeouts.get(id);
        Verifier.remove(id);
        return entry;
    }

    private static timeout(id: string, interaction: ModalSubmitInteraction) {
        Verifier.timeouts.delete(id);
        interaction.followUp({content: `Hey <@${id}>, your verification email has timed out. Please click the **Purdue Button** to send another one.`, ephemeral: true}).catch();
    }

    public static isValidEmail(email: string): boolean {
        const allowedDomains = ["purdue.edu", "alumni.purdue.edu", "student.purdueglobal.edu"]
        const emailRegex = /^[^\s<>]+@[^\s<>]+\.[^\s<>]+$/;
        const domainRegex = new RegExp(`@(${allowedDomains.map(domain => domain.replace('.', '\\.'))?.join('|')})$`, 'i');

        return emailRegex.test(email) && domainRegex.test(email);
    }

    public static sendEmail(email: string, link: string): void {

        const transporter = mailer.createTransport({
            service: 'gmail',
            auth: {
                user: config.email.username,
                pass: config.email.password
            }
        });

        const mailOptions = {
            from: config.email.username,
            to: email,
            subject: 'PUGG Discord Account Verification',
            html: `
                <h1>PUGG Discord Account Verification</h1>
                <p>Click the link below to verify your account:</p>
                <p><a href="${link}">${link}</a></p>
            `
        };

        transporter.sendMail(mailOptions).catch();
    }

    public static encrypt(text: string): {iv: string, content: string} {

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-ctr", config.key, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

        return {iv: iv.toString("hex"), content: encrypted.toString("hex")};
    }
}

class Timeout {
    public readonly timeout: NodeJS.Timeout;
    public readonly interaction: ModalSubmitInteraction;

    constructor(timeout: NodeJS.Timeout, interaction: ModalSubmitInteraction) {
        this.timeout = timeout;
        this.interaction = interaction;
    }
}