import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";

import type { Command } from "../structures/Command.js";


const command: Command = {

    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Sets up PrismTiers for this server")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),


    async execute(interaction: ChatInputCommandInteraction) {

        await interaction.deferReply({
            ephemeral: true
        });


        await interaction.editReply(
            "Setup coming soon."
        );

    }

};


export default command;