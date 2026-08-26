import type { CombatSnapshot, CombatantSnapshot, EnemyIntentSnapshot } from "@nightfall/contracts";
import { describe, expect, it } from "vitest";
import {
  basicActionReadout,
  conditionTooltip,
  defenseCoverageWindows,
  enemiesActedBetween,
  enemyDefenseCoverageText,
  enemyIdsBeforeNextHero,
  guardLabelsFor,
  heroDefenseCoverageText,
  intentSummary,
  nextHitBonusLabel
} from "./combatUi.js";

function combatant(
  id: string,
  side: CombatantSnapshot["side"],
  kind: CombatantSnapshot["kind"] = side === "heroes" ? "hero" : "enemy",
  name = id,
  overrides: Partial<CombatantSnapshot> = {}
): CombatantSnapshot {
  return {
    id,
    definitionId: id,
    name,
    side,
    kind,
    hp: 10,
    maxHp: 10,
    dex: 1,
    strength: 1,
    intellect: 1,
    initiative: 1,
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
    ...overrides
  };
}

function snapshot(partial: Partial<CombatSnapshot> & Pick<
  CombatSnapshot,
  "combatants" | "timeline" | "timelineCursor" | "activeCombatantId"
>): CombatSnapshot {
  return {
    combatId: "c1",
    encounterId: "roadside",
    round: 1,
    heroResources: [],
    cards: [],
    basicActions: [],
    intents: [],
    guards: [],
    supplyUsed: false,
    retainRefillUsedHeroIds: [],
    bossTurn: 0,
    awaitingEngage: false,
    outcome: "active",
    ...partial
  };
}

const combatants = [
  combatant("hero-a", "heroes"),
  combatant("enemy-1", "enemies"),
  combatant("enemy-2", "enemies"),
  combatant("hero-b", "heroes")
] as const;

const timeline = ["hero-a", "enemy-1", "enemy-2", "hero-b"] as const;

describe("enemiesActedBetween", () => {
  it("returns [] when cursor and active are unchanged even if timeline is a new array", () => {
    const previous = {
      timeline: [...timeline],
      timelineCursor: 0,
      activeCombatantId: "hero-a",
      round: 1,
      combatants: [...combatants]
    };
    const next = {
      timeline: [...timeline],
      timelineCursor: 0,
      activeCombatantId: "hero-a",
      round: 1,
      combatants: [...combatants]
    };

    expect(previous.timeline).not.toBe(next.timeline);
    expect(enemiesActedBetween(previous, next)).toEqual([]);
  });

  it("returns only enemy ids advanced past before the next active combatant", () => {
    const previous = {
      timeline: [...timeline],
      timelineCursor: 0,
      activeCombatantId: "hero-a",
      round: 1,
      combatants: [...combatants]
    };
    const next = {
      timeline: [...timeline],
      timelineCursor: 3,
      activeCombatantId: "hero-b",
      round: 1,
      combatants: [...combatants]
    };

    expect(enemiesActedBetween(previous, next)).toEqual(["enemy-1", "enemy-2"]);
  });

  it("includes the opening actor when Engage advances from awaitingEngage", () => {
    const previous = {
      timeline: ["enemy-1", "enemy-2", "hero-a", "hero-b"],
      timelineCursor: 0,
      activeCombatantId: "enemy-1",
      round: 1,
      awaitingEngage: true,
      combatants: [...combatants]
    };
    const next = {
      timeline: ["enemy-1", "enemy-2", "hero-a", "hero-b"],
      timelineCursor: 2,
      activeCombatantId: "hero-a",
      round: 1,
      awaitingEngage: false,
      combatants: [...combatants]
    };
    expect(enemiesActedBetween(previous, next)).toEqual(["enemy-1", "enemy-2"]);
  });
});

