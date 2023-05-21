import * as fs from "fs";
import * as http from "http";
import * as express from "express";
import {Request, Response} from "express";
import * as config from "../../config.json";
import {Database} from "../../Database";
import {Student} from "../../Student";
import {Verifier} from "../../Verifier";
import {Player} from "../../Player";
import {GameType} from "../../Game";
import {Router} from "../../Router";

Database.load().then(async () => {
    const app = express();
    app.use("/students", StudentRouter);
    app.use("/players", PlayerRouter);
    app.use("/csgo", CSGORouter);
    app.use("/siege", SiegeRouter);
    app.use("/overwatch", OverwatchRouter);
    app.use("/valorant", ValorantRouter);
    app.use("/wallyball", WallyballRouter);
    app.listen(1560);
})

const StudentRouter = express.Router();
const PlayerRouter = express.Router();
const CSGORouter = express.Router();
const SiegeRouter = express.Router();
const OverwatchRouter = express.Router();
const ValorantRouter = express.Router();
const WallyballRouter = express.Router();


StudentRouter.use(express.json());
PlayerRouter.use(express.json());
CSGORouter.use(express.json());
SiegeRouter.use(express.json());
OverwatchRouter.use(express.json());
ValorantRouter.use(express.json());
WallyballRouter.use(express.json());


/*
    Student Router
 */

