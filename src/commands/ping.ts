import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder
} from "discord.js";

import type { Command } from "../structures/Command.js";
import { HealthService } from "../services/HealthService.js";

const health = new HealthService();

const command: Command = {

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Shows bot latency and system status"),


    async execute(interaction: ChatInputCommandInteraction) {

        const start = Date.now();

        await interaction.deferReply();

        const responseTime = Date.now() - start;

        const database = await health.checkDatabase();
        const redis = await health.checkRedis();


        const embed = new EmbedBuilder()
            .setTitle("🏓 PrismTiers Ping")
            .setColor(database && redis ? 0x57F287 : 0xFEE75C)
            .addFields(
                {
                    name: "Discord Latency",
                    value: interaction.client.ws.ping === -1 ? "Calculating..." : `${interaction.client.ws.ping}ms`,
                    inline: true
                },
                {
                    name: "Response Time",
                    value: `${responseTime}ms`,
                    inline: true
                },
                {
                    name: "Uptime",
                    value: formatUptime(process.uptime()),
                    inline: true
                },
                {
                    name: "Database",
                    value: database ? "🟢 Connected" : "🔴 Offline",
                    inline: true
                },
                {
                    name: "Redis",
                    value: redis ? "🟢 Connected" : "🔴 Offline",
                    inline: true
                },
                {
                    name: "Node.js",
                    value: process.version,
                    inline: true
                },
                {
                    name: "Memory Usage",
                    value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                    inline: true
                }
            )
            .setTimestamp();


        await interaction.editReply({
            embeds: [embed]
        });

    }

};


function formatUptime(seconds: number): string {

    const days = Math.floor(seconds / 86400);
    seconds %= 86400;

    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);


    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}


export default command;