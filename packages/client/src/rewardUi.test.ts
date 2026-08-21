import type { HeroSnapshot, ItemInstance, RewardOffer } from "@nightfall/contracts";
import { describe, expect, it } from "vitest";
import {
  deckInjectLines,
  equipCompareDelta,
  equipCompareRows,
  needsRareLeaveConfirm,
  nonInjectEffectLines,
  packAndSealedCounts
} from "./rewardUi.js";

function item(partial: Partial<ItemInstance> & Pick<ItemInstance, "instanceId" | "definitionId">): ItemInstance {
  return {
    itemKind: "equipment",
    generationVersion: "test",
    seed: 1,
    rarityId: "imbued",
    prefixIds: [],
    suffixIds: [],
    mechanicSnapshot: { modifiers: [], equipmentSlot: "head" },
    displaySnapshot: { name: partial.definitionId, description: "" },
    location: { kind: "held_by_expedition", runId: "run-1" },
    ...partial
  };
}

function hero(partial: Partial<HeroSnapshot> & Pick<HeroSnapshot, "id" | "name">): HeroSnapshot {
  return {
    classId: "vanguard",
    schools: ["iron", "bastion"],
    attributes: { vit: 1, dex: 1, str: 1, int: 1 },
    maxHp: 20,
    hp: 20,
    maxMana: 0,
    mana: 0,
    maxStamina: 10,
    stamina: 10,
    equipment: {
      head: null,
      mainHand: null,
      body: null,
      offHand: null,
      gloves: null,
      legs: null,
      feet: null,
      relic1: null,
      relic2: null
    },
    learnedCardIds: [],
    runLearnedCardIds: [],
    injuries: [],
    pendingLeadership: 0,
    downed: false,
    ...partial
  };
}

describe("needsRareLeaveConfirm", () => {
  it("triggers only for rare or legendary, not imbued", () => {
    const imbued: RewardOffer[] = [{ id: "a", kind: "item", item: item({ instanceId: "1", definitionId: "a", rarityId: "imbued" }) }];
    const rare: RewardOffer[] = [{ id: "b", kind: "item", item: item({ instanceId: "2", definitionId: "b", rarityId: "rare" }) }];
    const legendary: RewardOffer[] = [{ id: "c", kind: "item", item: item({ instanceId: "3", definitionId: "c", rarityId: "legendary" }) }];
    expect(needsRareLeaveConfirm(imbued)).toBe(false);
    expect(needsRareLeaveConfirm(rare)).toBe(true);
    expect(needsRareLeaveConfirm(legendary)).toBe(true);
  });
});

describe("deck inject lines", () => {
  it("extracts Adds to deck / Learn lines and leaves other effects", () => {
    const description = "Adds to deck: Guard · 1 AP — Gain 4 Block\n+3 max HP while equipped\nLearn Shield Bash · 2 AP — Deal 5";
    expect(deckInjectLines(description)).toEqual([
      "Adds to deck: Guard · 1 AP — Gain 4 Block",
      "Learn Shield Bash · 2 AP — Deal 5"
    ]);
    expect(nonInjectEffectLines(description)).toEqual(["+3 max HP while equipped"]);
  });
});

describe("equipCompareDelta", () => {
  it("reports Empty vs numeric and granted-card deltas", () => {
    const offer = item({
      instanceId: "offer",
      definitionId: "emberglass_cowl",
      displaySnapshot: { name: "Emberglass Cowl", description: "Adds to deck: Emberglass · 1 AP — Deal 3\n+1 initiative while equipped" },
      mechanicSnapshot: { modifiers: [], equipmentSlot: "head", initiativeDelta: 1, grantedCardId: "emberglass_shard" }
    });
    expect(equipCompareDelta(offer, undefined)).toBe("+1 init · Emberglass Shard");

    const worn = item({
      instanceId: "worn",
      definitionId: "rag_hood",
      displaySnapshot: { name: "Rag Hood", description: "+0" },
      mechanicSnapshot: { modifiers: [], equipmentSlot: "head", initiativeDelta: 0 }
    });
    expect(equipCompareDelta(offer, worn)).toBe("+1 init · Emberglass Shard");

    const same = item({
      instanceId: "same",
      definitionId: "same_cowl",
      displaySnapshot: { name: "Same Cowl", description: "Adds to deck: Emberglass · 1 AP — Deal 3" },
      mechanicSnapshot: { modifiers: [], equipmentSlot: "head", initiativeDelta: 1, grantedCardId: "emberglass_shard" }
    });
    expect(equipCompareDelta(offer, same)).toBeUndefined();
  });
});

describe("equipCompareRows", () => {
  it("compares each eligible hero slot including Empty", () => {
    const offer = item({
      instanceId: "offer",
      definitionId: "wayfarers_coat",
      displaySnapshot: { name: "Wayfarer's Coat", description: "+3 max HP while equipped" },
      mechanicSnapshot: { modifiers: [], equipmentSlot: "body", maxHpDelta: 3, requiredSchools: ["iron"] }
    });
    const worn = item({
      instanceId: "coat",
      definitionId: "old_coat",
      displaySnapshot: { name: "Old Coat", description: "+1 max HP while equipped" },
      mechanicSnapshot: { modifiers: [], equipmentSlot: "body", maxHpDelta: 1 },
      location: { kind: "equipped", heroId: "h1", slotId: "body" }
    });
    const vanguard = hero({
      id: "h1",
      name: "Kael",
      schools: ["iron", "bastion"],
      equipment: { ...hero({ id: "h1", name: "Kael" }).equipment, body: "coat" }
    });
    const weaver = hero({
      id: "h2",
      name: "Nyx",
      classId: "aether_weaver",
      schools: ["aether", "ember"]
    });
    const rows = equipCompareRows(offer, [vanguard, weaver], [worn]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.line).toBe("Kael · Body: Old Coat · +2 HP");

    const emptyRows = equipCompareRows(offer, [vanguard], []);
    expect(emptyRows[0]!.line).toBe("Kael · Body: Empty · +3 HP");
  });
});

describe("packAndSealedCounts", () => {
  it("counts expedition pack and waypoint chest", () => {
    const counts = packAndSealedCounts({
      holdings: [
        item({ instanceId: "a", definitionId: "a" }),
        item({ instanceId: "b", definitionId: "b", location: { kind: "equipped", heroId: "h1", slotId: "head" } })
      ],
      waypointChest: [item({ instanceId: "c", definitionId: "c", location: { kind: "sealed_in_waypoint", waypointId: "w1" } })]
    } as unknown as Parameters<typeof packAndSealedCounts>[0]);
    expect(counts).toEqual({ pack: 1, sealed: 1 });
  });
});
