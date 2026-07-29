import type { BotClient } from "../structures/BotClient.js";

export default function (
    client: BotClient
) {

    console.log(
        `Logged in as ${client.user?.tag}`
    );

    client.user?.setPresence({
        activities: [
            {
                name: "🏆 PrismTiers • Defining Minecraft Skill",
                type: 0
            }
        ],
        status: "online"
    });

}