describe("enemyIdsBeforeNextHero", () => {
  it("collects enemies from the current cursor until the next hero", () => {
    const combat = {
      timeline: ["enemy-1", "enemy-2", "hero-a", "hero-b"],
      timelineCursor: 0,
      combatants: [...combatants]
    };
    expect([...enemyIdsBeforeNextHero(combat)]).toEqual(["enemy-1", "enemy-2"]);
  });

  it("returns empty when a hero holds the cursor", () => {
    const combat = {
      timeline: [...timeline],
      timelineCursor: 0,
      combatants: [...combatants]
    };
    expect([...enemyIdsBeforeNextHero(combat)]).toEqual([]);
  });

  it("walks past a Downed hero to later enemies before the next living hero", () => {
    const combat = {
      timeline: ["enemy-1", "hero-b", "enemy-2", "hero-a"],
      timelineCursor: 0,
      combatants: [
        combatant("hero-a", "heroes"),
        combatant("enemy-1", "enemies"),
        combatant("enemy-2", "enemies"),
        combatant("hero-b", "heroes", "hero", "hero-b", { downed: true, hp: 0 })
      ]
    };
    expect([...enemyIdsBeforeNextHero(combat)]).toEqual(["enemy-1", "enemy-2"]);
  });
});

describe("basicActionReadout", () => {
  it("exposes name, AP cost, and snapshot summary for the dock", () => {
    const readout = basicActionReadout({ name: "Staff Strike", apCost: 1, summary: "Deal 3 physical damage" });
    expect(readout).toEqual({
      name: "Staff Strike",
      cost: "1 AP",
      effect: "Deal 3 physical damage",
      ariaLabel: "Staff Strike, 1 AP, Deal 3 physical damage"
    });
  });
});

describe("intentSummary", () => {
  it("includes target domain with magnitude", () => {
    const intent: EnemyIntentSnapshot = {
      enemyId: "enemy-1",
      intentId: "lunge",
      label: "Lunge",
      targetLabel: "lowest hp hero",
      magnitude: 5,
      summary: "",
      revealedAtRevision: 1
    };
    expect(intentSummary(intent)).toBe("Lunge 5 · lowest hp hero");
  });

  it("prints snapshot summary for non-damage telegraphs instead of targetLabel alone", () => {
    const intent: EnemyIntentSnapshot = {
      enemyId: "chanter-1",
      intentId: "borrowed_fury",
      label: "Borrowed Fury",
      targetLabel: "enemy side",
      magnitude: 0,
      summary: "living enemies +2 next hit",
      revealedAtRevision: 1
    };
    expect(intentSummary(intent)).toBe("Borrowed Fury · living enemies +2 next hit");
  });

  it("omits empty target labels", () => {
    const intent: EnemyIntentSnapshot = {
      enemyId: "enemy-1",
      intentId: "skitter",
      label: "Skitter",
      targetLabel: "  ",
      magnitude: 0,
      summary: "",
      revealedAtRevision: 1
    };
    expect(intentSummary(intent)).toBe("Skitter");
  });
});

describe("nextHitBonusLabel", () => {
  it("prints the snapshot bonus and hides zero", () => {
    expect(nextHitBonusLabel(2)).toBe("Next hit +2");
    expect(nextHitBonusLabel(0)).toBeUndefined();
  });
});

describe("guardLabelsFor", () => {
  it("labels guardian and protected combatants", () => {
    const party = [
      combatant("vanguard_1", "heroes", "hero", "Rook"),
      combatant("weaver_1", "heroes", "hero", "Mara")
    ];
    const guards = [{
      id: "hold:1",
      guardingHeroId: "vanguard_1",
      protectedHeroId: "weaver_1",
      expiresAtGuardTurnStart: 2,
      createdAtRevision: 1
    }];

    expect(guardLabelsFor("vanguard_1", guards, party)).toEqual(["Guarding Mara"]);
    expect(guardLabelsFor("weaver_1", guards, party)).toEqual(["Guarded by Rook"]);
    expect(guardLabelsFor("other", guards, party)).toEqual([]);
  });
});

describe("conditionTooltip", () => {
  it("explains known conditions without inventing rules", () => {
    expect(conditionTooltip("exposed")).toMatch(/more damage/i);
    expect(conditionTooltip("weakened")).toMatch(/less damage/i);
    expect(conditionTooltip("stun")).toMatch(/skips/i);
    expect(conditionTooltip("strain")).toMatch(/AP/i);
    expect(conditionTooltip("burn")).toMatch(/end of/i);
    expect(conditionTooltip("burn")).not.toMatch(/start of/i);
  });
});

