import type { CombatantSnapshot, EnemyIntentSnapshot } from "@nightfall/contracts";
import { describe, expect, it } from "vitest";
import { enemiesActedBetween, guardLabelsFor, intentSummary, conditionTooltip } from "./combatUi.js";

function combatant(
  id: string,
  side: CombatantSnapshot["side"],
  kind: CombatantSnapshot["kind"] = side === "heroes" ? "hero" : "enemy",
  name = id
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
    targetable: true
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
});

describe("intentSummary", () => {
  it("includes target domain with magnitude", () => {
    const intent: EnemyIntentSnapshot = {
      enemyId: "enemy-1",
      intentId: "lunge",
      label: "Lunge",
      targetLabel: "lowest hp hero",
      magnitude: 5,
      revealedAtRevision: 1
    };
    expect(intentSummary(intent)).toBe("Lunge 5 · lowest hp hero");
  });

  it("omits empty target labels", () => {
    const intent: EnemyIntentSnapshot = {
      enemyId: "enemy-1",
      intentId: "skitter",
      label: "Skitter",
      targetLabel: "  ",
      magnitude: 0,
      revealedAtRevision: 1
    };
    expect(intentSummary(intent)).toBe("Skitter");
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
  });
});
