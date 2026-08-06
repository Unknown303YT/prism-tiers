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
    private sessions: Record<string, string> = {};
    private interactions: Record<string, ChatInputCommandInteraction> = {};

     public async start(guild: Guild, interaction: ChatInputCommandInteraction) {
         console.log(`Starting PrismTiers setup for ${guild.name} (${guild.id})`);

        let server = await this.servers.getByDiscordId(guild.id);

        if (!server) {
            server = await this.servers.create(guild.id,guild.name);

            console.log(`Created server ${server.id}`);
        } else {
            console.log(`Found existing server ${server.id}`);
        }

        this.sessions[guild.id] = server.id;
        this.interactions[guild.id] = interaction;

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
        for (const role of guild.roles.cache.values()) {
            console.log(
                `${role.name} | ${role.id} | managed=${role.managed} | position=${role.position}`
            );
        }

        const interaction = this.interactions[guild.id];

        if (!interaction) {
            throw new Error("Setup interaction not found.");
        }

        await interaction.followUp({
            content: "Select the admin role:",

            components: [
                new ActionRowBuilder<RoleSelectMenuBuilder>()
                    .addComponents(new RoleSelectMenuBuilder()
                        .setCustomId("setup_admin_role")
                        .setPlaceholder("Select admin role")
                    )
            ],
            flags: MessageFlags.Ephemeral
        });
    }

    public async saveRole(guildId: string, type: string, key: string, roleId: string) {
        const serverId = this.getServerId(guildId);
        return this.roles.create(serverId, type, key, roleId);
    }
}

export const setup = new SetupService();