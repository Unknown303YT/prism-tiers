import type {
    Interaction,
    ActionRowBuilder,
    RoleSelectMenuBuilder
} from "discord.js";
import { MessageFlags } from "discord.js";
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

                content:
                    "Starting setup...",

                components: []

            });

            if (!interaction.guild) {
                return;
            }

            if (interaction.values[0] === "create") {
                await setup.createRoles(interaction.guild);
            }

            if (interaction.values[0] === "existing") {
                await setup.selectRoles(interaction.guild);
            }
        }
    }

    if (interaction.isRoleSelectMenu()) {
        if (interaction.customId === "setup_admin_role") {
            await setup.saveRole(interaction.guild!.id,"staff","admin",interaction.values[0]);

            await interaction.update({
                content:"Admin role saved. Select the tester role:",

                components: [
                    new ActionRowBuilder<RoleSelectMenuBuilder>()
                        .addComponents(
                            new RoleSelectMenuBuilder()
                                .setCustomId("setup_tester_role")
                                .setPlaceholder("Select tester role")
                        )
                ]
            });
        }
    }
}