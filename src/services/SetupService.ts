import {
    Guild,
    ChatInputCommandInteraction,
    MessageFlags,
    ChannelType,
    PermissionFlagsBits,
    User,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from "discord.js";
import { ServerRepository } from "../repositories/ServerRepository.js";
import { RoleRepository } from "../repositories/RoleRepository.js";
import {
    TIER_ROLES,
    WAITLIST_ROLES,
    STAFF_ROLES
} from "../constants/roles.js";

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
        const createdRoles = [];

        for (const tier of TIER_ROLES) {
            let role = guild.roles.cache.find(existing => existing.name === tier.name);

            if (!role) {
                role = await guild.roles.create({
                        name: tier.name,
                        colors: tier.color,
                        hoist: true,
                        reason:"PrismTiers tier role"
                    });
            }


            await this.saveRole(guild.id, "tier", tier.name, role.id);

            createdRoles.push(role);
        }


        const botRole = guild.members.me?.roles.highest;

        if (!botRole) {
            throw new Error("Bot role not found.");
        }

        for (const role of createdRoles) {
            if (role.position >= botRole.position) {
                throw new Error(`Cannot move role ${role.name}. Bot role is too low.`);
            }
        }

        await guild.roles.setPositions(
            createdRoles.map((role, index) => ({
                role: role.id,
                position: botRole.position - index - 1
            }))
        );

        console.log("Tier roles created and ordered.");

        return createdRoles;
    }

    public async createWaitlistRoles(guild: Guild) {
        for (const gamemode of WAITLIST_ROLES) {
            const name =`${gamemode} Waitlist`;

            let role = guild.roles.cache.find(role => role.name === name);

            if (!role) {
                role = await guild.roles.create({name, hoist: false, reason: "PrismTiers waitlist role"});
            }

            await this.saveRole(guild.id, "waitlist", gamemode, role.id);
        }
    }

    public async createStaffRoles(guild: Guild) {
        for (const staffRole of STAFF_ROLES) {
            let role = guild.roles.cache.find(existing =>existing.name === staffRole.name);

            if (!role) {
                role = await guild.roles.create({
                        name: staffRole.name,
                        colors: staffRole.color,
                        hoist: true,
                        reason:"PrismTiers staff role"
                    });
            }

            await this.saveRole(guild.id!, "staff", staffRole.key, role.id);
        }
    }

    public async saveRole(guildId: string, type: string, key: string, roleId: string) {
        const serverId = this.getServerId(guildId);
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
        const session =this.sessions[guildId];

        if (!session) {
            return;
        }

        delete this.sessions[guildId];

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
}

export const setup = new SetupService();