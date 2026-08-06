export const TIER_ROLES = [
    {
        name: "S Tier",
        color: 0xff0000
    },
    {
        name: "A Tier",
        color: 0xff8000
    },
    {
        name: "B Tier",
        color: 0xffff00
    },
    {
        name: "C Tier",
        color: 0x00ff00
    },
    {
        name: "D Tier",
        color: 0x00ffff
    },
    {
        name: "E Tier",
        color: 0x0080ff
    },
    {
        name: "F Tier",
        color: 0x8000ff
    }
] as const;

export const WAITLIST_ROLES = [
    "Sword",
    "Crystal",
    "UHC",
    "SMP",
    "Mace",
    "DiaPot",
    "Axe",
    "DiaSMP",
    "Spear Mace"
] as const;
export const STAFF_ROLES = [
    {
        key: "admin",
        name: "PrismTiers Admin",
        color: 0x9B59B6
    },
    {
        key: "tester",
        name: "Tier Tester",
        color: 0x3498DB
    }
] as const;