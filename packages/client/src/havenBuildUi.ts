/** Mirrors Build 1 `pack.tuning.buildings` for Haven construct affordability (client stays snapshot-safe). */
export type BuildingCost = Readonly<{ timber: number; stone: number; wick: number }>;

const BUILDING_COSTS: Readonly<Record<string, BuildingCost>> = {
  cinder_forge: { timber: 7, stone: 5, wick: 1 },
  quiet_house: { timber: 5, stone: 7, wick: 1 },
  wardyard: { timber: 6, stone: 6, wick: 1 }
};

export const CONSTRUCTIBLE_BUILDING_IDS = Object.keys(BUILDING_COSTS) as readonly string[];

export function buildingCost(buildingId: string): BuildingCost | undefined {
  return BUILDING_COSTS[buildingId];
}

export function canAffordBuilding(
  resources: Readonly<{ timber: number; stone: number; wick: number }>,
  cost: BuildingCost
): boolean {
  return resources.timber >= cost.timber && resources.stone >= cost.stone && resources.wick >= cost.wick;
}
