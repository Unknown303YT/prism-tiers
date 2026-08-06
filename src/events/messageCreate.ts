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

    const waitingFor = setup.getWaitingFor(message.guild.id);

    if (!waitingFor) {
        return;
    }

    await setup.saveRole(
        message.guild.id,
        waitingFor.type,
        waitingFor.key,
        role.id
    );

    if (waitingFor.type === "staff" && waitingFor.key === "admin") {
        setup.setWaitingFor(
            message.guild.id,
            "staff",
            "tester"
        );

        await message.reply("Admin role saved.\n\nPlease mention the **Tester** role.");
    }

    if (waitingFor.type === "staff" && waitingFor.key === "tester") {
        await message.reply("Tester role saved.");

        await setup.createTierRoles(message.guild);
        await setup.createWaitlistRoles(message.guild);

        await message.reply("Tier and Waitlist roles created. You may want to re-order them.");

        await new Promise(resolve => setTimeout(resolve, 5000));

        await message.reply("Setup Complete! Deleting in 5 seconds...");

        await new Promise(resolve => setTimeout(resolve, 5000));

        await setup.deleteSetupChannel(message.guild);
        await setup.finish(message.guild.id);
    }
}