describe("defenseCoverageWindows", () => {
  const weaver = combatant("weaver", "heroes", "hero", "Mara");
  const hound1 = combatant("hound-1", "enemies", "enemy", "Hound");
  const hound2 = combatant("hound-2", "enemies", "enemy", "Hound");
  const vanguard = combatant("vanguard", "heroes", "hero", "Rook", {
    turnsStarted: 0,
    blockLayers: [{
      id: "vanguard:block",
      sourceId: "basic-block",
      amount: 6,
      createdAtRevision: 1,
      expiresAtOwnerTurnStart: 1,
      special: "normal"
    }]
  });
  const lateVanguardGuard = {
    id: "hold:1",
    guardingHeroId: "vanguard",
    protectedHeroId: "weaver",
    expiresAtGuardTurnStart: 1,
    createdAtRevision: 1
  } as const;

  it("marks upcoming hound turns as Block-covered for a late Vanguard and Guard-covered for Weaver", () => {
    const combat = snapshot({
      combatants: [weaver, hound1, hound2, vanguard],
      timeline: ["weaver", "hound-1", "hound-2", "vanguard"],
      timelineCursor: 0,
      activeCombatantId: "weaver",
      guards: [lateVanguardGuard]
    });

    const windows = defenseCoverageWindows(combat);
    const vanguardWindow = windows.find((entry) => entry.heroId === "vanguard");
    const weaverWindow = windows.find((entry) => entry.heroId === "weaver");

    expect(vanguardWindow?.enemyIds).toEqual(["hound-1", "hound-2"]);
    expect(vanguardWindow?.blockAmount).toBe(6);
    expect(vanguardWindow?.blockCovers).toBe(true);
    expect(vanguardWindow?.blockCoveredEnemyIds).toEqual(["hound-1", "hound-2"]);
    expect(vanguardWindow?.guardCovers).toBe(false);

    expect(weaverWindow?.enemyIds).toEqual(["hound-1", "hound-2"]);
    expect(weaverWindow?.guardCovers).toBe(true);
    expect(weaverWindow?.guardCoveredEnemyIds).toEqual(["hound-1", "hound-2"]);
    expect(weaverWindow?.guardLabel).toBe("Guarded by Rook");
    expect(weaverWindow?.blockCovers).toBe(false);

    expect(heroDefenseCoverageText(vanguardWindow!)).toBe("Block 6 covers next 2 enemy turns");
    expect(heroDefenseCoverageText(weaverWindow!)).toBe("Guarded by Rook covers next 2 enemy turns");
    expect(enemyDefenseCoverageText(windows, "hound-1")).toBe("Covered by Block · Guard");
    expect(enemyDefenseCoverageText(windows, "hound-2")).toBe("Covered by Block · Guard");
  });

  it("lists no remaining Block window after Vanguard's turn start expires Block", () => {
    const activeVanguard = combatant("vanguard", "heroes", "hero", "Rook", {
      turnsStarted: 1,
      blockLayers: []
    });
    const combat = snapshot({
      combatants: [weaver, hound1, hound2, activeVanguard],
      timeline: ["weaver", "hound-1", "hound-2", "vanguard"],
      timelineCursor: 3,
      activeCombatantId: "vanguard",
      guards: []
    });

    const windows = defenseCoverageWindows(combat);
    const vanguardWindow = windows.find((entry) => entry.heroId === "vanguard");
    const weaverWindow = windows.find((entry) => entry.heroId === "weaver");

    expect(vanguardWindow?.blockAmount).toBe(0);
    expect(vanguardWindow?.blockCovers).toBe(false);
    expect(vanguardWindow?.blockCoveredEnemyIds).toEqual([]);
    expect(heroDefenseCoverageText(vanguardWindow!)).toBeUndefined();
    expect(weaverWindow?.guardCovers).toBe(false);
    expect(weaverWindow?.enemyIds).toEqual([]);
    expect(enemyDefenseCoverageText(windows, "hound-1")).toBeUndefined();
  });
});
