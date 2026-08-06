import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder
} from "discord.js";

import type { Command } from "../structures/Command.js";
import { HealthService } from "../services/HealthService.js";
import { VERSION } from "../constants/version.js"

const health = new HealthService();


const command: Command = {

    data: new SlashCommandBuilder()
        .setName("status")
        .setDescription("Shows PrismTiers system status"),


    async execute(interaction: ChatInputCommandInteraction) {

        await interaction.deferReply();


        const start = Date.now();


        const database = await health.checkDatabase();
        const redis = await health.checkRedis();


        const responseTime = Date.now() - start;


        const discordPing = interaction.client.ws.ping;


        const memory = Math.round(
            process.memoryUsage().heapUsed / 1024 / 1024
        );


        const uptime = formatUptime(
            Math.floor(process.uptime())
        );


        const healthy =
            database &&
            redis &&
            discordPing !== -1;


        const embed = new EmbedBuilder()

            .setTitle("🏆 PrismTiers Status")

            .setDescription(
                healthy
                    ? "🟢 All systems operational"
                    : "🟡 Some systems are degraded"
            )

            .setColor(
                healthy
                    ? 0x57F287
                    : 0xFEE75C
            )

            .addFields(

                {
                    name: "🌐 Discord Gateway",
                    value:
                        discordPing === -1
                            ? "🟡 Connecting..."
                            : `🟢 Connected\n↳ ${discordPing}ms`,
                    inline: true
                },


                {
                    name: "🗄 Database",
                    value:
                        database
                            ? "🟢 Online"
                            : "🔴 Offline",
                    inline: true
                },


                {
                    name: "⚡ Redis Cache",
                    value:
                        redis
                            ? "🟢 Online"
                            : "🔴 Offline",
                    inline: true
                },


                {
                    name: "🤖 Bot Information",
                    value:
                        [
                            `Version: ${VERSION}`,
                            `Node.js: ${process.version}`,
                            `Uptime: ${uptime}`
                        ].join("\n"),
                    inline: false
                },


                {
                    name: "💻 Resources",
                    value:
                        [
                            `Memory: ${memory}MB`,
                            `Response: ${responseTime}ms`
                        ].join("\n"),
                    inline: true
                },


                {
                    name: "🏆 PrismTiers Network",
                    value:
                        [
                            "Players: Coming soon",
                            "Tests: Coming soon",
                            "Gamemodes: Coming soon"
                        ].join("\n"),
                    inline: true
                }

            )

            .setFooter({
                text: "PrismTiers • Defining Minecraft Skill"
            })

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

    const secs = seconds % 60;


    return `${days}d ${hours}h ${minutes}m ${secs}s`;

}


export default command;