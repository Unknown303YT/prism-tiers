import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";

import { REST, Routes } from "discord.js";

import { __dirname, toFileUrl } from "./util/path.js";

dotenv.config();

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

const commands = [];

const commandsDir = path.join(__dirname, "commands");
const files = await getFiles(commandsDir);

for (const file of files) {
    const module = await import(toFileUrl(file));
    commands.push(module.default.data.toJSON());
}

const rest = new REST().setToken(process.env.TOKEN!);

await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID!),
    {
        body: commands,
    }
);

console.log(`Deployed ${commands.length} commands.`);