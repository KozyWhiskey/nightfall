import { describe, expect, it } from "vitest";
import type { EquipmentSlot } from "@nightfall/contracts";
import { build1Pack } from "@nightfall/content";
import { applyCommand, cloneSnapshot, createContext, createInitialSnapshot, createItemInstance, finishCombatIfNeeded, intentEffectSummary, refillForFixture, reviveForFixture, startCombat, totalBlockForFixture, type MutableSnapshot } from "@nightfall/sim";
import { accept, command, createEmbarkedSnapshot, engageFixtureCombat, startFixtureCombat } from "./index.js";

function setActiveHero(snapshot: MutableSnapshot, heroId: string): void {
  const combat = snapshot.activeRun?.combat;
  if (combat === undefined) throw new Error("Expected combat");
  const index = combat.timeline.indexOf(heroId);
  combat.timelineCursor = index >= 0 ? index : 0;
  combat.activeCombatantId = heroId;
  const resources = combat.heroResources.find((entry) => entry.heroId === heroId);
  if (resources !== undefined) resources.ap = 3;
}

function equipVessel(snapshot: MutableSnapshot, heroId: string, definitionId: string, slot: EquipmentSlot): void {
  const run = snapshot.activeRun;
  if (run === undefined) throw new Error("Expected run");
  const hero = run.heroes.find((entry) => entry.id === heroId);
  if (hero === undefined) throw new Error(`Missing hero ${heroId}`);
  const existingId = hero.equipment[slot];
  if (existingId !== null) {
    const existing = run.holdings.find((item) => item.instanceId === existingId);
    if (existing !== undefined) existing.location = { kind: "held_by_expedition", runId: run.runId };
    hero.equipment[slot] = null;
  }
  const item = createItemInstance(build1Pack, definitionId, "salvaged", 1, `fixture:${definitionId}`, { kind: "equipped", heroId, slotId: slot });
  hero.equipment[slot] = item.instanceId;
  run.holdings.push(item as never);
}

function startCombatWithVessel(heroClass: "vanguard" | "aether_weaver", definitionId: string, slot: EquipmentSlot, extraLearned: readonly string[] = []): MutableSnapshot {
  const embarked = createEmbarkedSnapshot(build1Pack, 12345);
  const snapshot = cloneSnapshot(embarked);
  if (snapshot.activeRun === undefined) throw new Error("Fixture failed to embark");
  const hero = snapshot.activeRun.heroes.find((entry) => entry.classId === heroClass)!;
  if (extraLearned.length > 0) hero.learnedCardIds = [...hero.learnedCardIds, ...extraLearned];
  equipVessel(snapshot, hero.id, definitionId, slot);
  snapshot.activeRun.phase = "combat";
  const context = createContext({ combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] });
  startCombat(snapshot, build1Pack, "roadside_trail", context);
  engageFixtureCombat(snapshot, build1Pack, context);
  return snapshot;
}

const roadsideStreams = { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0, 0, 0, 0, 0, 0, 0] } as const;
const whisperStreams = { combatInitiative: [0.9, 0.9, 0, 0, 0], combatIntent: [0, 0, 0, 0, 0, 0, 0, 0] } as const;

function startCombatWithLearned(heroClass: "vanguard" | "aether_weaver", extraLearned: readonly string[]): MutableSnapshot {
  const embarked = createEmbarkedSnapshot(build1Pack, 12345);
  const snapshot = cloneSnapshot(embarked);
  if (snapshot.activeRun === undefined) throw new Error("Fixture failed to embark");
  const hero = snapshot.activeRun.heroes.find((entry) => entry.classId === heroClass)!;
  hero.learnedCardIds = [...hero.learnedCardIds, ...extraLearned];
  snapshot.activeRun.phase = "combat";
  const context = createContext(roadsideStreams);
  startCombat(snapshot, build1Pack, "roadside_trail", context);
  engageFixtureCombat(snapshot, build1Pack, context);
  return snapshot;
}

function putInHand(snapshot: MutableSnapshot, ownerId: string, definitionId: string) {
  const card = snapshot.activeRun!.combat!.cards.find((entry) => entry.ownerId === ownerId && entry.definitionId === definitionId)!;
  card.zone = "hand";
  return card;
}

function endUntilActor(snapshot: MutableSnapshot, actorId: string): MutableSnapshot {
  let next = snapshot;
  for (let attempts = 0; attempts < 12 && next.activeRun!.combat!.activeCombatantId !== actorId; attempts += 1) {
    const currentId = next.activeRun!.combat!.activeCombatantId;
    next = accept(next, command(next, "endTurn", {}, currentId), build1Pack, roadsideStreams) as MutableSnapshot;
  }
  return next;
}

function endUntilCompleted(snapshot: MutableSnapshot, combatantId: string, completed: number): MutableSnapshot {
  let next = snapshot;
  for (let attempts = 0; attempts < 12 && next.activeRun!.combat!.combatants.find((entry) => entry.id === combatantId)!.turnsCompleted < completed; attempts += 1) {
    const currentId = next.activeRun!.combat!.activeCombatantId;
    next = accept(next, command(next, "endTurn", {}, currentId), build1Pack, roadsideStreams) as MutableSnapshot;
  }
  return next;
}

function restThenCombat(options: {
  runGloom: number;
  optionId: "keep_watch" | "resupply" | "tend_wounds";
  flags?: readonly string[];
  weaverInjuries?: readonly string[];
  vanguardInjuries?: readonly string[];
  forcedStreams?: { combatInitiative: readonly number[]; combatIntent: readonly number[]; combatTarget?: readonly number[] };
}): MutableSnapshot {
  const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack, 12345));
  const run = snapshot.activeRun!;
  const restNode = run.nodes.find((entry) => entry.id === "rest");
  if (restNode === undefined) throw new Error("Expected rest node");
  restNode.state = "entered";
  run.currentNodeId = "rest";
  run.phase = "rest";
  run.runGloom = options.runGloom;
  if (options.flags !== undefined && options.flags.length > 0) run.flags = [...run.flags, ...options.flags];
  const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
  const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
  if (options.weaverInjuries !== undefined) weaver.injuries = [...options.weaverInjuries];
  if (options.vanguardInjuries !== undefined) vanguard.injuries = [...options.vanguardInjuries];
  run.pendingDecision = {
    kind: "rest",
    baseGloomReduction: 12,
    modifier: 0,
    optionIds: ["tend_wounds", "resupply", "keep_watch"],
    choices: [
      { id: "keep_watch", label: "Keep Watch", detail: "Remove one temporary injury or Strain from one hero; both heroes start the next combat with 3 Block.", needsHeroTarget: true }
    ]
  };
  snapshot.view = "rest";
  const afterRest = accept(snapshot, command(snapshot, "chooseRestOption", { optionId: options.optionId, heroId: weaver.id }), build1Pack) as MutableSnapshot;
  afterRest.activeRun!.phase = "combat";
  const streams = options.forcedStreams ?? roadsideStreams;
  const context = createContext(streams);
  startCombat(afterRest, build1Pack, "roadside_trail", context);
  return afterRest;
}

function keepWatchThenCombat(options: {
  runGloom: number;
  flags?: readonly string[];
  weaverInjuries?: readonly string[];
  vanguardInjuries?: readonly string[];
  forcedStreams?: { combatInitiative: readonly number[]; combatIntent: readonly number[]; combatTarget?: readonly number[] };
}): MutableSnapshot {
  return restThenCombat({ ...options, optionId: "keep_watch" });
}

