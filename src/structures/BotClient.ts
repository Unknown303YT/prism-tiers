import {
    Client,
    Collection,
    GatewayIntentBits
} from "discord.js";

import type { Command } from "./Command.js";

import { SettingsService } from "../services/SettingsService.js";


export class BotClient extends Client {
    public commands =
        new Collection<string, Command>();

    public settings =
        new SettingsService();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates
            ]
        });
    }
}