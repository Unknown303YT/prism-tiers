import type { BotClient } from "../structures/BotClient.js";

export default function (
    client: BotClient,
    error: Error
) {

    console.error(
        "Discord client error:",
        error
    );

}