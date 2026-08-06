import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags
} from "discord.js";

import type { Command } from "../structures/Command.js";
import { ServerRepository } from "../repositories/ServerRepository.js";
import { setup } from "../services/SetupService.js";

const servers = new ServerRepository();

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Sets up PrismTiers for this server")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply({
                content: "This command can only be used in a server.",
                ephemeral: true
            });

            return;
        }

        const server = await setup.start(guild, interaction);

        if (server && await servers.isSetupComplete(server.id)) {
            await interaction.reply({
                content: "❌ PrismTiers is already setup on this server.",
                flags: MessageFlags.Ephemeral
            });

            return;
        }

        await interaction.reply({
            content: "⚙️ Starting PrismTiers setup...",
            ephemeral: true
        });

        await interaction.followUp({
            content: "How would you like to setup PrismTiers?",

            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId("setup_role_mode")
                            .setPlaceholder("Select setup method")
                            .addOptions(
                                {
                                    label: "Create PrismTiers roles",
                                    value: "create"
                                },
                                {
                                    label: "Use existing roles",
                                    value: "existing"
                                }
                            )
                    )
            ],
            flags: MessageFlags.Ephemeral
        });
    }
};

export default command;