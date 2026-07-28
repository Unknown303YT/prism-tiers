import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Command } from "./Command.js";

export class BotClient extends Client {

    public commands = new Collection<string, Command>();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds
            ]
        });
    }

}