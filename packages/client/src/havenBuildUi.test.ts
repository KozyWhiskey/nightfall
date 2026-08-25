import { describe, expect, it } from "vitest";
import { buildingCost, canAffordBuilding, CONSTRUCTIBLE_BUILDING_IDS } from "./havenBuildUi.js";

describe("havenBuildUi", () => {
  it("mirrors Build 1 constructible building costs", () => {
    expect(CONSTRUCTIBLE_BUILDING_IDS).toEqual(["cinder_forge", "quiet_house", "wardyard"]);
    expect(buildingCost("cinder_forge")).toEqual({ timber: 7, stone: 5, wick: 1 });
    expect(buildingCost("quiet_house")).toEqual({ timber: 5, stone: 7, wick: 1 });
    expect(buildingCost("wardyard")).toEqual({ timber: 6, stone: 6, wick: 1 });
    expect(buildingCost("pillarhouse")).toBeUndefined();
  });

  it("rejects construct when any timber, stone, or wick is short", () => {
    const cost = buildingCost("cinder_forge")!;
    expect(canAffordBuilding({ timber: 7, stone: 5, wick: 1 }, cost)).toBe(true);
    expect(canAffordBuilding({ timber: 6, stone: 5, wick: 1 }, cost)).toBe(false);
    expect(canAffordBuilding({ timber: 7, stone: 4, wick: 1 }, cost)).toBe(false);
    expect(canAffordBuilding({ timber: 7, stone: 5, wick: 0 }, cost)).toBe(false);
  });
});
