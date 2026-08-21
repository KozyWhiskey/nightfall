import { describe, expect, it } from "vitest";
import { build1Pack } from "@nightfall/content";
import type { EquipmentSlot } from "@nightfall/contracts";
import { cloneSnapshot, createContext, createItemInstance, startCombat, totalBlockForFixture, type ForcedStreams, type MutableSnapshot } from "@nightfall/sim";
import { accept, command, createEmbarkedSnapshot } from "./index.js";

function setActiveHero(snapshot: MutableSnapshot, heroId: string): void {
  const combat = snapshot.activeRun?.combat;
  if (combat === undefined) throw new Error("Expected combat");
  const index = combat.timeline.indexOf(heroId);
  combat.timelineCursor = index >= 0 ? index : 0;
  combat.activeCombatantId = heroId;
  const resources = combat.heroResources.find((entry) => entry.heroId === heroId);
  if (resources !== undefined) resources.ap = 3;
}

function startAffixCombat(
  definitionId: string,
  affixIds: readonly string[],
  options: {
    heroClass?: "vanguard" | "aether_weaver";
    slot?: EquipmentSlot;
    encounterId?: string;
    seed?: number;
    forcedStreams?: ForcedStreams;
  } = {}
): MutableSnapshot {
  const heroClass = options.heroClass ?? "vanguard";
  const slot = options.slot ?? "mainHand";
  const embarked = createEmbarkedSnapshot(build1Pack, options.seed ?? 12345);
  const mutable = cloneSnapshot(embarked);
  const run = mutable.activeRun!;
  const hero = run.heroes.find((entry) => entry.classId === heroClass)!;
  const previousId = hero.equipment[slot];
  if (previousId !== null) {
    const previous = run.holdings.find((entry) => entry.instanceId === previousId);
    if (previous !== undefined) previous.location = { kind: "held_by_expedition", runId: run.runId };
  }
  const item = createItemInstance(
    build1Pack,
    definitionId,
    "imbued",
    99,
    `affix_test:${definitionId}:${affixIds.join("+") || "plain"}`,
    { kind: "equipped", heroId: hero.id, slotId: slot },
    affixIds
  );
  run.holdings.push(item as never);
  hero.equipment[slot] = item.instanceId;
  run.runGloom = 0;
  run.phase = "combat";
  startCombat(mutable, build1Pack, options.encounterId ?? "roadside_trail", createContext({
    combatInitiative: [0.9, 0.9, 0, 0],
    combatIntent: [0, 0],
    ...options.forcedStreams
  }));
  return mutable;
}

