import { BotClient } from "./structures/BotClient.js";

import { loadCommands } from "./util/loadCommands.js";
import { loadEvents } from "./util/loadEvents.js";

import { connectRedis } from "./redis/redis.js";

const client = new BotClient();

async function start() {
    console.log("Starting PrismTiers...");

    try {
        console.log("Loading settings...");
        await client.settings.load();
        console.log("Settings loaded.");

        console.log("Checking Redis...");
        await connectRedis();
        console.log("Redis verified.");

        console.log("Loading commands...");
        await loadCommands(client);

        console.log("Loading events...");
        await loadEvents(client);


        await client.login(process.env.TOKEN);

    } catch (error) {
        console.error("Failed to start PrismTiers:");
        console.error(error);

        process.exit(1);
    }
}

start();