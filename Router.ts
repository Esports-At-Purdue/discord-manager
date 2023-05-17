import * as express from "express";
import {Request, Response} from "express";
import * as config from "./config.json";
import {Database} from "./Database";
import {Student} from "./Student";
import * as http from "http";
import {Verifier} from "./Verifier";
import {Player} from "./Player";
import * as fs from "fs";
import {GameType} from "./Game";

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