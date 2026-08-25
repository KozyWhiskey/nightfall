import { describe, expect, it } from "vitest";
import type { CombatSnapshot, CombatantSnapshot, ItemInstance } from "@nightfall/contracts";
import {
  carrierRecoveredAnnouncement,
  carrierRarityChip,
  isMarkedCarrier,
  livingMarkedCarriers,
  markedCarrierFieldStatus
} from "./carrierChaseUi.js";

function enemy(partial: Partial<CombatantSnapshot> & Pick<CombatantSnapshot, "id">): CombatantSnapshot {
  return {
    definitionId: "gloomfang_hound",
    name: "Gloomfang Hound",
    side: "enemies",
    kind: "enemy",
    hp: 10,
    maxHp: 10,
    dex: 1,
    strength: 0,
    intellect: 0,
    initiative: 5,
    itemInitiative: 0,
    blockLayers: [],
    conditions: [],
    burn: [],
    turnsStarted: 0,
    turnsCompleted: 0,
    downed: false,
    destroyed: false,
    nextDamageBonus: 0,
    targetable: true,
    ...partial
  };
}

function combat(combatants: CombatantSnapshot[]): CombatSnapshot {
  return {
    combatId: "c1",
    encounterId: "stalking_choir",
    round: 1,
    timeline: combatants.map((entry) => entry.id),
    timelineCursor: 0,
    activeCombatantId: combatants[0]!.id,
    awaitingEngage: false,
    combatants,
    heroResources: [],
    cards: [],
    basicActions: [],
    intents: [],
    guards: [],
    supplyUsed: false,
    retainRefillUsedHeroIds: [],
    bossTurn: 0,
    outcome: "active"
  };
}

describe("carrierChaseUi", () => {
  it("detects living marked carriers and builds field status", () => {
    const marked = enemy({ id: "hound_1", name: "Fog Hound", carriedItemId: "item_1" });
    const plain = enemy({ id: "hound_2", name: "Other" });
    const dead = enemy({ id: "hound_3", carriedItemId: "item_2", destroyed: true });
    const snap = combat([marked, plain, dead]);
    expect(livingMarkedCarriers(snap)).toHaveLength(1);
    expect(isMarkedCarrier(marked)).toBe(true);
    expect(isMarkedCarrier(plain)).toBe(false);
    expect(markedCarrierFieldStatus(snap)).toContain("Fog Hound");
    expect(markedCarrierFieldStatus(snap)).toContain("Identity hidden");
  });

  it("builds rarity chip without revealing item name", () => {
    const marked = enemy({ id: "e1", carriedItemId: "i1" });
    const holdings: ItemInstance[] = [{
      instanceId: "i1",
      definitionId: "hewn_sword",
      itemKind: "equipment",
      generationVersion: "t",
      seed: 1,
      rarityId: "imbued",
      prefixIds: ["quickened"],
      suffixIds: [],
      mechanicSnapshot: { modifiers: [] },
      displaySnapshot: { name: "Secret Blade of Spoilers", description: "secret" },
      location: { kind: "carried_by_enemy", enemyId: "e1" }
    }];
    expect(carrierRarityChip(marked, holdings)).toBe("Wielding Imbued");
    expect(carrierRarityChip(marked, holdings)).not.toContain("Secret");
  });

  it("announces recovered carrier by name on reward", () => {
    const item = {
      instanceId: "i1",
      definitionId: "hewn_sword",
      itemKind: "equipment" as const,
      generationVersion: "t",
      seed: 1,
      rarityId: "imbued" as const,
      prefixIds: [],
      suffixIds: [],
      mechanicSnapshot: { modifiers: [] },
      displaySnapshot: { name: "Quickened Hewn Sword", description: "x" },
      location: { kind: "held_by_expedition" as const, runId: "r1" }
    };
    expect(carrierRecoveredAnnouncement(item)).toBe("Marked carrier recovered: Quickened Hewn Sword.");
  });
});
