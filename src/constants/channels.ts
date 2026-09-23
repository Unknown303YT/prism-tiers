import { ChannelType } from "discord.js";

export const CATEGORIES = [
    {
        key: "waitlists",
        name: "Waitlists"
    },
    {
        key: "results",
        name: "Results"
    },
    {
        key: "testing",
        name: "Testing"
    },
    {
        key: "staff",
        name: "Staff"
    }
] as const;

export const CHANNELS = [
    {
        key: "waitlist",
        name: "waitlist",
        category: "waitlists",
        type: ChannelType.GuildText
    },

    {
        key: "sword",
        name: "sword",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "crystal",
        name: "crystal",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "uhc",
        name: "uhc",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "smp",
        name: "smp",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "mace",
        name: "mace",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "diapot",
        name: "diapot",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "axe",
        name: "axe",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "diasmp",
        name: "diasmp",
        category: "waitlists",
        type: ChannelType.GuildText
    },
    {
        key: "spear_mace",
        name: "spear-mace",
        category: "waitlists",
        type: ChannelType.GuildText
    },

    {
        key: "results",
        name: "results",
        category: "results",
        type: ChannelType.GuildText
    },

    {
        key: "logs",
        name: "logs",
        category: "staff",
        type: ChannelType.GuildText
    }
] as const;