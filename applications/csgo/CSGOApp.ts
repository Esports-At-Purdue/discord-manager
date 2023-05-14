import {Application} from "../../Application";
import {Queue} from "../../Queue";
import {GameType} from "../../Game";

const requiredFiles = [
    {name: "queue.json", default: {id: null}},
    {name: "status.json", default: {name: "Hello, World!", type: 0}}
];

export class CSGOApp extends Application {

    public queue: Queue;

    public constructor() {
        super("csgo");
        this.queue = new Queue(3600000, 10, GameType.Overwatch, new Map());
        this.ensureDataFilesExist(requiredFiles);
    }
}