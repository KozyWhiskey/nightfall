import { describe, expect, it } from "vitest";
import { build1Pack } from "@nightfall/content";
import type { EquipmentSlot } from "@nightfall/contracts";
import { cloneSnapshot, createContext, createItemInstance, deriveHeroPools, startCombat, totalBlockForFixture, type ForcedStreams, type MutableSnapshot } from "@nightfall/sim";
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

  it("SIM-AFFIX-08 first_block_plus_2 always applies via blockDelta; display omits false first claim", () => {
    const snapshot = startAffixCombat("kite_shield", ["lumenforged"], { slot: "offHand" });
    const brace = snapshot.activeRun!.combat!.cards.find((card) => card.definitionId === "brace")!;
    expect(brace.blockDelta).toBe(2);
    const item = snapshot.activeRun!.holdings.find((entry) => entry.instanceId === brace.sourceId)!;
    expect(item.displaySnapshot.description).toContain("+2 Block on the granted card");
    expect(item.displaySnapshot.description.toLowerCase()).not.toContain("first block");
  });

  it("SIM-AFFIX-09 first_burn_plus_1 adds +1 stack on the first vessel Burn each combat", () => {
    let snapshot = startAffixCombat("hewn_sword", ["cinderbound", "cinders"]);
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const ironCut = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    ironCut.zone = "hand";
    const target = run.combat!.combatants.find((entry) => entry.side === "enemies")!;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: ironCut.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === target.id)!.burn).toHaveLength(2);
    expect(snapshot.activeRun!.flags.some((flag) => flag.startsWith("first_burn_plus_1_used:"))).toBe(true);

    const second = snapshot.activeRun!.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    second.zone = "hand";
    const resources = snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!;
    resources.ap = 3;
    resources.stamina = 6;
    const other = snapshot.activeRun!.combat!.combatants.find((entry) => entry.side === "enemies" && entry.id !== target.id)!;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: second.cardInstanceId, targetId: other.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === other.id)!.burn).toHaveLength(1);
  });

  it("SIM-AFFIX-10 first_burn_plus_1 also boosts applyCondition Burn on vessel spells", () => {
    let snapshot = startAffixCombat("cinder_scepter", ["cinders"], { heroClass: "aether_weaver", slot: "mainHand" });
    const run = snapshot.activeRun!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const lance = run.combat!.cards.find((card) => card.ownerId === weaver.id && card.definitionId === "ember_lance")!;
    lance.zone = "hand";
    const target = run.combat!.combatants.find((entry) => entry.side === "enemies")!;
    setActiveHero(snapshot, weaver.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: lance.cardInstanceId, targetId: target.id }, weaver.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === target.id)!.burn).toHaveLength(2);
  });

  it("SIM-AFFIX-11 exposed_resource_discount reduces secondary cost once vs Exposed", () => {
    let snapshot = startAffixCombat("hewn_sword", ["hound"]);
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const ironCut = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    ironCut.zone = "hand";
    const target = run.combat!.combatants.find((entry) => entry.side === "enemies")!;
    target.conditions = [{ id: "exposed", expiresAfterCompletedTurn: 99 }];
    setActiveHero(snapshot, vanguard.id);
    const staminaBefore = run.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina;
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: ironCut.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack) as MutableSnapshot;
    // iron_cut stamina 2 − 1 discount = 1
    expect(staminaBefore - snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina).toBe(1);
    expect(snapshot.activeRun!.flags.some((flag) => flag.startsWith("exposed_resource_discount_used:"))).toBe(true);

    const second = snapshot.activeRun!.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    second.zone = "hand";
    const resources = snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!;
    resources.ap = 3;
    resources.stamina = 6;
    const other = snapshot.activeRun!.combat!.combatants.find((entry) => entry.side === "enemies" && entry.id !== target.id)!;
    other.conditions = [{ id: "exposed", expiresAfterCompletedTurn: 99 }];
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: second.cardInstanceId, targetId: other.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(6 - snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina).toBe(2);
  });

  it("SIM-AFFIX-12 retained_resource_discount reduces secondary cost on first retained vessel card", () => {
    let snapshot = startAffixCombat("hewn_sword", ["long_vigil"]);
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const ironCut = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    ironCut.retain = true;
    ironCut.zone = "hand";
    const target = run.combat!.combatants.find((entry) => entry.side === "enemies")!;
    setActiveHero(snapshot, vanguard.id);
    const staminaBefore = run.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina;
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: ironCut.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(staminaBefore - snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina).toBe(1);
    expect(snapshot.activeRun!.flags.some((flag) => flag.startsWith("retained_resource_discount_used:"))).toBe(true);

    const second = snapshot.activeRun!.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "iron_cut")!;
    second.retain = true;
    second.zone = "hand";
    const resources = snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!;
    resources.ap = 3;
    resources.stamina = 6;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: second.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(6 - snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina).toBe(2);
  });

  it("SIM-AFFIX-SIG-01 vigils_promise Guard grants the protected ally 2 Block", () => {
    let snapshot = startAffixCombat("kite_shield", ["vigils_promise"], { slot: "offHand" });
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hold = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "hold_the_line")!;
    hold.zone = "hand";
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: hold.cardInstanceId, targetId: weaver.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.guards).toHaveLength(1);
    expect(totalBlockForFixture(snapshot, vanguard.id)).toBe(4);
    expect(totalBlockForFixture(snapshot, weaver.id)).toBe(2);
  });

  it("SIM-AFFIX-SIG-02 cinder_scar reduces Burned enemy calculated damage by 1", () => {
    let snapshot = startAffixCombat("aether_rod", ["cinder_scar"], {
      heroClass: "aether_weaver",
      slot: "mainHand",
      forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] }
    });
    const run = snapshot.activeRun!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const combat = run.combat!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const hound = hounds[0]!;
    hound.burn = [{ remainingOwnerTurns: 2 }];
    const intent = combat.intents.find((entry) => entry.enemyId === hound.id)!;
    intent.intentId = "lunge";
    intent.label = "Lunge";
    intent.magnitude = 5;
    // Stop after one enemy turn on the next living hero.
    combat.timeline = [weaver.id, hound.id, vanguard.id, hounds[1]!.id];
    setActiveHero(snapshot, weaver.id);
    const target = combat.combatants.filter((entry) => entry.side === "heroes").sort((left, right) => left.hp - right.hp || left.id.localeCompare(right.id))[0]!;
    const hpBefore = target.hp;
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, weaver.id), build1Pack, { combatIntent: [0] }) as MutableSnapshot;
    const after = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === target.id)!;
    expect(hpBefore - after.hp).toBe(4);
  });

  it("SIM-AFFIX-SIG-03 hounds_pursuit draws once the first time an enemy becomes Exposed", () => {
    let snapshot = startAffixCombat("gloomwood_spear", ["hounds_pursuit"]);
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const thrust = run.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "piercing_thrust")!;
    thrust.zone = "hand";
    const enemies = run.combat!.combatants.filter((entry) => entry.side === "enemies");
    const handBefore = run.combat!.cards.filter((card) => card.ownerId === vanguard.id && card.zone === "hand").length;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: thrust.cardInstanceId, targetId: enemies[0]!.id }, vanguard.id), build1Pack) as MutableSnapshot;
    const handAfterFirst = snapshot.activeRun!.combat!.cards.filter((card) => card.ownerId === vanguard.id && card.zone === "hand").length;
    // Play consumes 1; exposed_draw returns 1 → net unchanged.
    expect(handAfterFirst).toBe(handBefore);
    expect(snapshot.activeRun!.flags.some((flag) => flag.startsWith("hounds_pursuit_used:"))).toBe(true);

    const secondThrust = snapshot.activeRun!.combat!.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "piercing_thrust")!;
    secondThrust.zone = "hand";
    const resources = snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!;
    resources.ap = 3;
    resources.stamina = 6;
    const handMid = snapshot.activeRun!.combat!.cards.filter((card) => card.ownerId === vanguard.id && card.zone === "hand").length;
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: secondThrust.cardInstanceId, targetId: enemies[1]!.id }, vanguard.id), build1Pack) as MutableSnapshot;
    const handFinal = snapshot.activeRun!.combat!.cards.filter((card) => card.ownerId === vanguard.id && card.zone === "hand").length;
    expect(handFinal).toBe(handMid - 1);
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === enemies[1]!.id)!.conditions.some((entry) => entry.id === "exposed")).toBe(true);
  });

  it("SIM-AFFIX-SIG-04 ashen_names grants 4 Block to living allies when a hero is Downed", () => {
    let snapshot = startAffixCombat("hewn_sword", ["ashen_names"], {
      heroClass: "aether_weaver",
      slot: "mainHand",
      forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] }
    });
    const run = snapshot.activeRun!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const combat = run.combat!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const hound = hounds[0]!;
    combat.combatants.find((entry) => entry.id === vanguard.id)!.hp = 1;
    const intent = combat.intents.find((entry) => entry.enemyId === hound.id)!;
    intent.intentId = "lunge";
    intent.label = "Lunge";
    intent.magnitude = 5;
    // After the hound acts, stop on vanguard's turn start (before weaver's Block would expire).
    combat.timeline = [weaver.id, hound.id, vanguard.id, hounds[1]!.id];
    setActiveHero(snapshot, weaver.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, weaver.id), build1Pack, { combatIntent: [0] }) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === vanguard.id)!.downed).toBe(true);
    // Owner's next turn start expires ownerNextTurn Block; assert via fact + layers if still present,
    // or via the passive fact when advanceUntilHero already opened the owner's turn.
    const ashenFact = snapshot.latestFacts.find((fact) => fact.kind === "item_passive" && String(fact.message).includes("Ashen Names"));
    expect(ashenFact).toBeDefined();
    expect(ashenFact!.data.amount).toBe(4);
    expect(ashenFact!.data.heroId).toBe(weaver.id);
  });

  it("SIM-AFFIX-SIG-05 deepdrawn adds maxMana on spell vessels and maxStamina otherwise", () => {
    const spellVessel = createItemInstance(build1Pack, "aether_rod", "imbued", 1, "deepdrawn_spell", { kind: "held_by_expedition", runId: "run" }, ["deepdrawn"]);
    expect(spellVessel.mechanicSnapshot.maxManaDelta).toBe(1);
    expect(spellVessel.mechanicSnapshot.maxStaminaDelta ?? 0).toBe(0);

    const physicalVessel = createItemInstance(build1Pack, "hewn_sword", "imbued", 1, "deepdrawn_phys", { kind: "held_by_expedition", runId: "run" }, ["deepdrawn"]);
    expect(physicalVessel.mechanicSnapshot.maxStaminaDelta).toBe(1);
    expect(physicalVessel.mechanicSnapshot.maxManaDelta ?? 0).toBe(0);

    const armor = createItemInstance(build1Pack, "kite_shield", "imbued", 1, "deepdrawn_armor", { kind: "held_by_expedition", runId: "run" }, ["deepdrawn"]);
    expect(armor.mechanicSnapshot.maxStaminaDelta).toBe(1);

    const weaverClass = build1Pack.classes.find((entry) => entry.id === "aether_weaver")!;
    const base = deriveHeroPools(weaverClass, weaverClass.attributes, []);
    const withSpell = deriveHeroPools(weaverClass, weaverClass.attributes, [spellVessel]);
    expect(withSpell.maxMana).toBe(base.maxMana + 1);
    expect(withSpell.maxStamina).toBe(base.maxStamina);
  });

  it("SIM-AFFIX-SIG-06 waystation reduces the first Event Run Gloom increase by 5", () => {
    const embarked = createEmbarkedSnapshot(build1Pack);
    const snapshot = cloneSnapshot(embarked);
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const previousId = vanguard.equipment.offHand;
    if (previousId !== null) {
      const previous = run.holdings.find((entry) => entry.instanceId === previousId);
      if (previous !== undefined) previous.location = { kind: "held_by_expedition", runId: run.runId };
    }
    const item = createItemInstance(
      build1Pack,
      "kite_shield",
      "imbued",
      7,
      "waystation_test",
      { kind: "equipped", heroId: vanguard.id, slotId: "offHand" },
      ["waystation"]
    );
    run.holdings.push(item as never);
    vanguard.equipment.offHand = item.instanceId;
    run.currentNodeId = "early_event";
    const node = run.nodes.find((entry) => entry.id === "early_event")!;
    node.contentId = "last_courier";
    node.state = "entered";
    const event = build1Pack.events.find((entry) => entry.id === "last_courier")!;
    run.phase = "event";
    run.pendingDecision = {
      kind: "event",
      eventId: "last_courier",
      optionIds: [...event.optionIds],
      choices: event.options.map((option) => ({ id: option.id, label: option.label, detail: "fixture" }))
    };
    run.runGloom = 20;
    const after = accept(snapshot, command(snapshot, "chooseEventOption", { optionId: "ledger" }), build1Pack) as MutableSnapshot;
    // ledger is +8, waystation reduces by 5 → +3
    expect(after.activeRun!.runGloom).toBe(23);
    expect(after.activeRun!.flags).toContain("waystation_used");

    // Second positive Event Gloom is not reduced.
    const second = cloneSnapshot(after);
    second.activeRun!.currentNodeId = "deep_event";
    const deep = second.activeRun!.nodes.find((entry) => entry.id === "deep_event")!;
    deep.contentId = "cache_ember_pit";
    deep.state = "entered";
    const pit = build1Pack.events.find((entry) => entry.id === "cache_ember_pit")!;
    second.activeRun!.phase = "event";
    second.activeRun!.pendingDecision = {
      kind: "event",
      eventId: "cache_ember_pit",
      optionIds: [...pit.optionIds],
      choices: pit.options.map((option) => ({ id: option.id, label: option.label, detail: "fixture" }))
    };
    const gloomBefore = second.activeRun!.runGloom;
    const afterSecond = accept(second, command(second, "chooseEventOption", { optionId: "haul" }), build1Pack) as MutableSnapshot;
    expect(afterSecond.activeRun!.runGloom).toBe(gloomBefore + 5);
  });
});
