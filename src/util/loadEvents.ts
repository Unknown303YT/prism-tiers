import fs from "node:fs/promises";
import path from "node:path";

import { BotClient } from "../structures/BotClient.js";
import { __dirname, toFileUrl } from "./path.js";

async function getFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            files.push(...await getFiles(fullPath));
        } else if (
            entry.isFile() &&
            (fullPath.endsWith(".ts") || fullPath.endsWith(".js")) &&
            !fullPath.endsWith(".d.ts")
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

export async function loadEvents(client: BotClient): Promise<void> {
    const eventsDir = path.join(__dirname, "events");

    const files = await getFiles(eventsDir);

    for (const file of files) {
        const module = await import(toFileUrl(file));
        const event = module.default;

        const eventName = path.basename(file).replace(/\.(ts|js)$/, "");

        client.on(eventName, (...args) => event(client, ...args));

        console.log(`Loaded event ${eventName}`);
    }
}