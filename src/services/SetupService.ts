import {
    Guild,
    ChatInputCommandInteraction,
    ChannelType,
    PermissionFlagsBits,
    User,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Role,
    CategoryChannel
} from "discord.js";

import { ServerRepository } from "../repositories/ServerRepository.js";
import { RoleRepository } from "../repositories/RoleRepository.js";
import { ChannelRepository } from "../repositories/ChannelRepository.js";

import {
    TIER_ROLES,
    WAITLIST_ROLES,
    STAFF_ROLES
} from "../constants/roles.js";

import {
    CATEGORIES,
    CHANNELS
} from "../constants/channels.js"

export class SetupService {
    private readonly servers = new ServerRepository();
    private readonly roles = new RoleRepository();
    private readonly channels = new ChannelRepository();
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

        const existingServer = await this.servers.getByDiscordId(guild.id);

        if (existingServer.error) {
            throw existingServer.error;
        }

        let server = existingServer.data;

        if (!server) {
            const createdServer = await this.servers.create(
                guild.id,
                guild.name
            );

            if (createdServer.error || !createdServer.data) {
                throw new Error("Failed to create or load server.");
            }

            server = createdServer.data;

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
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.Administrator
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
            content: `${user}`
        });

        await channel.send({

            content:`# Welcome to PrismTiers setup!\n\nPlease mention the **Admin** role.`,

            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("setup_cancel")
                            .setLabel("Cancel Setup")
                            .setStyle(ButtonStyle.Danger)
                    )
            ]
        });

        return channel;
    }

    public async createTierRoles(guild: Guild) {
        const createdRoles: Role[] = [];

        for (const tier of TIER_ROLES) {
            const role = await this.getOrCreateRole(guild, {
                name: tier.name,
                color: tier.color,
                hoist: true,
                reason: "PrismTiers tier role"
            });

            if (!role) {
                throw new Error(`Failed to create or find role ${tier.name}`);
            }

            await this.saveRole(guild.id, "tier", tier.name, role.id);

            createdRoles.push(role);
        }

        console.log("Tier roles created");

        return createdRoles;
    }

    public async createWaitlistRoles(guild: Guild) {
        for (const gamemode of WAITLIST_ROLES) {
            const name =`${gamemode} Waitlist`;

            const role = await this.getOrCreateRole(guild, {
                name: name,
                hoist: false,
                reason: "PrismTiers waitlist role"
            });

            await this.saveRole(guild.id, "waitlist", gamemode, role.id);
        }
    }

    public async createStaffRoles(guild: Guild) {
        const serverId = this.getServerId(guild.id);

        console.log(`Creating staff roles for ${guild.id}, database id: ${serverId}`);

        if (!serverId) {
            throw new Error(
                "No active setup session found."
            );
        }

        for (const staffRole of STAFF_ROLES) {
            const role = await this.getOrCreateRole(guild, {
                name: staffRole.name,
                color: staffRole.color,
                hoist: true,
                reason: "PrismTiers staff role"
            });

            await this.saveRole(guild.id!, "staff", staffRole.key, role.id);
        }
    }

    private async getOrCreateRole(guild: Guild, options: {
            name: string;
            color?: number;
            hoist?: boolean;
            reason: string;
        }): Promise<Role> {
        let role = guild.roles.cache.find(existing => existing.name === options.name);

        if (!role) {
            role = await guild.roles.create({
                name: options.name,
                colors: options.color
                    ? { primaryColor: options.color }
                    : undefined,
                hoist: options.hoist ?? false,
                reason: options.reason
            });
        }

        return role;
    }

    public async saveRole(guildId: string, type: string, key: string, roleId: string) {
        const serverId = this.getServerId(guildId);

        if (!serverId) {
            throw new Error("No active setup session found.");
        }

        return this.roles.create(serverId, type, key, roleId);
    }

    public getWaitingFor(guildId: string) {
        return this.sessions[guildId]?.waitingFor;
    }

    public setWaitingFor(guildId: string, type: string, key: string) {
        this.sessions[guildId].waitingFor = {
            type,
            key
        };
    }

    public async cancel(guildId: string) {
        const session = this.sessions[guildId];

        if (!session) {
            return;
        }

        delete this.sessions[guildId];
    }

    public async finish(guildId: string) {
        const session = this.sessions[guildId];

        if (!session) {
            return;
        }

        delete this.sessions[guildId];

        await this.servers.completeSetup(session.serverId);

        return session.setupChannelId;
    }

    public async deleteSetupChannel(guild: Guild) {
        const channelId = this.sessions[guild.id]?.setupChannelId;

        if (!channelId) {
            return;
        }

        const channel = guild.channels.cache.get(channelId);

        await channel?.delete();
    }

    public async createCategories(guild: Guild) {
        const categories: Record<string, CategoryChannel> = {};

        for (const category of CATEGORIES) {
            const created = await this.getOrCreateCategory(
                guild,
                category.key,
                category.name
            );

            categories[category.key] = created;
        }

        return categories;
    }

    public async createChannels(guild: Guild, categories: Record<string, CategoryChannel>) {
        for (const channel of CHANNELS) {
            const type = channel.type as CreateableChannelType;

            await this.getOrCreateChannel(
                guild,
                channel.key,
                channel.name,
                type,
                categories[channel.category]?.id
            );
        }
    }

    private async saveChannel(guildId: string, type: string, key: string, channelId: string) {
        const serverId = this.getServerId(guildId);

        if (!serverId) {
            throw new Error("No active setup session found.");
        }

        return this.channels.create(serverId, type, key, channelId);
    }

    private async getOrCreateCategory(guild: Guild, key: string, name: string): Promise<CategoryChannel> {
        let category = guild.channels.cache.find(
            channel => channel.type === ChannelType.GuildCategory && channel.name === name
        ) as CategoryChannel | undefined;

        if (!category) {
            category = await guild.channels.create({
                name,
                type: ChannelType.GuildCategory,
                reason: "PrismTiers setup"
            }) as CategoryChannel;
        }

        await this.saveChannel(
            guild.id,
            "category",
            key,
            category.id
        );

        return category;
    }

    private async getOrCreateChannel(
        guild: Guild,
        key: string,
        name: string,
        type: CreateableChannelType,
        parent?: string
    ) {
        let existing = guild.channels.cache.find(
            c => c.name === name && c.type === type
        );

        if (!existing) {
            existing = await guild.channels.create({
                name,
                type,
                parent,
                reason: "PrismTiers setup"
            });
        }

        await this.saveChannel(guild.id, "channel", key, existing.id);

        return existing;
    }
}

export const setup = new SetupService();

type CreateableChannelType =
    | ChannelType.GuildText
    | ChannelType.GuildVoice
    | ChannelType.GuildCategory
    | ChannelType.GuildAnnouncement
    | ChannelType.GuildStageVoice
    | ChannelType.GuildDirectory
    | ChannelType.GuildForum
    | ChannelType.GuildMedia;