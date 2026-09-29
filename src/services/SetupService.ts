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
    CategoryChannel,
    OverwriteResolvable,
    TextChannel
} from "discord.js";

import { ServerRepository } from "../repositories/ServerRepository.js";
import { RoleRepository } from "../repositories/RoleRepository.js";
import { ChannelRepository } from "../repositories/ChannelRepository.js";
import { messageFormHandler } from "../services/MessageFormService.js";

import {
    TIER_ROLES,
    WAITLIST_ROLES,
    STAFF_ROLES
} from "../constants/roles.js";

import {
    CATEGORIES,
    CHANNELS
} from "../constants/channels.js";

import SetupForm from "../interactions/messageForms/SetupForm.js";

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

        let server = existingServer;

        if (!server) {
            console.log(`No existing server found for ${guild.id}, creating new server`);

            server = await this.servers.create(
                guild.id,
                guild.name
            );

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
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages
                    ],
                    deny: [
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: guild.members.me!.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
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

        await messageFormHandler.startForm(
            new SetupForm(user.id, channel.id)
        );

        return channel;
    }

    public async createTierRoles(guild: Guild) {
        const roles: Record<string, Role> = {};

        for (const tier of TIER_ROLES) {
            const key = tier.name
                .replace(" Tier", "")
                .toLowerCase();

            const role = await this.getOrCreateRole(guild, {
                name: tier.name,
                color: tier.color,
                hoist: true,
                reason: "PrismTiers setup"
            });

            await this.saveRole(
                guild.id,
                "tier",
                key,
                role.id
            );

            roles[key] = role;
        }

        await this.orderTierRoles(guild, roles);

        return roles;
    }

    public async createWaitlistRoles(guild: Guild) {
        const roles: Record<string, Role> = {};

        for (const waitlist of WAITLIST_ROLES) {
            const role = await this.getOrCreateRole(guild, {
                name: waitlist.name,
                reason: "PrismTiers setup"
            });

            await this.saveRole(
                guild.id,
                "waitlist",
                waitlist.key,
                role.id
            );

            roles[waitlist.key] = role;
        }

        return roles;
    }

    public async createStaffRoles(guild: Guild) {
        const roles: Record<string, Role> = {};

        for (const staff of STAFF_ROLES) {
            const role = await this.getOrCreateRole(guild, {
                name: staff.name,
                color: staff.color,
                hoist: true,
                reason: "PrismTiers setup"
            });

            await this.saveRole(
                guild.id,
                "staff",
                staff.key,
                role.id
            );

            roles[staff.key] = role;
        }

        return roles;
    }

    private getWaitlistKey(name: string) {
        return name
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace("diamondsmp", "diasmp")
            .replace("spearmace", "spear-mace")
            .replace("diapot", "diapot");
    }

    private async orderTierRoles(
        guild: Guild,
        roles: Record<string, Role>
    ) {
        const orderedRoles = TIER_ROLES
            .map(tier => {
                const key = tier.name
                    .replace(" Tier", "")
                    .toLowerCase();

                return roles[key];
            })
            .filter(Boolean);

        let position = guild.roles.highest.position - 1;

        for (const role of orderedRoles) {
            if (position <= 0) {
                break;
            }

            await role.setPosition(position);
            position--;
        }
    }

    public async saveRole(
        guildId: string,
        type: string,
        key: string,
        roleId: string
    ) {
        const serverId = this.getServerId(guildId);

        if (!serverId) {
            throw new Error("No active setup session found.");
        }

        return this.roles.create(
            serverId,
            type,
            key,
            roleId
        );
    }

    private async getOrCreateRole(
        guild: Guild,
        options: {
            name: string;
            color?: number;
            hoist?: boolean;
            reason: string;
        }
    ): Promise<Role> {
        let role = guild.roles.cache.find(
            existing => existing.name === options.name
        );

        if (!role) {
            role = await guild.roles.create({
                name: options.name,
                colors: options.color
                    ? {
                        primaryColor: options.color
                    }
                    : undefined,
                hoist: options.hoist ?? false,
                reason: options.reason
            });
        }

        return role;
    }

    public async createCategories(
        guild: Guild
    ) {
        const categories: Record<string, CategoryChannel> = {};

        for (const category of CATEGORIES) {
            const created = await this.getOrCreateCategory(
                guild,
                category.key,
                category.name
            );

            console.log(
                `Created category ${category.name} (${created.id})`
            );

            categories[category.key] = created;
        }

        return categories;
    }

    public async createChannels(
        guild: Guild,
        categories: Record<string, CategoryChannel>
    ) {
        for (const channel of CHANNELS) {
            const parent = categories[channel.category];

            if (!parent) {
                throw new Error(
                    `Category ${channel.category} does not exist.`
                );
            }

            await this.getOrCreateChannel(
                guild,
                channel.key,
                channel.name,
                parent
            );
        }
    }

    private async saveChannel(
        guildId: string,
        type: string,
        key: string,
        channelId: string
    ) {
        const serverId = this.getServerId(guildId);

        if (!serverId) {
            throw new Error("No active setup session found.");
        }

        return this.channels.upsert(
            serverId,
            type,
            key,
            channelId
        );
    }

    private async getOrCreateCategory(
        guild: Guild,
        key: string,
        name: string
    ): Promise<CategoryChannel> {
        let category = guild.channels.cache.find(
            channel =>
                channel.type === ChannelType.GuildCategory &&
                channel.name === name
        ) as CategoryChannel | undefined;

        if (!category) {
            category = await guild.channels.create({
                name,
                type: ChannelType.GuildCategory,
                reason: "PrismTiers setup"
            }) as CategoryChannel;
        }

        await category.permissionOverwrites.set(
            await this.getCategoryPermissions(
                guild,
                key
            )
        );

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
        category: CategoryChannel
    ) {
        const serverId = this.getServerId(guild.id);

        if (!serverId) {
            throw new Error("No active setup session found.");
        }

        const savedChannel = await this.channels.get(
            serverId,
            "channel",
            key
        );

        let channel = savedChannel
            ? guild.channels.cache.get(savedChannel.data.discord_channel_id) as TextChannel | undefined
            : undefined;

        if (!channel) {
            channel = await guild.channels.create({
                name,
                type: ChannelType.GuildText,
                parent: category.id,
                reason: "PrismTiers setup"
            });
        }

        if (channel.parentId !== category.id) {
            await channel.setParent(category.id);
        }

        await channel.permissionOverwrites.set(
            await this.getChannelPermissions(guild, key)
        );

        await this.saveChannel(
            guild.id,
            "channel",
            key,
            channel.id
        );

        return channel;
    }

    private async getCategoryPermissions(
        guild: Guild,
        category: string
    ): Promise<OverwriteResolvable[]> {
        const serverId = this.getServerId(guild.id);

        if (!serverId) {
            throw new Error("No active setup session found.");
        }

        const everyone = guild.roles.everyone.id;

        const admin = await this.roles.get(
            serverId,
            "staff",
            "admin"
        );

        const tester = await this.roles.get(
            serverId,
            "staff",
            "tester"
        );

        switch (category) {
            case "main":
            case "results":
                return [
                    {
                        id: everyone,
                        allow: [
                            PermissionFlagsBits.ViewChannel
                        ],
                        deny: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },
                    {
                        id: tester.discord_role_id,
                        allow: [
                            PermissionFlagsBits.ViewChannel
                        ],
                        deny: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },
                    {
                        id: admin.discord_role_id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    }
                ];

            case "admin":
            case "testing":
                return [
                    {
                        id: everyone,
                        deny: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },
                    {
                        id: tester.discord_role_id,
                        allow: [
                            PermissionFlagsBits.ViewChannel
                        ],
                        deny: [
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    },
                    {
                        id: admin.discord_role_id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageChannels,
                            PermissionFlagsBits.ManageMessages
                        ]
                    }
                ];

            default:
                throw new Error(
                    `Unknown category: ${category}`
                );
        }
    }

    private async getChannelPermissions(
        guild: Guild,
        key: string
    ): Promise<OverwriteResolvable[]> {
        const serverId = this.getServerId(guild.id);

        if (!serverId) {
            throw new Error("No active setup session found.");
        }

        const everyone = guild.roles.everyone.id;

        const admin = await this.roles.get(
            serverId,
            "staff",
            "admin"
        );

        const tester = await this.roles.get(
            serverId,
            "staff",
            "tester"
        );

        const bot = guild.members.me;

        if (!bot) {
            throw new Error("Bot member could not be found.");
        }

        const botId = bot.id;

        /*
         * WAITLIST
         *
         * Everyone:
         * - Can see
         * - Cannot type
         * - Cannot manage
         *
         * Admin:
         * - Full access
         *
         * Bot:
         * - Full access
         */
        if (key === "waitlist") {
            return [
                {
                    id: everyone,
                    allow: [
                        PermissionFlagsBits.ViewChannel
                    ],
                    deny: [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: admin.discord_role_id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: botId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ];
        }

        /*
         * RESULTS CHANNELS
         *
         * Everyone:
         * - Can see
         * - Cannot type
         * - Cannot manage
         *
         * Admin:
         * - Can see
         * - Cannot type
         * - Can manage
         *
         * Bot:
         * - Full access
         */
        if (key.endsWith("_results")) {
            return [
                {
                    id: everyone,
                    allow: [
                        PermissionFlagsBits.ViewChannel
                    ],
                    deny: [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: tester.discord_role_id,
                    allow: [
                        PermissionFlagsBits.ViewChannel
                    ],
                    deny: [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: admin.discord_role_id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ],
                    deny: [
                        PermissionFlagsBits.SendMessages
                    ]
                },
                {
                    id: botId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ];
        }

        /*
         * ADMIN CHANNELS
         *
         * Everyone:
         * - Cannot see
         * - Cannot type
         * - Cannot manage
         *
         * Tester:
         * - Can see
         * - Cannot type
         * - Cannot manage
         *
         * Admin:
         * - Full access
         *
         * Bot:
         * - Full access
         */
        if (
            key === "logs" ||
            key === "test-management"
        ) {
            return [
                {
                    id: everyone,
                    deny: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: tester.discord_role_id,
                    allow: [
                        PermissionFlagsBits.ViewChannel
                    ],
                    deny: [
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: admin.discord_role_id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                },
                {
                    id: botId,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ManageChannels,
                        PermissionFlagsBits.ManageMessages
                    ]
                }
            ];
        }

        /*
         * GAMEMODE CHANNELS
         *
         * The channel key itself is the waitlist-role key.
         *
         * Example:
         *
         * #sword
         *   -> role "Sword"
         *   -> role stored as type="waitlist", key="sword"
         *
         * Everyone:
         * - Cannot see
         * - Cannot type
         * - Cannot manage
         *
         * Waitlisted players:
         * - Can see
         * - Cannot type
         * - Cannot manage
         *
         * Testers:
         * - Can see
         * - Cannot type
         * - Cannot manage
         *
         * Admin:
         * - Full access
         *
         * Bot:
         * - Full access
         */
        const waitlistRole = await this.roles.get(
            serverId,
            "waitlist",
            key
        );

        return [
            {
                id: everyone,
                deny: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages
                ]
            },
            {
                id: waitlistRole.discord_role_id,
                allow: [
                    PermissionFlagsBits.ViewChannel
                ],
                deny: [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages
                ]
            },
            {
                id: tester.discord_role_id,
                allow: [
                    PermissionFlagsBits.ViewChannel
                ],
                deny: [
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages
                ]
            },
            {
                id: admin.discord_role_id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages
                ]
            },
            {
                id: botId,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ManageChannels,
                    PermissionFlagsBits.ManageMessages
                ]
            }
        ];
    }
}

export const setup = new SetupService();