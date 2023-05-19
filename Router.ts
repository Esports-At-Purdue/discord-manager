import * as express from "express";

export class Router {
    public static express = express();
    public static ports: Map<string, number> = new Map<string, number>([
        ["csgo", 4815],
        ["pugg", 1516],
        ["siege", 1623],
        ["overwatch", 2342],
        ["valorant", 4248]
    ]);
}