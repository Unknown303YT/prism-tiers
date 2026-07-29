import dotenv from "dotenv";

import { BotClient } from "./structures/BotClient.js";

import { loadCommands } from "./util/loadCommands.js";
import { loadEvents } from "./util/loadEvents.js";


dotenv.config();


const client = new BotClient();


await client.settings.load();


await loadCommands(client);

await loadEvents(client);



client.login(
    process.env.TOKEN
);