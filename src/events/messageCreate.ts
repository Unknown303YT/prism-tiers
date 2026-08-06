import type { Message } from "discord.js";
import type { BotClient } from "../structures/BotClient.js";
import { setup } from "../services/SetupService.js";


export default async function (client: BotClient, message: Message) {
    if (message.author.bot) {
        return;
    }

    if (!message.guild) {
        return;
    }

    const setupChannel = setup.getSetupChannelId(message.guild.id);

    if (!setupChannel) {
        return;
    }

    if (message.channel.id !== setupChannel) {
        return;
    }

    const role = message.mentions.roles.first();

    if (!role) {
        await message.reply("Please mention a role.");

        return;
    }

    await message.reply(`Selected role: ${role.name}`);
}