import type { Interaction } from "discord.js";
import {
    MessageFlags,
    ActionRowBuilder,
    RoleSelectMenuBuilder
} from "discord.js";
import type { BotClient } from "../structures/BotClient.js";
import { setup } from "../services/SetupService.js";

export default async function (client: BotClient, interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Command ${interaction.commandName} not found`);

            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied) {
                await interaction.followUp({
                    content: "An error occurred.",
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: "An error occurred.",
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }


    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === "setup_role_mode") {
            await interaction.update({
                content: "Starting setup...",
                components: []
            });

            if (!interaction.guild) {
                return;
            }

            if (interaction.values[0] === "create") {
                await setup.createStaffRoles(interaction.guild);

                await setup.createTierRoles(interaction.guild);


                await setup.createWaitlistRoles(interaction.guild);

                await interaction.followUp({
                    content: "Roles created successfully.",
                    flags: MessageFlags.Ephemeral
                });

                await new Promise(resolve => setTimeout(resolve, 5000));

                await interaction.followUp("Setup Complete! Deleting in 5 seconds...");

                await new Promise(resolve => setTimeout(resolve, 5000));

                await setup.deleteSetupChannel(interaction.guild);
                await setup.finish(interaction.guild.id);

                await interaction.deleteReply();
            }

            if (interaction.values[0] === "existing") {
                await setup.createSetupChannel(
                    interaction.guild,
                    interaction.user
                );
            }
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === "setup_cancel") {
            if (!interaction.guild) {
                return;
            }

            await interaction.reply({
                content:"Setup cancelled.",
                flags: MessageFlags.Ephemeral
            });

            setup.deleteSetupChannel(interaction.guild);

            setup.cancel(interaction.guild.id);
        }
    }
}