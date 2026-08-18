import { Channel, Collection, Message } from "discord.js";
import { MessageForm } from "../structures/MessageForm.js";
import { client } from "../index.js";

class MessageFormService {
    private activeForms = new Collection<string, MessageForm>();

    private getSessionKey(channelId: string, userId: string): string {
        return `${channelId}-${userId}`;
    }

    public async startForm(form: MessageForm): Promise<void> {
        this.activeForms.set(this.getSessionKey(form.channelId, form.userId), form);
        const channel = await client.channels.fetch(form.channelId);
        if (channel && channel.isTextBased())
            await form.startForm(channel);
        else
            throw new Error(`Channel ${form.channelId} either not found or not text based`);
    }

    public async processFormMessage(channelId: string, userId: string, message: Message): Promise<void> {
        const form = this.activeForms.get(this.getSessionKey(channelId, userId));
        if (!form)
            return;

        const result = await form.executeCurrentResponseHook(message);

        if (!result.success) {
            await message.reply("Invalid response: " + result.errorMessage);
        } else {
            form.currentStepIndex++;
        }

        if (form.currentStepIndex < form.steps.length) {
            await form.executeCurrentStartHook(message.channel);
        } else {
            await this.destroyForm(channelId, userId);
        }
    }

    public async destroyForm(channelId: string, userId: string): Promise<void> {
        const key = this.getSessionKey(channelId, userId);
        const form = this.activeForms.get(key);

        if (form) {
            if (typeof form.finishForm === "function") {
                const channel = await client.channels.fetch(form.channelId);
                if (channel && channel.isTextBased()) {
                    const messageableChannel = MessageForm.asSendableChannel(channel);
                    await form.finishForm(messageableChannel);
                } else
                    throw new Error(`Channel ${form.channelId} either not found or not text based`);
            }
            this.activeForms.delete(key);
        }
    }

    public async getActiveForm(channelId: string, userId: string): Promise<MessageForm> {
        return this.activeForms.get(this.getSessionKey(channelId, userId))!;
    }
}

export const messageFormHandler = new MessageFormService();