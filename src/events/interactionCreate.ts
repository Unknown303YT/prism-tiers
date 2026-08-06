import type { Interaction } from "discord.js";
import type { BotClient } from "../structures/BotClient.js";


export default async function (
    client: BotClient,
    interaction: Interaction
) {

    if (interaction.isChatInputCommand()) {

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



    if (interaction.isStringSelectMenu()) {

        if (interaction.customId.startsWith("setup_role_mode:")) {

            const userId =
                interaction.customId.split(":")[1];


            if (interaction.user.id !== userId) {

                await interaction.reply({

                    content: "Only the person who started setup can continue it.",

                    ephemeral: true

                });

                return;

            }

        }

    }

}