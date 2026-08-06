import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags
} from "discord.js";

import type { Command } from "../structures/Command.js";
import { setup } from "../services/SetupService.js";

const command: Command = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Sets up PrismTiers for this server")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        await setup.start(interaction.guild!);

        await interaction.reply({
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