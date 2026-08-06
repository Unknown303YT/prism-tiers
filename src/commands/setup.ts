import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder
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

        await interaction.deferReply({
            ephemeral: true
        });


        const server = await servers.setup(
            interaction.guild!.id,
            interaction.guild!.name
        );


        await interaction.editReply(
            `Server registered: ${server.id}`
        );

    }

};


export default command;