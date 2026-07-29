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

export async function loadCommands(client: BotClient): Promise<void> {
    const commandsDir = path.join(__dirname, "commands");

    const files = await getFiles(commandsDir);

    for (const file of files) {
        const module = await import(toFileUrl(file));
        const command = module.default;

        client.commands.set(command.data.name, command);

        console.log(`Loaded command ${command.data.name}`);
    }
}