import type { Interaction } from "discord.js";
import { MessageFlags } from "discord.js";
import type { BotClient } from "../structures/BotClient.js";
import { SetupService } from "../services/SetupService.js";

const setup = new SetupService();

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

            if (interaction.values[0] === "create") {
                await setup.createRoles();
            }

            if (interaction.values[0] === "existing") {
                await setup.selectRoles();
            }
        }
    }
}