import { ChannelType } from "discord.js";

export const CATEGORIES = [
    {
        key: "main",
        name: "PrismTiers"
    },
    {
        key: "results",
        name: "PrismTiers Results"
    },
    {
        key: "testing",
        name: "Testing"
    },
    {
        key: "admin",
        name: "PrismTiers Admin"
    }
] as const;

export const CHANNELS = [
    {
        key: "waitlist",
        name: "request-test",
        category: "main",
        type: ChannelType.GuildText
    },

    {
        key: "sword",
        name: "sword-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "crystal",
        name: "crystal-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "uhc",
        name: "uhc-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "smp",
        name: "smp-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "mace",
        name: "mace-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "diapot",
        name: "diamond-pot-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "axe",
        name: "axe-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "diasmp",
        name: "diamond-smp-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },
    {
        key: "spear_mace",
        name: "spear-mace-waitlist",
        category: "main",
        type: ChannelType.GuildText
    },

    {
        key: "sword_results",
        name: "sword",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "crystal_results",
        name: "crystal",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "uhc_results",
        name: "uhc",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "smp_results",
        name: "smp",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "mace_results",
        name: "mace",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "diapot_results",
        name: "diapot",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "axe_results",
        name: "axe",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "diasmp_results",
        name: "diasmp",
        category: "results",
        type: ChannelType.GuildText
    },
    {
        key: "spear_mace_results",
        name: "spear-mace",
        category: "results",
        type: ChannelType.GuildText
    },

    {
        key: "logs",
        name: "logs",
        category: "admin",
        type: ChannelType.GuildText
    },
    {
        key: "test_management",
        name: "test-management",
        category: "admin",
        type: ChannelType.GuildText
    }
] as const;