describe("Build 1 combat acceptance", () => {

  it("SIM-01 resolves the two-Hound opening, Basics, recovery, and Combat 1 reward", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] } });
    const run = snapshot.activeRun!; const combat = run.combat!;
    expect(combat.timeline).toHaveLength(4);
    expect(combat.intents).toHaveLength(2);
    expect(build1Pack.cards.filter((entry) => entry.alwaysAvailable).map((entry) => entry.id)).toContain("vanguard_basic_attack");
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    vanguard.mana = 0; vanguard.stamina = 0;
    const combatResource = combat.heroResources.find((entry) => entry.heroId === vanguard.id)!; combatResource.mana = 0; combatResource.stamina = 0;
    const enemies = combat.combatants.filter((entry) => entry.side === "enemies"); enemies.forEach((enemy) => { enemy.hp = 1; });
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "useBasicAttack", { targetId: enemies[0]!.id }, vanguard.id), build1Pack) as MutableSnapshot;
    snapshot = accept(snapshot, command(snapshot, "useBasicAttack", { targetId: enemies[1]!.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun?.phase).toBe("reward");
    expect(snapshot.activeRun?.materials).toMatchObject({ salvage: 2, emberglass: 1, timber: 1, stone: 1, rations: 1 });
    const recovered = snapshot.activeRun!.heroes.find((hero) => hero.id === vanguard.id)!;
    expect(recovered.mana).toBe(Math.ceil(recovered.maxMana * 0.5));
    expect(recovered.stamina).toBe(Math.ceil(recovered.maxStamina * 0.5));
  });

  it("SIM-02 keeps late Vanguard defense readable and Guard redirects only targeted damage until next turn", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] } });
    const run = snapshot.activeRun!; const combat = run.combat!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hold = combat.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "hold_the_line")!;
    combat.cards.filter((card) => card.ownerId === vanguard.id).forEach((card) => { card.zone = card === hold ? "hand" : "draw"; });
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    combat.timeline = [vanguard.id, hounds[0]!.id, weaver.id, hounds[1]!.id];
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: hold.cardInstanceId, targetId: weaver.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.guards).toHaveLength(1);
    const beforeVanguard = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === vanguard.id)!.hp;
    const beforeWeaver = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === weaver.id)!.hp;
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, vanguard.id), build1Pack, { combatIntent: [0] }) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === vanguard.id)!.hp).toBeLessThan(beforeVanguard);
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === weaver.id)!.hp).toBe(beforeWeaver);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, weaver.id), build1Pack, { combatIntent: [0] }) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.guards).toHaveLength(0);
  });

  it("SIM-03 preserves explicit zones, Exhaust, reshuffle, and Retain refill behavior", () => {
    const snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0] } });
    const combat = snapshot.activeRun!.combat!; const heroId = snapshot.activeRun!.heroes[0]!.id; const cards = combat.cards.filter((entry) => entry.ownerId === heroId);
    cards.forEach((card, index) => { card.zone = index === 0 ? "hand" : index === 1 ? "exhaust" : "discard"; card.retain = index === 0; });
    const retainedId = cards[0]!.cardInstanceId; const exhaustedId = cards[1]!.cardInstanceId;
    refillForFixture(snapshot, heroId, build1Pack, createContext({ combatDeck: [0] }));
    expect(combat.cards.find((entry) => entry.cardInstanceId === retainedId)?.zone).toBe("hand");
    expect(combat.cards.find((entry) => entry.cardInstanceId === exhaustedId)?.zone).toBe("exhaust");
    expect(combat.cards.filter((entry) => entry.ownerId === heroId && entry.zone === "hand")).toHaveLength(3);
  });

  it("SIM-04 resolves Gloom Block duration, conditions, downing, and explicit revival", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { runGloom: 50, forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] } });
    const enemies = snapshot.activeRun!.combat!.combatants.filter((entry) => entry.side === "enemies");
    expect(enemies.every((enemy) => totalBlockForFixture(snapshot, enemy.id) === 3)).toBe(true);
    snapshot.activeRun!.combat!.combatants.filter((entry) => entry.side === "heroes").forEach((hero) => { hero.maxHp = 999; hero.hp = 999; });
    for (let index = 0; index < 6 && enemies.some((enemy) => totalBlockForFixture(snapshot, enemy.id) > 0); index += 1) {
      const actorId = snapshot.activeRun!.combat!.activeCombatantId;
      snapshot = accept(snapshot, command(snapshot, "endTurn", {}, actorId), build1Pack, { combatIntent: [0] }) as MutableSnapshot;
    }
    expect(enemies.map((enemy) => totalBlockForFixture(snapshot, enemy.id))).toEqual([0, 0]);

    const conditionState = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0] } });
    const vanguard = conditionState.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!; const target = conditionState.activeRun!.combat!.combatants.find((entry) => entry.side === "enemies")!;
    const shieldBash = conditionState.activeRun!.combat!.cards.find((entry) => entry.ownerId === vanguard.id && entry.definitionId === "shield_bash")!; shieldBash.zone = "hand"; setActiveHero(conditionState, vanguard.id);
    const result = applyCommand(conditionState, command(conditionState, "playCard", { cardInstanceId: shieldBash.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack);
    expect(result.status).toBe("accepted");
    if (result.status === "accepted") expect(result.snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === target.id)!.conditions.some((entry) => entry.id === "weakened")).toBe(true);
    const mutable = cloneSnapshot(result.status === "accepted" ? result.snapshot : conditionState);
    const downed = mutable.activeRun!.combat!.combatants.find((entry) => entry.side === "heroes" && entry.id !== vanguard.id)!; downed.hp = 0; downed.downed = true;
    reviveForFixture(mutable, downed.id, 5);
    expect(downed.downed).toBe(false); expect(downed.hp).toBe(5);
  });

  it("SIM-05 filters a useless tactical buff and keeps the seeded revealed intent stable", () => {
    let snapshot = startFixtureCombat(build1Pack, "whisperwood_threshold", { forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0, 0], combatIntent: [0, 0, 0] } });
    const combat = snapshot.activeRun!.combat!; const hero = combat.combatants.find((entry) => entry.side === "heroes")!; const chanter = combat.combatants.find((entry) => entry.definitionId === "mist_chanter")!;
    combat.combatants.filter((entry) => entry.side === "enemies").forEach((entry) => { entry.blockLayers = [{ id: `${entry.id}:test`, sourceId: "test", amount: 8, createdAtRevision: snapshot.revision, expiresAtOwnerTurnStart: 99, special: "normal" }]; });
    const revealed = combat.intents.find((entry) => entry.enemyId === chanter.id)!; revealed.intentId = "lament"; revealed.label = "Lament"; revealed.magnitude = 3;
    combat.timeline = [hero.id, chanter.id, ...combat.timeline.filter((id) => id !== hero.id && id !== chanter.id)]; setActiveHero(snapshot, hero.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, hero.id), build1Pack, { combatIntent: [0] }) as MutableSnapshot;
    const next = snapshot.activeRun!.combat!.intents.find((entry) => entry.enemyId === chanter.id)!;
    expect(next.intentId).toBe("borrowed_fury");
    expect(next.revealedAtRevision).toBe(snapshot.revision - 1);
  });

  it("SIM-06 gives a marked carrier the exact pre-generated item and drops that instance once", () => {
    // loot: pass carrier chance → pick carrier → pick base → Imbued prefix branch → Quickened among compatible prefixes
    const snapshot = startFixtureCombat(build1Pack, "stalking_choir", {
      forcedStreams: { loot: [0, 0, 0, 0.1, 0.2], combatInitiative: [0.9, 0.9, 0, 0, 0] }
    });
    const run = snapshot.activeRun!; const carrierItem = run.holdings.find((item) => item.location.kind === "carried_by_enemy")!;
    expect(carrierItem).toBeDefined();
    expect(carrierItem.rarityId).toBe("imbued");
    expect(carrierItem.prefixIds).toContain("quickened");
    const carrier = run.combat!.combatants.find((entry) => entry.carriedItemId === carrierItem.instanceId)!;
    expect(carrier.itemInitiative).toBe(1);
    run.combat!.combatants.filter((entry) => entry.side === "enemies" && entry.kind === "enemy").forEach((entry) => { entry.destroyed = true; entry.hp = 0; });
    run.combat!.outcome = "victory";
    finishCombatIfNeeded(snapshot, build1Pack, createContext());
    const matches = run.holdings.filter((item) => item.instanceId === carrierItem.instanceId);
    expect(matches).toHaveLength(1);
    expect(matches[0]!.location.kind).toBe("held_by_expedition");
  });

  it("SIM-C01 skips a stunned combatant's next complete turn and does not stack Stun", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] } });
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const weaverCombatant = combat.combatants.find((entry) => entry.id === weaver.id)!;
    combat.timeline = [vanguard.id, weaver.id, hounds[0]!.id, hounds[1]!.id];
    weaverCombatant.conditions = [{ id: "stun", expiresAfterCompletedTurn: 99 }, { id: "stun", expiresAfterCompletedTurn: 99 }];
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, vanguard.id), build1Pack, { combatIntent: [0, 0] }) as MutableSnapshot;
    const after = snapshot.activeRun!.combat!;
    const weaverAfter = after.combatants.find((entry) => entry.id === weaver.id)!;
    expect(weaverAfter.conditions.some((entry) => entry.id === "stun")).toBe(false);
    expect(after.activeCombatantId).toBe(vanguard.id);
  });

  it("SIM-C02 playCard does not advance timelineCursor or activeCombatantId; endTurn does", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", {
      forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] }
    });
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const hold = combat.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "hold_the_line")!;
    combat.cards.filter((card) => card.ownerId === vanguard.id).forEach((card) => {
      card.zone = card === hold ? "hand" : "draw";
    });
    combat.timeline = [vanguard.id, hounds[0]!.id, hounds[1]!.id, weaver.id];
    setActiveHero(snapshot, vanguard.id);
    const beforeCursor = snapshot.activeRun!.combat!.timelineCursor;
    const beforeActive = snapshot.activeRun!.combat!.activeCombatantId;
    const beforeRound = snapshot.activeRun!.combat!.round;

    snapshot = accept(
      snapshot,
      command(snapshot, "playCard", { cardInstanceId: hold.cardInstanceId, targetId: weaver.id }, vanguard.id),
      build1Pack
    ) as MutableSnapshot;
    const mid = snapshot.activeRun!.combat!;
    expect(mid.timelineCursor).toBe(beforeCursor);
    expect(mid.activeCombatantId).toBe(beforeActive);
    expect(mid.round).toBe(beforeRound);

    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, vanguard.id), build1Pack, {
      combatIntent: [0, 0]
    }) as MutableSnapshot;
    const after = snapshot.activeRun!.combat!;
    expect(after.activeCombatantId).toBe(weaver.id);
    expect(after.timelineCursor).not.toBe(beforeCursor);
  });

  it("SIM-C03 keeps Strain −1 AP on every turn until combat ends", () => {
    const intentPad = { combatIntent: [0, 0, 0, 0, 0, 0, 0, 0] as const };
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", {
      runGloom: 90,
      forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0], ...intentPad }
    });
    const combat = snapshot.activeRun!.combat!;
    const heroes = combat.combatants.filter((entry) => entry.side === "heroes");
    expect(heroes).toHaveLength(2);
    expect(heroes.every((hero) => hero.conditions.some((entry) => entry.id === "strain"))).toBe(true);
    const firstId = combat.activeCombatantId;
    const first = combat.combatants.find((entry) => entry.id === firstId)!;
    expect(first.side).toBe("heroes");
    expect(combat.heroResources.find((entry) => entry.heroId === firstId)!.ap).toBe(2);

    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, firstId), build1Pack, intentPad) as MutableSnapshot;
    const afterFirst = snapshot.activeRun!.combat!;
    expect(afterFirst.combatants.find((entry) => entry.id === firstId)!.conditions.some((entry) => entry.id === "strain")).toBe(true);
    const midId = afterFirst.activeCombatantId;
    expect(midId).not.toBe(firstId);
    expect(afterFirst.combatants.find((entry) => entry.id === midId)!.side).toBe("heroes");
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, midId), build1Pack, intentPad) as MutableSnapshot;

    const second = snapshot.activeRun!.combat!;
    expect(second.activeCombatantId).toBe(firstId);
    expect(second.combatants.find((entry) => entry.id === firstId)!.conditions.some((entry) => entry.id === "strain")).toBe(true);
    expect(second.heroResources.find((entry) => entry.heroId === firstId)!.ap).toBe(2);
  });

  it("SIM-C04 Archivist's Focus draws one extra card at combat start", () => {
    let snapshot = startCombatWithVessel("aether_weaver", "archivists_focus", "offHand", ["aether_needle"]);
    const weaver = snapshot.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    expect(snapshot.activeRun!.combat!.activeCombatantId).toBe(weaver.id);
    expect(snapshot.activeRun!.combat!.cards.filter((card) => card.ownerId === weaver.id && card.zone === "hand")).toHaveLength(4);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, weaver.id), build1Pack, { combatIntent: [0, 0] }) as MutableSnapshot;
    for (let attempts = 0; attempts < 8 && snapshot.activeRun!.combat!.activeCombatantId !== weaver.id; attempts += 1) {
      const actorId = snapshot.activeRun!.combat!.activeCombatantId;
      snapshot = accept(snapshot, command(snapshot, "endTurn", {}, actorId), build1Pack, { combatIntent: [0, 0] }) as MutableSnapshot;
    }
    expect(snapshot.activeRun!.combat!.activeCombatantId).toBe(weaver.id);
    expect(snapshot.activeRun!.combat!.cards.filter((card) => card.ownerId === weaver.id && card.zone === "hand")).toHaveLength(3);
  });

  it("SIM-C05 Cracked Way-Lens adds +1 to spell card damage", () => {
    let snapshot = startCombatWithVessel("aether_weaver", "cracked_way_lens", "relic1");
    const weaver = snapshot.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const combat = snapshot.activeRun!.combat!;
    const bolt = combat.cards.find((card) => card.ownerId === weaver.id && card.definitionId === "aether_bolt")!;
    bolt.zone = "hand";
    const [spellTarget, basicTarget] = combat.combatants.filter((entry) => entry.side === "enemies");
    spellTarget!.blockLayers = [];
    basicTarget!.blockLayers = [];
    const spellBefore = spellTarget!.hp;
    const basicBefore = basicTarget!.hp;
    setActiveHero(snapshot, weaver.id);
    snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === weaver.id)!.mana = 10;
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: bolt.cardInstanceId, targetId: spellTarget!.id }, weaver.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === spellTarget!.id)!.hp).toBe(spellBefore - 12);
    snapshot = accept(snapshot, command(snapshot, "useBasicAttack", { targetId: basicTarget!.id }, weaver.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === basicTarget!.id)!.hp).toBe(basicBefore - 3);
  });

  it("SIM-C06 Ironweave Gloves add +1 to basic attack damage", () => {
    let snapshot = startCombatWithVessel("vanguard", "ironweave_gloves", "gloves", ["aether_bolt"]);
    const vanguard = snapshot.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!;
    const combat = snapshot.activeRun!.combat!;
    const bolt = combat.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "aether_bolt")!;
    bolt.zone = "hand";
    const [basicTarget, spellTarget] = combat.combatants.filter((entry) => entry.side === "enemies");
    basicTarget!.blockLayers = [];
    spellTarget!.blockLayers = [];
    const basicBefore = basicTarget!.hp;
    const spellBefore = spellTarget!.hp;
    setActiveHero(snapshot, vanguard.id);
    snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.mana = 10;
    snapshot = accept(snapshot, command(snapshot, "useBasicAttack", { targetId: basicTarget!.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === basicTarget!.id)!.hp).toBe(basicBefore - 6);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: bolt.cardInstanceId, targetId: spellTarget!.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === spellTarget!.id)!.hp).toBe(spellBefore - 8);
  });

  it("SIM-C12 Wayfarer's Coat +3 max HP and Pilgrim's Knot +1 max Stamina apply when equipped", () => {
    const coat = startCombatWithVessel("vanguard", "wayfarers_coat", "body");
    const coatHero = coat.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!;
    const coatCombatant = coat.activeRun!.combat!.combatants.find((entry) => entry.id === coatHero.id)!;
    expect(coatHero.maxHp).toBe(37);
    expect(coatCombatant.maxHp).toBe(37);
    expect(coatCombatant.hp).toBe(34);

    const knot = startCombatWithVessel("aether_weaver", "pilgrims_knot", "relic1");
    const knotHero = knot.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    expect(knotHero.maxStamina).toBe(5);
    expect(knot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === knotHero.id)!.stamina).toBe(4);

    let snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack, 12345));
    const run = snapshot.activeRun!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const item = createItemInstance(build1Pack, "wayfarers_coat", "salvaged", 1, "fixture:live-coat", {
      kind: "held_by_expedition",
      runId: run.runId
    });
    run.holdings.push(item as never);
    snapshot = accept(
      snapshot,
      command(snapshot, "equipItem", { heroId: vanguard.id, itemId: item.instanceId }),
      build1Pack
    ) as MutableSnapshot;
    const equipped = snapshot.activeRun!.heroes.find((hero) => hero.id === vanguard.id)!;
    expect(equipped.maxHp).toBe(37);
    expect(equipped.hp).toBe(34);

    equipped.hp = 37;
    snapshot = accept(
      snapshot,
      command(snapshot, "unequipItem", { heroId: vanguard.id, slotId: "body" }),
      build1Pack
    ) as MutableSnapshot;
    const unequipped = snapshot.activeRun!.heroes.find((hero) => hero.id === vanguard.id)!;
    expect(unequipped.maxHp).toBe(34);
    expect(unequipped.hp).toBe(34);

    const weaver = snapshot.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const knotItem = createItemInstance(build1Pack, "pilgrims_knot", "salvaged", 1, "fixture:live-knot", {
      kind: "held_by_expedition",
      runId: snapshot.activeRun!.runId
    });
    snapshot.activeRun!.holdings.push(knotItem as never);
    snapshot = accept(
      snapshot,
      command(snapshot, "equipItem", { heroId: weaver.id, itemId: knotItem.instanceId }),
      build1Pack
    ) as MutableSnapshot;
    const knotEquipped = snapshot.activeRun!.heroes.find((hero) => hero.id === weaver.id)!;
    expect(knotEquipped.maxStamina).toBe(5);
    expect(knotEquipped.stamina).toBe(4);
    knotEquipped.stamina = 5;
    snapshot = accept(
      snapshot,
      command(snapshot, "unequipItem", { heroId: weaver.id, slotId: "relic1" }),
      build1Pack
    ) as MutableSnapshot;
    const knotUnequipped = snapshot.activeRun!.heroes.find((hero) => hero.id === weaver.id)!;
    expect(knotUnequipped.maxStamina).toBe(4);
    expect(knotUnequipped.stamina).toBe(4);

    let haven = cloneSnapshot(createInitialSnapshot(build1Pack, 12345));
    const havenVanguard = haven.haven.heroes.find((hero) => hero.classId === "vanguard")!;
    const havenCoat = createItemInstance(build1Pack, "wayfarers_coat", "salvaged", 1, "fixture:haven-coat", {
      kind: "haven",
      havenId: haven.haven.id
    });
    haven.haven.holdings.push(havenCoat as never);
    haven = accept(
      haven,
      command(haven, "equipItem", { heroId: havenVanguard.id, itemId: havenCoat.instanceId }),
      build1Pack
    ) as MutableSnapshot;
    const havenEquipped = haven.haven.heroes.find((hero) => hero.id === havenVanguard.id)!;
    expect(havenEquipped.maxHp).toBe(37);
    expect(havenEquipped.hp).toBe(34);
  });

  it("SIM-C08 isolates Exposed apply, expiry, refresh, party start, and Weakened expiry", () => {
    let snapshot = startCombatWithLearned("vanguard", ["piercing_thrust"]);
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const hound = hounds[0]!;
    combat.timeline = [vanguard.id, hound.id, weaver.id, hounds[1]!.id];
    combat.combatants.filter((entry) => entry.side === "heroes").forEach((hero) => { hero.maxHp = 999; hero.hp = 999; });
    hound.blockLayers = [];
    const thrust = putInHand(snapshot, vanguard.id, "piercing_thrust");
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: thrust.cardInstanceId, targetId: hound.id }, vanguard.id), build1Pack) as MutableSnapshot;
    const afterThrust = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === hound.id)!;
    expect(afterThrust.conditions.filter((entry) => entry.id === "exposed")).toHaveLength(1);

    afterThrust.blockLayers = [];
    const exposedHp = afterThrust.hp;
    snapshot = accept(snapshot, command(snapshot, "useBasicAttack", { targetId: hound.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === hound.id)!.hp).toBe(exposedHp - 6);

    snapshot.activeRun!.combat!.intents.forEach((intent) => { intent.intentId = "circle"; intent.label = "Circle"; intent.magnitude = 4; });
    snapshot = endUntilCompleted(snapshot, hound.id, 1);
    const afterHoundTurn = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === hound.id)!;
    expect(afterHoundTurn.conditions.some((entry) => entry.id === "exposed")).toBe(false);

    snapshot = endUntilActor(snapshot, vanguard.id);
    const rawTarget = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === hound.id)!;
    rawTarget.blockLayers = [];
    const rawHp = rawTarget.hp;
    snapshot = accept(snapshot, command(snapshot, "useBasicAttack", { targetId: hound.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === hound.id)!.hp).toBe(rawHp - 5);

    let refresh = startCombatWithLearned("vanguard", ["piercing_thrust"]);
    const refreshVanguard = refresh.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!;
    const refreshHound = refresh.activeRun!.combat!.combatants.find((entry) => entry.side === "enemies")!;
    refreshHound.blockLayers = [];
    const firstRefresh = putInHand(refresh, refreshVanguard.id, "piercing_thrust");
    setActiveHero(refresh, refreshVanguard.id);
    refresh = accept(refresh, command(refresh, "playCard", { cardInstanceId: firstRefresh.cardInstanceId, targetId: refreshHound.id }, refreshVanguard.id), build1Pack) as MutableSnapshot;
    const secondRefresh = putInHand(refresh, refreshVanguard.id, "piercing_thrust");
    refresh.activeRun!.combat!.heroResources.find((entry) => entry.heroId === refreshVanguard.id)!.stamina = 6;
    refresh = accept(refresh, command(refresh, "playCard", { cardInstanceId: secondRefresh.cardInstanceId, targetId: refreshHound.id }, refreshVanguard.id), build1Pack) as MutableSnapshot;
    expect(refresh.activeRun!.combat!.combatants.find((entry) => entry.id === refreshHound.id)!.conditions.filter((entry) => entry.id === "exposed")).toHaveLength(1);

    const party = startFixtureCombat(build1Pack, "roadside_trail", { flags: ["next_combat_exposed"], forcedStreams: roadsideStreams });
    const partyHeroes = party.activeRun!.combat!.combatants.filter((entry) => entry.side === "heroes");
    expect(partyHeroes).toHaveLength(2);
    expect(partyHeroes.every((hero) => hero.conditions.some((entry) => entry.id === "exposed"))).toBe(true);

    let weakened = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: roadsideStreams });
    const weakenedRun = weakened.activeRun!;
    const weakenedCombat = weakenedRun.combat!;
    const bashVanguard = weakenedRun.heroes.find((hero) => hero.classId === "vanguard")!;
    const bashWeaver = weakenedRun.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const bashHounds = weakenedCombat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const weakenedHound = bashHounds[0]!;
    weakenedCombat.timeline = [bashVanguard.id, weakenedHound.id, bashWeaver.id, bashHounds[1]!.id];
    const shieldBash = putInHand(weakened, bashVanguard.id, "shield_bash");
    setActiveHero(weakened, bashVanguard.id);
    weakened = accept(weakened, command(weakened, "playCard", { cardInstanceId: shieldBash.cardInstanceId, targetId: weakenedHound.id }, bashVanguard.id), build1Pack) as MutableSnapshot;
    expect(weakened.activeRun!.combat!.combatants.find((entry) => entry.id === weakenedHound.id)!.conditions.some((entry) => entry.id === "weakened")).toBe(true);
    const lunge = weakened.activeRun!.combat!.intents.find((entry) => entry.enemyId === weakenedHound.id)!;
    lunge.intentId = "lunge"; lunge.label = "Lunge"; lunge.magnitude = 5;
    weakened.activeRun!.combat!.intents.filter((entry) => entry.enemyId !== weakenedHound.id).forEach((intent) => { intent.intentId = "circle"; intent.label = "Circle"; intent.magnitude = 4; });
    weakened = endUntilCompleted(weakened, weakenedHound.id, 1);
    expect(weakened.activeRun!.combat!.combatants.find((entry) => entry.id === weakenedHound.id)!.conditions.some((entry) => entry.id === "weakened")).toBe(false);
    const weaverBefore = weakened.activeRun!.combat!.combatants.find((entry) => entry.id === bashWeaver.id)!.hp;
    weakened = endUntilCompleted(weakened, weakenedHound.id, 2);
    expect(weaverBefore - weakened.activeRun!.combat!.combatants.find((entry) => entry.id === bashWeaver.id)!.hp).toBe(5);
  });

  it("SIM-C09 isolates Burn timing, stacks, Exposed-on-Burn, and Ashfall party apply", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: roadsideStreams });
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const burned = hounds[0]!;
    combat.timeline = [weaver.id, burned.id, vanguard.id, hounds[1]!.id];
    combat.combatants.filter((entry) => entry.side === "heroes").forEach((hero) => { hero.maxHp = 999; hero.hp = 999; });
    burned.blockLayers = [];
    const spark = putInHand(snapshot, weaver.id, "ember_spark");
    setActiveHero(snapshot, weaver.id);
    snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === weaver.id)!.mana = 6;
    const hpAfterEmberExpected = burned.hp - 4;
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: spark.cardInstanceId, targetId: burned.id }, weaver.id), build1Pack) as MutableSnapshot;
    const afterSpark = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === burned.id)!;
    expect(afterSpark.hp).toBe(hpAfterEmberExpected);
    expect(afterSpark.burn).toHaveLength(1);
    snapshot.activeRun!.combat!.intents.forEach((intent) => { intent.intentId = "circle"; intent.label = "Circle"; intent.magnitude = 4; });
    snapshot = endUntilCompleted(snapshot, burned.id, 1);
    const afterFirstTick = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === burned.id)!;
    expect(afterFirstTick.hp).toBe(hpAfterEmberExpected - 2);
    expect(afterFirstTick.burn).toHaveLength(1);
    snapshot = endUntilCompleted(snapshot, burned.id, 2);
    const afterSecondTick = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === burned.id)!;
    expect(afterSecondTick.hp).toBe(hpAfterEmberExpected - 4);
    expect(afterSecondTick.burn).toHaveLength(0);

    let exposedBurn = startCombatWithLearned("vanguard", ["piercing_thrust"]);
    const exposedRun = exposedBurn.activeRun!;
    const exposedCombat = exposedRun.combat!;
    const thrustVanguard = exposedRun.heroes.find((hero) => hero.classId === "vanguard")!;
    const sparkWeaver = exposedRun.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const exposedHounds = exposedCombat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const exposedHound = exposedHounds[0]!;
    exposedCombat.timeline = [sparkWeaver.id, thrustVanguard.id, exposedHound.id, exposedHounds[1]!.id];
    exposedCombat.combatants.filter((entry) => entry.side === "heroes").forEach((hero) => { hero.maxHp = 999; hero.hp = 999; });
    exposedHound.blockLayers = [];
    const firstSpark = putInHand(exposedBurn, sparkWeaver.id, "ember_spark");
    setActiveHero(exposedBurn, sparkWeaver.id);
    exposedBurn.activeRun!.combat!.heroResources.find((entry) => entry.heroId === sparkWeaver.id)!.mana = 6;
    exposedBurn = accept(exposedBurn, command(exposedBurn, "playCard", { cardInstanceId: firstSpark.cardInstanceId, targetId: exposedHound.id }, sparkWeaver.id), build1Pack) as MutableSnapshot;
    exposedBurn = endUntilActor(exposedBurn, thrustVanguard.id);
    const exposedThrust = putInHand(exposedBurn, thrustVanguard.id, "piercing_thrust");
    exposedBurn = accept(exposedBurn, command(exposedBurn, "playCard", { cardInstanceId: exposedThrust.cardInstanceId, targetId: exposedHound.id }, thrustVanguard.id), build1Pack) as MutableSnapshot;
    const oneStack = exposedBurn.activeRun!.combat!.combatants.find((entry) => entry.id === exposedHound.id)!;
    expect(oneStack.conditions.some((entry) => entry.id === "exposed")).toBe(true);
    expect(oneStack.burn).toHaveLength(1);
    const oneStackHp = oneStack.hp;
    exposedBurn.activeRun!.combat!.intents.forEach((intent) => { intent.intentId = "circle"; intent.label = "Circle"; intent.magnitude = 4; });
    exposedBurn = endUntilCompleted(exposedBurn, exposedHound.id, 1);
    expect(exposedBurn.activeRun!.combat!.combatants.find((entry) => entry.id === exposedHound.id)!.hp).toBe(oneStackHp - 2);

    let twoStack = startCombatWithLearned("vanguard", ["piercing_thrust"]);
    const twoRun = twoStack.activeRun!;
    const twoCombat = twoRun.combat!;
    const twoVanguard = twoRun.heroes.find((hero) => hero.classId === "vanguard")!;
    const twoWeaver = twoRun.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const twoHounds = twoCombat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const twoHound = twoHounds[0]!;
    twoCombat.timeline = [twoWeaver.id, twoVanguard.id, twoHound.id, twoHounds[1]!.id];
    twoCombat.combatants.filter((entry) => entry.side === "heroes").forEach((hero) => { hero.maxHp = 999; hero.hp = 999; });
    twoHound.blockLayers = [];
    twoStack.activeRun!.combat!.heroResources.find((entry) => entry.heroId === twoWeaver.id)!.mana = 6;
    const sparkA = putInHand(twoStack, twoWeaver.id, "ember_spark");
    setActiveHero(twoStack, twoWeaver.id);
    twoStack = accept(twoStack, command(twoStack, "playCard", { cardInstanceId: sparkA.cardInstanceId, targetId: twoHound.id }, twoWeaver.id), build1Pack) as MutableSnapshot;
    const sparkB = putInHand(twoStack, twoWeaver.id, "ember_spark");
    twoStack = accept(twoStack, command(twoStack, "playCard", { cardInstanceId: sparkB.cardInstanceId, targetId: twoHound.id }, twoWeaver.id), build1Pack) as MutableSnapshot;
    twoStack = endUntilActor(twoStack, twoVanguard.id);
    const twoThrust = putInHand(twoStack, twoVanguard.id, "piercing_thrust");
    twoStack = accept(twoStack, command(twoStack, "playCard", { cardInstanceId: twoThrust.cardInstanceId, targetId: twoHound.id }, twoVanguard.id), build1Pack) as MutableSnapshot;
    const twoBefore = twoStack.activeRun!.combat!.combatants.find((entry) => entry.id === twoHound.id)!;
    expect(twoBefore.conditions.some((entry) => entry.id === "exposed")).toBe(true);
    expect(twoBefore.burn).toHaveLength(2);
    const twoHp = twoBefore.hp;
    twoStack.activeRun!.combat!.intents.forEach((intent) => { intent.intentId = "circle"; intent.label = "Circle"; intent.magnitude = 4; });
    twoStack = endUntilCompleted(twoStack, twoHound.id, 1);
    expect(twoStack.activeRun!.combat!.combatants.find((entry) => entry.id === twoHound.id)!.hp).toBe(twoHp - 5);

    let ashfall = startCombatWithLearned("aether_weaver", ["ashfall"]);
    const ashWeaver = ashfall.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const ashEnemies = ashfall.activeRun!.combat!.combatants.filter((entry) => entry.side === "enemies");
    ashfall.activeRun!.combat!.timeline = [ashWeaver.id, ...ashfall.activeRun!.combat!.timeline.filter((id) => id !== ashWeaver.id)];
    ashEnemies.forEach((enemy) => { enemy.blockLayers = []; });
    const ashCard = putInHand(ashfall, ashWeaver.id, "ashfall");
    setActiveHero(ashfall, ashWeaver.id);
    ashfall.activeRun!.combat!.heroResources.find((entry) => entry.heroId === ashWeaver.id)!.mana = 6;
    ashfall = accept(ashfall, command(ashfall, "playCard", { cardInstanceId: ashCard.cardInstanceId }, ashWeaver.id), build1Pack) as MutableSnapshot;
    const livingEnemies = ashfall.activeRun!.combat!.combatants.filter((entry) => entry.side === "enemies" && !entry.destroyed && entry.hp > 0);
    expect(livingEnemies.length).toBeGreaterThanOrEqual(2);
    expect(livingEnemies.every((enemy) => enemy.burn.length === 1)).toBe(true);
  });

  it("SIM-C10 Guard does not redirect party-wide Lament", () => {
    let snapshot = startFixtureCombat(build1Pack, "whisperwood_threshold", { forcedStreams: whisperStreams });
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const chanter = combat.combatants.find((entry) => entry.definitionId === "mist_chanter")!;
    combat.timeline = [vanguard.id, chanter.id, weaver.id, ...combat.timeline.filter((id) => id !== vanguard.id && id !== chanter.id && id !== weaver.id)];
    const hold = putInHand(snapshot, vanguard.id, "hold_the_line");
    setActiveHero(snapshot, vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: hold.cardInstanceId, targetId: weaver.id }, vanguard.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.guards).toHaveLength(1);
    const vanguardCombatant = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === vanguard.id)!;
    vanguardCombatant.blockLayers = [];
    const weaverCombatant = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === weaver.id)!;
    weaverCombatant.blockLayers = [];
    const beforeVanguard = vanguardCombatant.hp;
    const beforeWeaver = weaverCombatant.hp;
    const revealed = snapshot.activeRun!.combat!.intents.find((entry) => entry.enemyId === chanter.id)!;
    revealed.intentId = "lament"; revealed.label = "Lament"; revealed.magnitude = 3;
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, vanguard.id), build1Pack, whisperStreams) as MutableSnapshot;
    const afterVanguard = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === vanguard.id)!;
    const afterWeaver = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === weaver.id)!;
    expect(beforeVanguard - afterVanguard.hp).toBe(3);
    expect(beforeWeaver - afterWeaver.hp).toBe(3);
  });

  it("SIM-C07 Crack Open deals +3 only when the target is Exposed", () => {
    const playCrackOpen = (exposed: boolean): { damage: number; summary: string } => {
      const embarked = createEmbarkedSnapshot(build1Pack, 12345);
      const snapshot = cloneSnapshot(embarked);
      if (snapshot.activeRun === undefined) throw new Error("Fixture failed to embark");
      const vanguard = snapshot.activeRun.heroes.find((hero) => hero.classId === "vanguard")!;
      vanguard.learnedCardIds = [...vanguard.learnedCardIds, "crack_open"];
      snapshot.activeRun.phase = "combat";
      const context = createContext({ combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] });
      startCombat(snapshot, build1Pack, "roadside_trail", context);
      engageFixtureCombat(snapshot, build1Pack, context);
      const combat = snapshot.activeRun.combat!;
      const crack = combat.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "crack_open")!;
      crack.zone = "hand";
      const target = combat.combatants.find((entry) => entry.side === "enemies")!;
      target.blockLayers = [];
      if (exposed) target.conditions = [{ id: "exposed", expiresAfterCompletedTurn: 99 }];
      setActiveHero(snapshot, vanguard.id);
      combat.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina = 10;
      const before = target.hp;
      const after = accept(snapshot, command(snapshot, "playCard", { cardInstanceId: crack.cardInstanceId, targetId: target.id }, vanguard.id), build1Pack);
      const hit = after.activeRun!.combat!.combatants.find((entry) => entry.id === target.id)!;
      return { damage: before - hit.hp, summary: crack.presentation.summary };
    };

    const clean = playCrackOpen(false);
    expect(clean.damage).toBe(8);
    expect(playCrackOpen(true).damage).toBe(13);
    expect(clean.summary).toMatch(/exposed/i);
  });

  it("SIM-C11 Still Wall Weakened lasts until the absorbing enemy's next completed turn", () => {
    const embarked = createEmbarkedSnapshot(build1Pack, 12345);
    const snapshot0 = cloneSnapshot(embarked);
    if (snapshot0.activeRun === undefined) throw new Error("Expected run");
    const vanguardHero = snapshot0.activeRun.heroes.find((hero) => hero.classId === "vanguard")!;
    vanguardHero.learnedCardIds = [...vanguardHero.learnedCardIds, "still_wall"];
    snapshot0.activeRun.phase = "combat";
    const wallContext = createContext({
      combatInitiative: [0.9, 0.9, 0, 0],
      combatIntent: [0, 0, 0, 0, 0, 0, 0, 0]
    });
    startCombat(snapshot0, build1Pack, "roadside_trail", wallContext);
    engageFixtureCombat(snapshot0, build1Pack, wallContext);
    let snapshot = snapshot0;
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const wall = combat.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "still_wall")!;
    combat.cards.filter((card) => card.ownerId === vanguard.id).forEach((card) => {
      card.zone = card === wall ? "hand" : "draw";
    });
    combat.timeline = [vanguard.id, hounds[0]!.id, weaver.id, hounds[1]!.id];
    combat.combatants.find((entry) => entry.id === vanguard.id)!.hp = 20;
    combat.combatants.find((entry) => entry.id === weaver.id)!.hp = 99;
    setActiveHero(snapshot, vanguard.id);
    snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina = 10;
    snapshot = accept(
      snapshot,
      command(snapshot, "playCard", { cardInstanceId: wall.cardInstanceId }, vanguard.id),
      build1Pack
    ) as MutableSnapshot;
    expect(totalBlockForFixture(snapshot, vanguard.id)).toBe(9);
    const intentPad = { combatIntent: [0, 0, 0, 0, 0, 0, 0, 0] as const };
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, vanguard.id), build1Pack, intentPad) as MutableSnapshot;
    const afterFirst = snapshot.activeRun!.combat!;
    const hound1After = afterFirst.combatants.find((entry) => entry.id === hounds[0]!.id)!;
    const vanguardAfterFirst = afterFirst.combatants.find((entry) => entry.id === vanguard.id)!;
    expect(vanguardAfterFirst.hp).toBe(20);
    expect(totalBlockForFixture(snapshot, vanguard.id)).toBe(4);
    expect(hound1After.conditions.some((entry) => entry.id === "weakened")).toBe(true);
    const hound2Intent = afterFirst.intents.find((entry) => entry.enemyId === hounds[1]!.id)!;
    hound2Intent.intentId = "circle";
    hound2Intent.label = "Circle";
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, weaver.id), build1Pack, intentPad) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.activeCombatantId).toBe(vanguard.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, vanguard.id), build1Pack, intentPad) as MutableSnapshot;
    const afterSecond = snapshot.activeRun!.combat!;
    expect(afterSecond.combatants.find((entry) => entry.id === vanguard.id)!.hp).toBe(17);
  });

  it("SIM-C11 Still Wall Weakened is one-shot on the first fully absorbed enemy", () => {
    const embarked = createEmbarkedSnapshot(build1Pack, 12345);
    const snapshot0 = cloneSnapshot(embarked);
    if (snapshot0.activeRun === undefined) throw new Error("Expected run");
    const vanguardHero = snapshot0.activeRun.heroes.find((hero) => hero.classId === "vanguard")!;
    vanguardHero.learnedCardIds = [...vanguardHero.learnedCardIds, "still_wall"];
    snapshot0.activeRun.phase = "combat";
    const wallContext = createContext({
      combatInitiative: [0.9, 0.9, 0, 0],
      combatIntent: [0, 0, 0, 0, 0, 0, 0, 0]
    });
    startCombat(snapshot0, build1Pack, "roadside_trail", wallContext);
    engageFixtureCombat(snapshot0, build1Pack, wallContext);
    let snapshot = snapshot0;
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const wall = combat.cards.find((card) => card.ownerId === vanguard.id && card.definitionId === "still_wall")!;
    combat.cards.filter((card) => card.ownerId === vanguard.id).forEach((card) => {
      card.zone = card === wall ? "hand" : "draw";
    });
    combat.timeline = [vanguard.id, hounds[0]!.id, weaver.id, hounds[1]!.id];
    combat.combatants.find((entry) => entry.id === vanguard.id)!.hp = 20;
    combat.combatants.find((entry) => entry.id === weaver.id)!.hp = 99;
    setActiveHero(snapshot, vanguard.id);
    snapshot.activeRun!.combat!.heroResources.find((entry) => entry.heroId === vanguard.id)!.stamina = 10;
    snapshot = accept(
      snapshot,
      command(snapshot, "playCard", { cardInstanceId: wall.cardInstanceId }, vanguard.id),
      build1Pack
    ) as MutableSnapshot;
    const intentPad = { combatIntent: [0, 0, 0, 0, 0, 0, 0, 0] as const };
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, vanguard.id), build1Pack, intentPad) as MutableSnapshot;
    const afterFirst = snapshot.activeRun!.combat!;
    expect(afterFirst.combatants.find((entry) => entry.id === hounds[0]!.id)!.conditions.some((entry) => entry.id === "weakened")).toBe(true);
    expect(totalBlockForFixture(snapshot, vanguard.id)).toBe(4);
    const hound2Intent = afterFirst.intents.find((entry) => entry.enemyId === hounds[1]!.id)!;
    hound2Intent.intentId = "raking_bite";
    hound2Intent.label = "Raking Bite";
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, weaver.id), build1Pack, intentPad) as MutableSnapshot;
    const afterSecond = snapshot.activeRun!.combat!;
    expect(afterSecond.combatants.find((entry) => entry.id === vanguard.id)!.hp).toBe(20);
    expect(afterSecond.combatants.find((entry) => entry.id === hounds[0]!.id)!.conditions.some((entry) => entry.id === "weakened")).toBe(true);
    expect(afterSecond.combatants.find((entry) => entry.id === hounds[1]!.id)!.conditions.some((entry) => entry.id === "weakened")).toBe(false);
  });

  it("SIM-C13 enemy-first open pauses until Engage; opening damage waits for acknowledgement", () => {
    const enemyFirst = { combatInitiative: [0, 0, 0.9, 0.9] as const, combatIntent: [0, 0] as const };
    const paused = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: enemyFirst, autoEngage: false });
    const combat = paused.activeRun!.combat!;
    expect(combat.awaitingEngage).toBe(true);
    expect(combat.intents.length).toBeGreaterThanOrEqual(2);
    const lead = combat.combatants.find((entry) => entry.id === combat.activeCombatantId)!;
    expect(lead.side).toBe("enemies");
    const hpBefore = Object.fromEntries(combat.combatants.filter((entry) => entry.side === "heroes").map((entry) => [entry.id, entry.hp]));
    const rejected = applyCommand(paused, command(paused, "playCard", { cardInstanceId: "missing" }, combat.combatants.find((entry) => entry.side === "heroes")!.id), build1Pack);
    expect(rejected.status).toBe("rejected");
    if (rejected.status === "rejected") expect(rejected.reasonCode).toBe("invalid_phase");

    const engaged = accept(paused, command(paused, "engageCombat"), build1Pack, enemyFirst) as MutableSnapshot;
    const after = engaged.activeRun!.combat!;
    expect(after.awaitingEngage).toBe(false);
    expect(after.combatants.find((entry) => entry.id === after.activeCombatantId)!.side).toBe("heroes");
    const hpChanged = after.combatants.some((entry) => entry.side === "heroes" && entry.hp !== hpBefore[entry.id]);
    expect(hpChanged).toBe(true);
  });

  it("SIM-C14 hero-first open still requires Engage before the first hero turn begins", () => {
    const heroFirst = { combatInitiative: [0.9, 0.9, 0, 0] as const, combatIntent: [0, 0] as const };
    const paused = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: heroFirst, autoEngage: false });
    const combat = paused.activeRun!.combat!;
    expect(combat.awaitingEngage).toBe(true);
    expect(combat.combatants.find((entry) => entry.id === combat.activeCombatantId)!.side).toBe("heroes");
    expect(combat.heroResources.every((entry) => entry.ap === 0)).toBe(true);

    const engaged = accept(paused, command(paused, "engageCombat"), build1Pack, heroFirst) as MutableSnapshot;
    const after = engaged.activeRun!.combat!;
    expect(after.awaitingEngage).toBe(false);
    const active = after.combatants.find((entry) => entry.id === after.activeCombatantId)!;
    expect(active.side).toBe("heroes");
    expect(after.heroResources.find((entry) => entry.heroId === active.id)!.ap).toBeGreaterThan(0);
  });

  it("SIM-C15 Keep Watch removes Choir Strain before the next combat", () => {
    const streams = { ...roadsideStreams, combatTarget: [0] };
    const snapshot = keepWatchThenCombat({
      runGloom: 0,
      flags: ["next_combat_one_strain"],
      forcedStreams: streams
    });
    const combat = snapshot.activeRun!.combat!;
    const heroes = combat.combatants.filter((entry) => entry.side === "heroes");
    expect(heroes.every((hero) => totalBlockForFixture(snapshot, hero.id) === 3)).toBe(true);
    engageFixtureCombat(snapshot, build1Pack, createContext(streams));
    expect(heroes.every((hero) => !hero.conditions.some((entry) => entry.id === "strain"))).toBe(true);
  });

  it("SIM-C15 Keep Watch exempts the targeted hero from Pressing Strain after Rest", () => {
    const streams = { ...roadsideStreams, combatTarget: [0] };
    const snapshot = keepWatchThenCombat({
      runGloom: 82,
      forcedStreams: streams
    });
    expect(snapshot.activeRun!.runGloom).toBe(70);
    const weaver = snapshot.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    expect(totalBlockForFixture(snapshot, weaver.id)).toBe(3);
    engageFixtureCombat(snapshot, build1Pack, createContext(streams));
    const combatant = snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === weaver.id)!;
    expect(combatant.conditions.some((entry) => entry.id === "strain")).toBe(false);
  });

  it("SIM-C15 Keep Watch still slices one injury on the targeted hero", () => {
    const snapshot = keepWatchThenCombat({
      runGloom: 0,
      weaverInjuries: ["injured", "wounded"],
      vanguardInjuries: ["drained"],
      forcedStreams: { ...roadsideStreams, combatTarget: [0] }
    });
    const weaver = snapshot.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const vanguard = snapshot.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!;
    expect(weaver.injuries).toEqual(["wounded"]);
    expect(vanguard.injuries).toEqual(["drained"]);
  });

  it("SIM-C15 Resupply and Tend Wounds do not clear pending Choir Strain", () => {
    const choirStreams = { ...roadsideStreams, combatTarget: [0] as const };
    for (const optionId of ["resupply", "tend_wounds"] as const) {
      const snapshot = restThenCombat({
        runGloom: 0,
        optionId,
        flags: ["next_combat_one_strain"],
        forcedStreams: choirStreams
      });
      const heroes = snapshot.activeRun!.combat!.combatants.filter((entry) => entry.side === "heroes");
      expect(heroes.some((hero) => hero.conditions.some((entry) => entry.id === "strain"))).toBe(true);
      expect(heroes.every((hero) => totalBlockForFixture(snapshot, hero.id) === 0)).toBe(true);
    }
  });

  it("SIM-C16 Basic Attack and Block summaries include magnitudes at combat start", () => {
    const snapshot = startFixtureCombat(build1Pack, "roadside_trail");
    const combat = snapshot.activeRun!.combat!;
    const weaver = snapshot.activeRun!.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const vanguard = snapshot.activeRun!.heroes.find((hero) => hero.classId === "vanguard")!;
    const weaverBasics = combat.basicActions.find((entry) => entry.heroId === weaver.id)!;
    const vanguardBasics = combat.basicActions.find((entry) => entry.heroId === vanguard.id)!;
    expect(weaverBasics.attack.summary).toBe("Deal 3 physical damage");
    expect(weaverBasics.block.summary).toBe("Gain 4 Block");
    expect(vanguardBasics.attack.summary).toBe("Deal 5 physical damage");
    expect(vanguardBasics.block.summary).toBe("Gain 6 Block");
  });

  it("SIM-C17 Borrowed Fury summary names +2 next hit and charges living enemies", () => {
    let snapshot = startFixtureCombat(build1Pack, "whisperwood_threshold", {
      forcedStreams: { combatInitiative: [0.9, 0.9, 0, 0, 0], combatIntent: [0, 0, 0] }
    });
    const combat = snapshot.activeRun!.combat!;
    const hero = combat.combatants.find((entry) => entry.side === "heroes")!;
    const otherHero = combat.combatants.find((entry) => entry.side === "heroes" && entry.id !== hero.id)!;
    const chanter = combat.combatants.find((entry) => entry.definitionId === "mist_chanter")!;
    combat.combatants.filter((entry) => entry.side === "enemies").forEach((entry) => {
      entry.blockLayers = [{ id: `${entry.id}:test`, sourceId: "test", amount: 8, createdAtRevision: snapshot.revision, expiresAtOwnerTurnStart: 99, special: "normal" }];
    });
    const revealed = combat.intents.find((entry) => entry.enemyId === chanter.id)!;
    revealed.intentId = "lament";
    revealed.label = "Lament";
    revealed.magnitude = 3;
    combat.timeline = [hero.id, chanter.id, ...combat.timeline.filter((id) => id !== hero.id && id !== chanter.id)];
    setActiveHero(snapshot, hero.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, hero.id), build1Pack, { combatIntent: [0] }) as MutableSnapshot;
    const fury = snapshot.activeRun!.combat!.intents.find((entry) => entry.enemyId === chanter.id)!;
    expect(fury.intentId).toBe("borrowed_fury");
    expect(fury.magnitude).toBe(0);
    expect(fury.summary).toBe("living enemies +2 next hit");

    const after = snapshot.activeRun!.combat!;
    after.timeline = [otherHero.id, chanter.id, hero.id];
    setActiveHero(snapshot, otherHero.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, otherHero.id), build1Pack) as MutableSnapshot;
    const livingEnemies = snapshot.activeRun!.combat!.combatants.filter((entry) => entry.side === "enemies" && !entry.destroyed);
    expect(livingEnemies.length).toBeGreaterThan(0);
    expect(livingEnemies.every((entry) => entry.nextDamageBonus === 2)).toBe(true);
  });

  it("SIM-C17 Circle grants Block and next-hit bonus once from the intent effects", () => {
    const circle = build1Pack.enemies.find((entry) => entry.id === "gloomfang_hound")!.intents.find((entry) => entry.id === "circle")!;
    expect(intentEffectSummary(circle)).toBe("Gain 4 Block; next hit +2");

    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: roadsideStreams });
    const combat = snapshot.activeRun!.combat!;
    const hero = combat.combatants.find((entry) => entry.side === "heroes")!;
    const otherHero = combat.combatants.find((entry) => entry.side === "heroes" && entry.id !== hero.id)!;
    const hound = combat.combatants.find((entry) => entry.side === "enemies")!;
    const intent = combat.intents.find((entry) => entry.enemyId === hound.id)!;
    intent.intentId = "circle";
    intent.label = "Circle";
    intent.magnitude = 0;
    intent.summary = intentEffectSummary(circle);
    combat.timeline = [hero.id, hound.id, otherHero.id];
    setActiveHero(snapshot, hero.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, hero.id), build1Pack) as MutableSnapshot;
    expect(totalBlockForFixture(snapshot, hound.id)).toBe(4);
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === hound.id)!.nextDamageBonus).toBe(2);
  });

  it("SIM-C18 Ash Tonic self-down skips the remaining turn and advances to the next living hero", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: roadsideStreams });
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const tonic = createItemInstance(build1Pack, "ash_tonic", "salvaged", 1, "fixture:ash_tonic", { kind: "held_by_expedition", runId: run.runId });
    run.holdings.push(tonic as never);
    combat.timeline = [weaver.id, hounds[0]!.id, vanguard.id, hounds[1]!.id];
    combat.combatants.find((entry) => entry.id === weaver.id)!.hp = 1;
    setActiveHero(snapshot, weaver.id);
    snapshot = accept(snapshot, command(snapshot, "useSupply", { itemId: tonic.instanceId, targetId: weaver.id }, weaver.id), build1Pack, roadsideStreams) as MutableSnapshot;
    const after = snapshot.activeRun!.combat!;
    const weaverAfter = after.combatants.find((entry) => entry.id === weaver.id)!;
    expect(weaverAfter.downed).toBe(true);
    expect(after.outcome).toBe("active");
    expect(after.activeCombatantId).toBe(vanguard.id);
    expect(after.heroResources.find((entry) => entry.heroId === vanguard.id)!.ap).toBeGreaterThan(0);
    expect(after.combatants.find((entry) => entry.id === hounds[0]!.id)!.turnsCompleted).toBeGreaterThan(0);
  });

  it("SIM-C18 Ash Tonic wipe when it downs the last living hero does not skip into empty turns", () => {
    let snapshot = startFixtureCombat(build1Pack, "roadside_trail", { forcedStreams: roadsideStreams });
    const run = snapshot.activeRun!;
    const combat = run.combat!;
    const weaver = run.heroes.find((hero) => hero.classId === "aether_weaver")!;
    const vanguard = run.heroes.find((hero) => hero.classId === "vanguard")!;
    const hounds = combat.combatants.filter((entry) => entry.definitionId === "gloomfang_hound");
    const tonic = createItemInstance(build1Pack, "ash_tonic", "salvaged", 1, "fixture:ash_tonic_wipe", { kind: "held_by_expedition", runId: run.runId });
    run.holdings.push(tonic as never);
    combat.timeline = [weaver.id, hounds[0]!.id, vanguard.id, hounds[1]!.id];
    combat.combatants.find((entry) => entry.id === weaver.id)!.hp = 1;
    const vanguardCombatant = combat.combatants.find((entry) => entry.id === vanguard.id)!;
    vanguardCombatant.hp = 0;
    vanguardCombatant.downed = true;
    setActiveHero(snapshot, weaver.id);
    const beforeCursor = combat.timelineCursor;
    const beforeActive = combat.activeCombatantId;
    snapshot = accept(snapshot, command(snapshot, "useSupply", { itemId: tonic.instanceId, targetId: weaver.id }, weaver.id), build1Pack, roadsideStreams) as MutableSnapshot;
    const after = snapshot.activeRun!.combat!;
    expect(after.outcome).toBe("wipe");
    expect(after.activeCombatantId).toBe(beforeActive);
    expect(after.timelineCursor).toBe(beforeCursor);
    expect(after.combatants.find((entry) => entry.id === hounds[0]!.id)!.turnsCompleted).toBe(0);
  });
});
