import * as SourceMaps from "source-map-support";
import * as config from "./config.json";
import {Events, Interaction} from "discord.js";
import {Player} from "../../Player";
import {Student} from "../../Student";
import {Router} from "../../Router";
import {FortniteApp} from "./FortniteApp";

SourceMaps.install();

const Fortnite = new FortniteApp();

Fortnite.client.login(config.token).then(() => {
    Fortnite.load(config.token, config.guild.id, config.guild.channels.logs).then(async () => {

    });
});

Fortnite.client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    const user = interaction.user;
    const player = await Player.fetch(user.id);
    const student = await Student.fetch(user.id);

    if (interaction.isChatInputCommand()) {
        const command = Fortnite.commands.get(interaction.commandName);

        try {
            command.execute(interaction, Fortnite).catch();
        } catch (error) {
            Fortnite.logger.error(`Command by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isButton()) {

        try {

            if (interaction.customId.startsWith("page")) {
                Fortnite.handleLeaderboardButton(interaction).catch();
                return;
            }

            const role = await Fortnite.guild.roles.fetch(interaction.customId);
            const member = await Fortnite.guild.members.fetch(user.id);

            if (role.id == config.guild.roles.purdue) {
                Fortnite.handlePurdueButton(interaction, student, member, role.id).catch();
                return;
            }

            if (member.roles.cache.has(role.id)) {
                member.roles.remove(role.id).catch();
                interaction.reply({content: `You removed **<@&${role.id}>**.`, ephemeral: true});
                return;
            } else {
                member.roles.add(role.id).catch();
                interaction.reply({content: `You applied **<@&${role.id}>**.`, ephemeral: true});
                return;
            }

        } catch (error) {
            Fortnite.logger.error(`Button by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }

    if (interaction.isModalSubmit()) {

        try {

            const name = interaction.customId;

            if (name == "register") {
                Fortnite.handlePlayerModal(interaction, null).catch();
                return;
            }

            if (name == "wallyball") {
                Fortnite.handleWallyballModal(interaction, null).catch();
                return;
            }

            if (name == "purdue") {
                Fortnite.handlePurdueModal(user, interaction).catch();
                return;
            }

        } catch (error) {
            Fortnite.logger.error(`Modal by ${user.username} errored`, error);
            if (interaction.replied) interaction.followUp({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
            else interaction.reply({content: `Sorry, that didn't work.`, ephemeral: true}).catch();
        }
    }
});

Router.express.get(`/activate/:id`, (request, response) => {
    Fortnite.handleAutomaticRole(request, response, config.guild.roles.purdue).catch(error =>
        Fortnite.logger.error("Error Applying Automatic Role", error)
    );
});

Router.express.get(`/invalid/:id`, (request: Request, response: Response) => {
    Fortnite.handleUnreachableEmail(request, response).catch(error =>
        Fortnite.logger.error("Error handling unreachable email", error)
    );
});