StudentRouter.get("/", async (req: Request, res: Response) => {
    try {
        const key = req?.query?.key;

        if (key != config.key) {
            res.status(403).send("Invalid Key");
            return;
        }

        const documents = await Database.students.find({}).toArray();
        const students = documents.map(document => Student.fromObject(document));

        // Generate the HTML table
        const tableRows = students.map(student => `
            <tr>
                <td>${student.id}</td>
                <td>${student.username}</td>
                <td>${student.email}</td>
                <td>${student.verified}</td>
                <!-- Add more columns as needed -->
            </tr>
        `);

        // HTML template for the table
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Verified</th>
                        <!-- Add more column headers as needed -->
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;

        res.status(200).send(tableHTML);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

StudentRouter.get("/verify/:hash", async (req: Request, res: Response) => {
    const hashString = req?.params?.hash;

    try {
        const iv = hashString.split("-")[0];
        const content = hashString.split("-")[1];
        const hash = { iv: iv, content: content};
        const decryptedString = Verifier.decrypt(hash);
        const id = decryptedString.split("-")[0];
        const time = Number.parseInt(decryptedString.split("-")[1]);

        if (Date.now() - time > 900000 || !time) {
            console.log("Link Is Too Old");
            const html = fs.readFileSync("../../media/verifier/expired.html").toString();
            res.status(400).send(html);
            return;
        }

        const student = await Student.fetch(id);

        if (!student) {
            console.log("Student Doesn't Exist");
            const html = fs.readFileSync("../../media/verifier/error.html").toString();
            res.status(404).send(html);
            return;
        }

        student.verified = true;
        student.save().catch();
        const html = fs.readFileSync("../../media/verifier/success.html").toString();
        res.status(200).send(html);

        for (const port of Router.ports.values()) {
            const options = {host: "localhost", port: port, path: "/activate/" + id}
            const request = http.request(options, () => {});
            request.on('error', () => {});
            request.end();
        }

    } catch (error) {
        res.status(404).send(`Invalid Request - ${error.message} - ${error.stack}`);
    }
});

StudentRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const key = req?.query?.key;

    try {

        if (key != config.key) {
            res.status(403).send("Invalid Key");
            return;
        }

        const student = await Student.fetch(id);

        if (!student) {
            res.status(400).send(`Unable to find matching document with id: ${id}`);
            return;
        }

        res.status(200).send(student);
    } catch (error) {
        res.status(404).send(error.message);
    }
});


/*
    Player Router
 */

PlayerRouter.get("/", async (req: Request, res: Response) => {
    try {

        const documents = await Database.players.find({}).toArray();
        const players = documents
            .map(document => Player.fromObject(document))
            .sort((a, b) => b.getElo(GameType.Wallyball) - a.getElo(GameType.Wallyball))
            .filter((player) => player.username != null);

        const tableRows = players.map(player => `
            <tr>
                <td>${player.username}</td>
                <td style="text-align: left;">${player.getElo(GameType.CSGO)}</td>
                <td style="text-align: left;">${player.getElo(GameType.Siege)}</td>
                <td style="text-align: left;">${player.getElo(GameType.Overwatch)}</td>
                <td style="text-align: left;">${player.getElo(GameType.Valorant)}</td>
                <td style="text-align: left;">${player.getElo(GameType.Wallyball)}</td>
                <!-- Add more columns as needed -->
            </tr>
        `);

        // HTML template for the table
        const tableHTML = `
            <table style="text-align: left;">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>CSGO Elo</th>
                        <th>Siege Elo</th>
                        <th>Overwatch Elo</th>
                        <th>Valorant Elo</th>
                        <th>Wallyball Elo</th>
                        <!-- Add more column headers as needed -->
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;

        res.status(200).send(tableHTML);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

PlayerRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    try {

        const player = await Player.fetch(id);

        if (!player) {
            res.status(400).send(`Unable to find matching document with id: ${id}`);
            return;
        }

        res.status(200).send(player);

    } catch (error) {
        res.status(404).send(error.message);
    }
});


/*
    Game Routers
 */

CSGORouter.get("/", async (req: Request, res: Response) => {
    try {
        const game = GameType.CSGO;
        const players = await Database.getPlayersThatHavePlayedGameSorted(game);

        const tableRows = players.map(player => `
            <tr>
                <td>${player.getName(GameType.CSGO)}</td>
                <td style="text-align: left;">${getOrdinalSuffix(player.getRank(game))}</td>
                <td style="text-align: left;">${player.getElo(game)}</td>
                <td style="text-align: left;">${player.getWins(game)}</td>
                <td style="text-align: left;">${player.getLosses(game)}</td>
                <td style="text-align: left;">${player.getPoints(game)}</td>
                <!-- Add more columns as needed -->
            </tr>
        `);

        // HTML template for the table
        const tableHTML = `
            <table style="text-align: left;">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Rank</th>
                        <th>Elo</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Points</th>
                        <!-- Add more column headers as needed -->
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;

        res.status(200).send(tableHTML);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

SiegeRouter.get("/", async (req: Request, res: Response) => {
    try {
        const game = GameType.Siege;
        const players = await Database.getPlayersThatHavePlayedGameSorted(game);

        const tableRows = players.map(player => `
            <tr>
                <td>${player.getName(GameType.CSGO)}</td>
                <td style="text-align: left;">${getOrdinalSuffix(player.getRank(game))}</td>
                <td style="text-align: left;">${player.getElo(game)}</td>
                <td style="text-align: left;">${player.getWins(game)}</td>
                <td style="text-align: left;">${player.getLosses(game)}</td>
                <td style="text-align: left;">${player.getPoints(game)}</td>
                <!-- Add more columns as needed -->
            </tr>
        `);

        // HTML template for the table
        const tableHTML = `
            <table style="text-align: left;">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Rank</th>
                        <th>Elo</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Points</th>
                        <!-- Add more column headers as needed -->
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;

        res.status(200).send(tableHTML);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

OverwatchRouter.get("/", async (req: Request, res: Response) => {
    try {
        const game = GameType.Overwatch;
        const players = await Database.getPlayersThatHavePlayedGameSorted(game);

        const tableRows = players.map(player => `
            <tr>
                <td>${player.getName(GameType.CSGO)}</td>
                <td style="text-align: left;">${getOrdinalSuffix(player.getRank(game))}</td>
                <td style="text-align: left;">${player.getElo(game)}</td>
                <td style="text-align: left;">${player.getWins(game)}</td>
                <td style="text-align: left;">${player.getLosses(game)}</td>
                <td style="text-align: left;">${player.getPoints(game)}</td>
                <!-- Add more columns as needed -->
            </tr>
        `);

        // HTML template for the table
        const tableHTML = `
            <table style="text-align: left;">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Rank</th>
                        <th>Elo</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Points</th>
                        <!-- Add more column headers as needed -->
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;

        res.status(200).send(tableHTML);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

ValorantRouter.get("/", async (req: Request, res: Response) => {
    try {
        const game = GameType.Valorant;
        const players = await Database.getPlayersThatHavePlayedGameSorted(game);

        const tableRows = players.map(player => `
            <tr>
                <td>${player.getName(GameType.CSGO)}</td>
                <td style="text-align: left;">${getOrdinalSuffix(player.getRank(game))}</td>
                <td style="text-align: left;">${player.getElo(game)}</td>
                <td style="text-align: left;">${player.getWins(game)}</td>
                <td style="text-align: left;">${player.getLosses(game)}</td>
                <td style="text-align: left;">${player.getPoints(game)}</td>
                <!-- Add more columns as needed -->
            </tr>
        `);

        // HTML template for the table
        const tableHTML = `
            <table style="text-align: left;">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Rank</th>
                        <th>Elo</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Points</th>
                        <!-- Add more column headers as needed -->
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;

        res.status(200).send(tableHTML);

    } catch (error) {
        res.status(500).send(error.message);
    }
});

WallyballRouter.get("/", async (req: Request, res: Response) => {
    try {
        const game = GameType.Wallyball
        const players = await Database.getPlayersThatHavePlayedGameSorted(game);

        const tableRows = players.map(player => `
            <tr>
                <td>${player.getName(game)}</td>
                <td style="text-align: left;">${getOrdinalSuffix(player.getRank(game))}</td>
                <td style="text-align: left;">${player.getElo(game)}</td>
                <td style="text-align: left;">${player.getWins(game)}</td>
                <td style="text-align: left;">${player.getLosses(game)}</td>
                <td style="text-align: left;">${player.getPoints(game)}</td>
                <!-- Add more columns as needed -->
            </tr>
        `);

        // HTML template for the table
        const tableHTML = `
            <table style="text-align: left;">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Rank</th>
                        <th>Elo</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Points</th>
                        <!-- Add more column headers as needed -->
                    </tr>
                </thead>
                <tbody>
                    ${tableRows.join('')}
                </tbody>
            </table>
        `;

        res.status(200).send(tableHTML);

    } catch (error) {
        res.status(500).send(error.message);
    }
});


function getOrdinalSuffix(i: number): string {
    const j = i % 10;
    const k = i % 100;

    if (j === 1 && k !== 11) {
        return i + "st";
    } else if (j === 2 && k !== 12) {
        return i + "nd";
    } else if (j === 3 && k !== 13) {
        return i + "rd";
    } else {
        return i + "th";
    }
}