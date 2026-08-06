import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction
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

            ephemeral: true

        });

        const response =
            await interaction.fetchReply();


        const collector =
            response.createMessageComponentCollector({

                time: 60000

            });


        collector.on(
            "collect",
            async (component: StringSelectMenuInteraction) => {

                if (component.customId !== "setup_role_mode") {
                    return;
                }


                await component.update({

                    content:
                        component.values[0] === "create"
                            ? "Creating PrismTiers roles..."
                            : "Selecting existing roles...",

                    components: []

                });

            }
        );


    }

};


export default command;