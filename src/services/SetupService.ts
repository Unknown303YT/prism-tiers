import {
    Guild,
    ActionRowBuilder,
    RoleSelectMenuBuilder,
    ChatInputCommandInteraction,
    MessageFlags
} from "discord.js";
import { ServerRepository } from "../repositories/ServerRepository.js";
import { RoleRepository } from "../repositories/RoleRepository.js";

export class SetupService {
    private readonly servers = new ServerRepository();
    private readonly roles = new RoleRepository();
    private sessions: Record<string, {
        serverId: string;
        interaction: ChatInputCommandInteraction;
    }> = {};
    private waitingFor: Record<string, {
        type: string;
        key: string;
    }> = {};

     public async start(guild: Guild, interaction: ChatInputCommandInteraction) {
         console.log(`Starting PrismTiers setup for ${guild.name} (${guild.id})`);

        let server = await this.servers.getByDiscordId(guild.id);

        if (!server) {
            server = await this.servers.create(guild.id,guild.name);

            console.log(`Created server ${server.id}`);
        } else {
            console.log(`Found existing server ${server.id}`);
        }

        this.sessions[guild.id] = {
            serverId: server.id,
            interaction
        };

        return server;
    }

    public getServerId(guildId: string) {
        return this.sessions[guildId]?.serverId;
    }

    public async createRoles(guild: Guild) {
        const serverId = this.getServerId(guild.id);

        console.log(`Creating roles for ${guild.name} (${serverId})`);
    }

    public async selectRoles(guild: Guild) {
        const interaction = this.sessions[guild.id]?.interaction;

        if (!interaction) {
            throw new Error("Setup interaction not found.");
        }

        this.waitingFor[guild.id] = {
            type: "staff",
            key: "admin"
        };

        await interaction.followUp({
            content:
                "Please mention the **Admin** role in this chat.",
            flags: MessageFlags.Ephemeral
        });
    }

    public async saveRole(guildId: string, type: string, key: string, roleId: string) {
        const serverId = this.getServerId(guildId);
        return this.roles.create(serverId, type, key, roleId);
    }

    public getWaitingFor(guildId: string) {
        return this.waitingFor[guildId];
    }
}

export const setup = new SetupService();