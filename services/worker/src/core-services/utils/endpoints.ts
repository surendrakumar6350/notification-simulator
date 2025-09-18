import fs from "fs";
import path from "path";
import type { Endpoint } from "./types";

let cachedEndpoints: Endpoint[];

export default async function endpoints(): Promise<Endpoint[]> {
    if (cachedEndpoints) {
        return cachedEndpoints;
    }

    try {
        const filePath = path.join(__dirname, "ep.json");
        const fileData = fs.readFileSync(filePath, "utf-8");
        const endpoints: Endpoint[] = JSON.parse(fileData);

        cachedEndpoints = endpoints || [];
    } catch (error) {
        console.error("Error reading endpoints from file:", error);
        cachedEndpoints = [];
    }

    return cachedEndpoints;
}