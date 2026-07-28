import type { Interaction } from "discord.js";
import type { BotClient } from "../structures/BotClient.js";

export default async function (
    client: BotClient,
    interaction: Interaction
) {

    if (!interaction.isChatInputCommand()) {
        return;
    }


    const command = client.commands.get(
        interaction.commandName
    );


    if (!command) {
        console.error(
            `Command ${interaction.commandName} not found`
        );

        return;
    }


    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(error);


        if (interaction.replied) {

            await interaction.followUp({
                content: "An error occurred.",
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content: "An error occurred.",
                ephemeral: true
            });

        }

    }

}