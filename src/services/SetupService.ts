import {
    Guild,
    ChatInputCommandInteraction,
    MessageFlags,
    ChannelType,
    PermissionFlagsBits,
    User
} from "discord.js";
import { ServerRepository } from "../repositories/ServerRepository.js";
import { RoleRepository } from "../repositories/RoleRepository.js";

export class SetupService {
    private readonly servers = new ServerRepository();
    private readonly roles = new RoleRepository();
    private sessions: Record<string, {
        serverId: string;
        interaction: ChatInputCommandInteraction;
        setupChannelId?: string;
        waitingFor?: {
            type: string;
            key: string;
        };
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

    public getSetupChannelId(guildId: string) {
        return this.sessions[guildId]?.setupChannelId;
    }

    public async createSetupChannel(guild: Guild, user: User) {
        const channel = await guild.channels.create({
            name: "prismtiers-setup",
            type: ChannelType.GuildText,

            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [
                        PermissionFlagsBits.ViewChannel
                    ]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages
                    ]
                },
                {
                    id: guild.members.me!.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels
                    ]
                }
            ]
        });

        this.sessions[guild.id].setupChannelId = channel.id;
        this.sessions[guild.id].waitingFor = {
            type: "staff",
            key: "admin"
        };

        await channel.send({

            content:
                `${user}\nWelcome to PrismTiers setup!\n\nPlease mention the **Admin** role.`

        });

        return channel;
    }

    public async createRoles(guild: Guild) {
        const serverId = this.getServerId(guild.id);

        console.log(`Creating roles for ${guild.name} (${serverId})`);
    }

    public async saveRole(guildId: string, type: string, key: string, roleId: string) {
        const serverId = this.getServerId(guildId);
        return this.roles.create(serverId, type, key, roleId);
    }

    public getWaitingFor(guildId: string) {
        return this.sessions[guildId]?.waitingFor;
    }
}

export const setup = new SetupService();