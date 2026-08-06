import { Guild } from "discord.js";
import { ServerRepository } from "../repositories/ServerRepository.js";

export class SetupService {
    private readonly servers =new ServerRepository();

    public async start(guild: Guild) {
        console.log(`Starting PrismTiers setup for ${guild.name} (${guild.id})`);

        const server = await this.servers.getByDiscordId(guild.id);

        if (server) {
            console.log(`Found existing server ${server.id}`);

            return server;
        }

        const created = await this.servers.create(guild.id, guild.name);

        console.log(`Created server ${created.id}`);

        return created;
    }

    public async createRoles(guild: Guild) {
        console.log(`Creating roles for ${guild.name} (${guild.id})`);
    }

    public async selectRoles(guild: Guild) {
        console.log(`Selecting existing roles for ${guild.name} (${guild.id})`);
    }
}