export const GAMEMODES = [

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

export type Gamemode =
    typeof GAMEMODES[number];