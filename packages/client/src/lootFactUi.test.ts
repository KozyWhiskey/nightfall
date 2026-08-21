import { describe, expect, it } from "vitest";
import type { GameSnapshot, ItemInstance, ResolvedFact } from "@nightfall/contracts";
import { isLootCelebrationKind, isNotableLootItem, presentLootFact, resolveFactItem } from "./lootFactUi.js";

function item(partial: Partial<ItemInstance> & Pick<ItemInstance, "instanceId" | "rarityId">): ItemInstance {
  return {
    definitionId: "hewn_sword",
    itemKind: "equipment",
    generationVersion: "test",
    seed: 1,
    prefixIds: [],
    suffixIds: [],
    mechanicSnapshot: { modifiers: [] },
    displaySnapshot: { name: "Test Blade", description: "Adds to deck: Iron Cut" },
    location: { kind: "held_by_expedition", runId: "run_1" },
    ...partial
  };
}

function snapshotWith(holdings: ItemInstance[]): GameSnapshot {
  return {
    schemaVersion: 1,
    contentVersion: "test",
    contentHash: "test",
    revision: 1,
    rngStates: {} as GameSnapshot["rngStates"],
    campaign: { campaignId: "c", currentHavenId: "h", havenSequence: 1, claimedWaypointIds: [], settlementTraceIds: [], discoveredBlueprintIds: [], worldFlags: [] },
    haven: {
      havenId: "h",
      name: "Test",
      litPillars: 10,
      gloom: 0,
      resources: { salvage: 0, emberglass: 0, rations: 0, timber: 0, stone: 0, wick: 0, ember_shard: 0 },
      buildings: [],
      heroes: [],
      holdings: holdings.filter((entry) => entry.location.kind === "haven_stash" || entry.location.kind === "equipped"),
      pendingLeadership: []
    },
    activeRun: {
      runId: "run_1",
      routeId: "unlit_road",
      phase: "reward",
      currentNodeId: "combat_1",
      runGloom: 0,
      heroes: [],
      holdings: holdings.filter((entry) => entry.location.kind === "held_by_expedition" || entry.location.kind === "equipped"),
      materials: { salvage: 0, emberglass: 0, rations: 0, timber: 0, stone: 0, wick: 0, ember_shard: 0 },
      flags: [],
      nodes: [],
      edges: [],
      waypointChest: [],
      diagnostics: { gloomChanges: [], cardsPlayed: 0, basicActions: 0, eventChoices: [] }
    },
    latestFacts: [],
    ui: { selectedHeroId: null, selectedEnemyId: null, selectedCardInstanceId: null, supplyWarningSeen: false }
  } as unknown as GameSnapshot;
}

function fact(kind: string, itemId: string | undefined, message: string): ResolvedFact {
  return {
    id: `fact_${kind}`,
    kind,
    message,
    data: itemId === undefined ? {} : { itemId }
  };
}

describe("lootFactUi", () => {
  it("recognizes celebration kinds only", () => {
    expect(isLootCelebrationKind("reward_chosen")).toBe(true);
    expect(isLootCelebrationKind("item_equipped")).toBe(true);
    expect(isLootCelebrationKind("gloom_changed")).toBe(false);
  });

  it("treats imbued/rare/legendary/cursed as notable and salvaged as quiet", () => {
    expect(isNotableLootItem(item({ instanceId: "a", rarityId: "salvaged" }))).toBe(false);
    expect(isNotableLootItem(item({ instanceId: "b", rarityId: "imbued" }))).toBe(true);
    expect(isNotableLootItem(item({ instanceId: "c", rarityId: "rare" }))).toBe(true);
    expect(isNotableLootItem(item({ instanceId: "d", rarityId: "legendary" }))).toBe(true);
    expect(isNotableLootItem(item({ instanceId: "e", rarityId: "salvaged", curseId: "frayed" }))).toBe(true);
  });

  it("resolves itemId from expedition holdings", () => {
    const blade = item({ instanceId: "blade_1", rarityId: "rare" });
    const snap = snapshotWith([blade]);
    expect(resolveFactItem(snap, fact("reward_chosen", "blade_1", "ok"))).toEqual(blade);
  });

  it("presents rare reward_chosen with glyph, label, and celebrate class", () => {
    const blade = item({ instanceId: "blade_1", rarityId: "rare", displaySnapshot: { name: "Quickened Blade", description: "x" } });
    const presented = presentLootFact(snapshotWith([blade]), fact("reward_chosen", "blade_1", "Quickened Blade joined the expedition holdings."));
    expect(presented.glyph).toBe("◆");
    expect(presented.rarityLabel).toBe("Rare");
    expect(presented.notable).toBe(true);
    expect(presented.className).toContain("is-loot-notable");
    expect(presented.className).toContain("is-loot-celebrate");
    expect(presented.className).toContain("is-rarity-rare");
    expect(presented.message).toContain("joined the expedition");
  });

  it("marks cursed equip rows with dashed cursed class", () => {
    const cursed = item({ instanceId: "c1", rarityId: "imbued", curseId: "hollow" });
    const presented = presentLootFact(snapshotWith([cursed]), fact("item_equipped", "c1", "Rook equipped Cursed Focus."));
    expect(presented.rarityLabel).toBe("Imbued · cursed");
    expect(presented.className).toContain("is-loot-cursed");
    expect(presented.cursed).toBe(true);
  });

  it("falls back to raw message when item is missing or kind is unrelated", () => {
    const snap = snapshotWith([]);
    const missing = presentLootFact(snap, fact("reward_chosen", "gone", "Something joined."));
    expect(missing.glyph).toBeUndefined();
    expect(missing.notable).toBe(false);
    expect(missing.message).toBe("Something joined.");

    const other = presentLootFact(snap, fact("gloom_changed", undefined, "Run Gloom rose."));
    expect(other.className).toBe("fact-log-row");
    expect(other.message).toBe("Run Gloom rose.");
  });

  it("keeps salvaged reward_chosen quiet (glyph ok, no celebrate)", () => {
    const plain = item({ instanceId: "s1", rarityId: "salvaged" });
    const presented = presentLootFact(snapshotWith([plain]), fact("reward_chosen", "s1", "Salvaged Sword joined."));
    expect(presented.glyph).toBe("·");
    expect(presented.notable).toBe(false);
    expect(presented.className).not.toContain("is-loot-celebrate");
  });
});
