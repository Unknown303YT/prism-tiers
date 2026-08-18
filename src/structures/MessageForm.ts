import { Message, TextBasedChannel } from 'discord.js';

export type StepResult = 
    | { success: true }
    | { success: false, errorMessage: string };

export type SendableChannel = TextBasedChannel & {
    send: (...args: any[]) => Promise<Message<boolean>>;
};

export interface FormStep {
    onStepStart: (channel: SendableChannel) => Promise<void> | void;
    onStepResponse: (message: Message) => Promise<StepResult> | StepResult;
}

export abstract class MessageForm {
    public readonly userId: string;
    public readonly channelId: string;

    public abstract readonly steps: FormStep[];
    public currentStepIndex = 0;

    constructor(userId: string, channelId: string) {
        this.userId = userId;
        this.channelId = channelId;
    }

    public async startForm(channel: TextBasedChannel): Promise<void> {
        if (!this.steps || this.steps.length == 0) {
            throw new Error("Cannot start a form with zero steps defined.");
        }

        const messageableChannel = MessageForm.asSendableChannel(channel);
        
        if (typeof this.onStart === "function")
            await this.onStart(messageableChannel);

        await this.steps[this.currentStepIndex].onStepStart(messageableChannel);
    }

    public onStart?(channel: SendableChannel): Promise<void>;

    public async executeCurrentStartHook(channel: TextBasedChannel): Promise<void> {
        const messageableChannel = MessageForm.asSendableChannel(channel);
        await this.steps[this.currentStepIndex].onStepStart(messageableChannel);
    }

    public async executeCurrentResponseHook(message: Message): Promise<StepResult> {
        return await this.steps[this.currentStepIndex].onStepResponse(message);
    }

    public finishForm?(channel: SendableChannel): Promise<void> | void;

    public static asSendableChannel(channel: TextBasedChannel): SendableChannel {
        if (!("send" in channel)) {
            throw new Error("The provided channel does not support sending messages.");
        }
        return channel as SendableChannel;
    }
}