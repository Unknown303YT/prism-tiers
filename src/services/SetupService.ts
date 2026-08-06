import { Guild } from "discord.js";
import { ServerRepository } from "../repositories/ServerRepository.js";

export class SetupService {
    private readonly servers =new ServerRepository();
    private sessions: Record<string, string> = {};

     public async start(guild: Guild) {
         console.log(`Starting PrismTiers setup for ${guild.name} (${guild.id})`);

        let server = await this.servers.getByDiscordId(guild.id);

        if (!server) {
            server = await this.servers.create(guild.id,guild.name);

            console.log(`Created server ${server.id}`);
        } else {
            console.log(`Found existing server ${server.id}`);
        }

        this.sessions[guild.id] = server.id;

        return server;
    }

    public getServerId(guildId: string) {
        return this.sessions[guildId];
    }

    public async createRoles(guild: Guild) {
        const serverId = this.getServerId(guild.id);

        console.log(`Creating roles for ${guild.name} (${serverId})`);
    }

    public async selectRoles(guild: Guild) {
        const serverId = this.getServerId(guild.id);

        console.log(`Selecting roles for ${guild.name} (${guild.id})`);
    }
}

export const setup = new SetupService();