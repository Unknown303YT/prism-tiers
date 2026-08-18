import { TextBasedChannel, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { setup } from "../../services/SetupService.js";
import { FormStep, SendableChannel, MessageForm, StepResult } from "../../structures/MessageForm.js";

export default class SetupForm extends MessageForm {
    private adminRoleId!: string;
    private testerRoleId!: string;
    private targetGuildId!: string;

    public onStart = async (channel: SendableChannel): Promise<void> => {
        await channel.send({
            content: "# Welcome to PrismTiers setup!\n\nThis form will guide you through the setup process for your server.",

            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("setup_cancel")
                            .setLabel("Cancel Setup")
                            .setStyle(ButtonStyle.Danger)
                    )
            ]
        })
    }

    public readonly steps: FormStep[] = [
        {
            onStepStart: async (channel: SendableChannel) => {
                await channel.send("Please mention the role you want to use as the **Admin Role** for your server.\nThis role will have access to all commands and settings.");
            },
            onStepResponse: async (message: Message): Promise<StepResult> => {
                const role = message.mentions.roles.first();

                if (!role)
                    return {
                        success: false,
                        errorMessage: "You must mention a valid role for the **Admin Role**."
                    };
                
                this.adminRoleId = role.id;
                this.targetGuildId = message.guild!.id;

                await setup.saveRole(this.targetGuildId, "staff", "admin", this.adminRoleId);
                message.reply("Admin role saved.");
                return {success: true};
            }
        },
        {
            onStepStart: async (channel: SendableChannel) => {
                await channel.send("Please mention the role you want to use as the **Tester Role** for your server.\nThis role will have access to testing features and commands.");
            },
            onStepResponse: async (message: Message): Promise<StepResult> => {
                const role = message.mentions.roles.first();

                if (!role)
                    return {
                        success: false,
                        errorMessage: "You must mention a valid role for the **Tester Role**"
                    };
                
                this.testerRoleId = role.id;

                await setup.saveRole(this.targetGuildId, "staff", "tester", this.testerRoleId);
                message.reply("Tester role saved.");
                return {success: true};
            }
        }
    ];

    public async finishForm(channel: SendableChannel): Promise<void> {
        const guild = await channel.client.guilds.fetch(this.targetGuildId);

        if (!guild) {
            await channel.send("Error: Could not find the guild to create roles in.");
            return;
        }

        await setup.createTierRoles(guild);
        await setup.createWaitlistRoles(guild);

        await channel.send("Tier and Waitlist roles created. You may want to re-order them.");

        const categories =await setup.createCategories(guild);

        await channel.send("Categories created. Creating channels...");

        await setup.createChannels(guild, categories);

        await channel.send("Setup complete! You can now use the bot in your server.");

        await channel.send("Deleting setup channel in 5 seconds...");

        setTimeout(async () => {
            await setup.deleteSetupChannel(guild);
            await setup.finish(this.targetGuildId);
        }, 5000);
    }
}