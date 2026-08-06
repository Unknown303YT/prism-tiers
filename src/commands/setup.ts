import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} from "discord.js";

import type { Command } from "../structures/Command.js";

import { ServerService } from "../services/ServerService.js";

const servers = new ServerService();

const command: Command = {

    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Sets up PrismTiers for this server")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),


    async execute(interaction: ChatInputCommandInteraction) {

        await interaction.reply({

            content: "How would you like to setup PrismTiers?",

            components: [
                new ActionRowBuilder<StringSelectMenuBuilder>()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(`setup_role_mode:${interaction.user.id}`)
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

            ephemeral: true

        });

    }

};


export default command;