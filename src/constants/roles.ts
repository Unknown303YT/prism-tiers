export const TIER_ROLES = [
    {
        name: "S Tier",
        color: "#ff0000"
    },
    {
        name: "A Tier",
        color: "#ff8000"
    },
    {
        name: "B Tier",
        color: "#ffff00"
    },
    {
        name: "C Tier",
        color: "#00ff00"
    },
    {
        name: "D Tier",
        color: "#00ffff"
    },
    {
        name: "E Tier",
        color: "#0080ff"
    },
    {
        name: "F Tier",
        color: "#8000ff"
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
        color: "#9B59B6"
    },
    {
        key: "tester",
        name: "Tier Tester",
        color: "#3498DB"
    }
] as const;