describe("Registry affix combat modifiers", () => {
  it("SIM-AFFIX-01 card_burn applies 1 Burn (duration 2) from a vessel attack", () => {
    let snapshot = startAffixCombat("hewn_sword", ["cinderbound"]);
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const ironCut = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    expect(ironCut.sourceId).toBe(`affix_test:hewn_sword:cinderbound`);
    ironCut.zone = "hand";
    const target = run.combat!.combatants.find((entry) => entry.side === "enemies")!;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: ironCut.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack) as MutableSnapshot;
    const burned = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === target.id)!;
    expect(burned.burn).toHaveLength(1);
    expect(burned.burn[0]!.remainingOwnerTurns).toBe(2);
  });

  it("SIM-AFFIX-02 basic_block_plus_1 adds +1 Block on Raise Shield", () => {
    let snapshot = startAffixCombat("kite_shield", ["broken_gate"], { slot: "offHand" });
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "useBasicBlock", {}, vanguard.id), build1Pack) as MutableSnapshot;
    expect(totalBlockForFixture(snapshot, vanguard.id)).toBe(7);
  });

  it("SIM-AFFIX-03 combat_start_draw draws +1 beyond hand size on first turn", () => {
    // Use a relic vessel so weaver keeps four deck cards (class ×2 + mainHand + offHand).
    const snapshot = startAffixCombat("pilgrims_knot", ["veiled_road"], { heroClass: "aether_weaver", slot: "relic1" });
    const run = snapshot.activeRun!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    expect(run.holdings.find((item) => item.instanceId === weaver.equipment.relic1)?.mechanicSnapshot.modifiers).toContain("combat_start_draw");
    expect(run.combat!.activeCombatantId).toBe(weaver.id);
    expect(run.combat!.cards.filter((card) => card.ownerId === weaver.id && card.zone === "hand")).toHaveLength(build1Pack.tuning.handSize + 1);
  });

  it("SIM-AFFIX-04 guard_self_block grants 2 Block when creating Guard", () => {
    let snapshot = startAffixCombat("kite_shield", ["last_watch"], { slot: "offHand" });
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hold = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "hold_the_line")!;
    hold.zone = "hand";
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: hold.cardInstanceId, targetId: weaver.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.guards).toHaveLength(1);
    // Hold the Line: 4 self Block + 2 from guard_self_block
    expect(totalBlockForFixture(snapshot, vanguard.id)).toBe(6);
  });

  it("SIM-AFFIX-05 exposed_damage_plus_2 adds +2 damage vs Exposed on vessel attack", () => {
    let snapshot = startAffixCombat("hewn_sword", ["houndmarked"]);
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const ironCut = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    ironCut.zone = "hand";
    const target = run.combat!.combatants.find((entry) => entry.side === "enemies")!;
    target.conditions = [{ id: "exposed", expiresAfterCompletedTurn: 99 }];
    const hpBefore = target.hp;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: ironCut.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack) as MutableSnapshot;
    const after = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === target.id)!;
    // iron_cut 5 + str 4 = 9, exposed ×1.25 → 11; with +2 before multiply: (5+4+2)*1.25 = 13.75 → 13
    expect(hpBefore - after.hp).toBe(13);
  });

  it("SIM-AFFIX-06 frayed / hollow / overdrawn apply via selfDamage / exhaust / secondaryCostDelta", () => {
    const frayed = startAffixCombat("hewn_sword", ["frayed"]);
    const frayedCard = frayed.activeRun!.combat!.cards.find((card) => card.definitionId === "iron_cut" && card.sourceId.includes("frayed"))!;
    expect(frayedCard.selfDamage).toBe(1);

    const hollow = startAffixCombat("hewn_sword", ["hollow"]);
    const hollowCard = hollow.activeRun!.combat!.cards.find((card) => card.definitionId === "iron_cut" && card.sourceId.includes("hollow"))!;
    expect(hollowCard.exhaust).toBe(true);
    hollowCard.zone = "hand";
    const hollowHero = hollow.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!;
    const hollowTarget = hollow.activeRun!.combat!.combatants.find((entry) => entry.side === "enemies")!;
    setActiveHero(hollow, hollowHero.id);
    const afterHollow = accept(hollow, command(hollow, "playCard", { cardInstanceId: hollowCard.cardInstanceId, targetId: hollowTarget.id }, hollowHero.id), build1Pack) as MutableSnapshot;
    expect(afterHollow.activeRun!.combat!.cards.find((card) => card.cardInstanceId === hollowCard.cardInstanceId)?.zone).toBe("exhaust");

    const overdrawn = startAffixCombat("hewn_sword", ["overdrawn"]);
    const overdrawnCard = overdrawn.activeRun!.combat!.cards.find((card) => card.definitionId === "iron_cut" && card.sourceId.includes("overdrawn"))!;
    expect(overdrawnCard.costDelta).toBe(1);
    expect(overdrawnCard.presentation.staminaCost).toBe(3);
  });

  it("SIM-AFFIX-07 spell_damage_plus_1 and card_block_plus_2 flow via damageDelta / blockDelta", () => {
    const spell = startAffixCombat("aether_rod", ["conduit"], { heroClass: "aether_weaver", slot: "mainHand" });
    const lash = spell.activeRun!.combat!.cards.find((card) => card.definitionId === "aether_lash")!;
    expect(lash.damageDelta).toBe(1);

    let blockSnap = startAffixCombat("kite_shield", ["warded"], { slot: "offHand" });
    const vanguard = blockSnap.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!;
    const brace = blockSnap.activeRun!.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "brace")!;
    expect(brace.blockDelta).toBe(2);
    brace.zone = "hand";
    setActiveHero(blockSnap, vanguard.id);
    blockSnap = accept(blockSnap, command(blockSnap, "playCard", { cardInstanceId: brace.cardInstanceId }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(totalBlockForFixture(blockSnap, vanguard.id)).toBe(12);
  });

  it("SIM-AFFIX-08 first_block_plus_2 currently always applies via blockDelta (honest simplification)", () => {
    const snapshot = startAffixCombat("kite_shield", ["lumenforged"], { slot: "offHand" });
    const brace = snapshot.activeRun!.combat!.cards.find((card) => card.definitionId === "brace")!;
    expect(brace.blockDelta).toBe(2);
  });
});
