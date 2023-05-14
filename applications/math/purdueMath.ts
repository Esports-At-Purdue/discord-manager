import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {Events, GuildMember, Interaction} from "discord.js";
import {MathApp} from "./MathApp";
import {Student} from "../../Student";
import {PurdueModal} from "../../modals/Purdue.Modal";
import {Verifier} from "../../Verifier";

SourceMaps.install();
export const PurdueMath = new MathApp();

PurdueMath.client.login(config.token).then(async () => {
    await PurdueMath.load(config.token, config.guild.id, config.guild.channels.logs);
});

PurdueMath.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;

    if (interaction.isChatInputCommand()) {
        const command = PurdueMath.commands.get(interaction.commandName);

        try {
            command.execute(interaction, PurdueMath).catch();
        } catch (error) {
            PurdueMath.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {
        const user = interaction.user;
        const role = await PurdueMath.guild.roles.fetch(interaction.customId);

        try {

            const member = await PurdueMath.guild.members.fetch(user);

            if (role.id == config.guild.roles.purdue) {
                const student = await Student.fetch(user.id);

                if (student && student.verified) {
                    member.roles.add(role.id).catch();
                    interaction.reply({content: `You are verified. Thank you!`, ephemeral: true}).catch();
                    return;
                }

                const modal = new PurdueModal();
                interaction.showModal(modal).catch();
                return;
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                if (!hasMajorRole(member)) member.roles.add(config.guild.roles.other).catch();
                return;
            } else {
                member.roles.add(role.id).catch();
                interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                if (hasMajorRole(member)) member.roles.remove(config.guild.roles.other).catch();
                if (role.id == config.guild.roles.ta) interaction.followUp({content: "This role is for UTAs and GTAs. Please de-equip if it if you are not a Math UTA or GTA.", ephemeral: true})
                return;
            }

        } catch (error) {
            PurdueMath.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {
        try {

            const name = interaction.customId;

            if (name == "purdue") {
                const email = interaction.fields.getTextInputValue("email");

                if (!Verifier.isValidEmail(email)) {
                    interaction.reply({content: `Sorry, address you provided, \`${email}\`, is invalid. Please provide a valid Purdue address.`, ephemeral: true}).catch();
                    return;
                }

                Verifier.registerNewStudent(user, email, interaction).catch();
                interaction.reply({content: `A Verification Email has been sent to \`${email}\`.`, ephemeral: true}).catch();
                return;
            }

        } catch (error) {
            PurdueMath.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

PurdueMath.client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const student = await Student.fetch(member.id);
    if (student && student.verified) member.roles.add(config.guild.roles.purdue).catch();
    member.roles.add(config.guild.roles.other).catch();
})

function hasMajorRole(member: GuildMember): boolean {
    const majorRoles = Object.values(config.guild.roles.majors);
    return member.roles.cache.some(role => majorRoles.includes(role.id));
}
