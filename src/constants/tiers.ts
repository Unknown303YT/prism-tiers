export const TIERS = [

    "S",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"

] as const;

export type Tier =
    typeof TIERS[number];