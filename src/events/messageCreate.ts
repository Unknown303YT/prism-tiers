import type { Message } from "discord.js";
import type { BotClient } from "../structures/BotClient.js";
import { messageFormHandler } from "../services/MessageFormService.js";


export default async function (client: BotClient, message: Message) {
    if (message.author.bot) return;

    const activeForm = await messageFormHandler.getActiveForm(message.channel.id, message.author.id);

    if (activeForm) {
        await messageFormHandler.processFormMessage(message.channel.id, message.author.id, message);
        return;
    }

    if (!message.guild) {
        return;
    }
}