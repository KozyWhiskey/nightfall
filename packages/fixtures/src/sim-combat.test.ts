import { describe, expect, it } from "vitest";
import type { EquipmentSlot } from "@nightfall/contracts";
import { build1Pack } from "@nightfall/content";
import { applyCommand, cloneSnapshot, createContext, createItemInstance, finishCombatIfNeeded, refillForFixture, reviveForFixture, startCombat, totalBlockForFixture, type MutableSnapshot } from "@nightfall/sim";
import { accept, command, createEmbarkedSnapshot, startFixtureCombat } from "./index.js";

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
  startCombat(snapshot, build1Pack, "roadside_trail", createContext({ combatInitiative: [0.9, 0.9, 0, 0], combatIntent: [0, 0] }));
  return snapshot;
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
    const snapshot = startFixtureCombat(build1Pack, "stalking_choir", { forcedStreams: { loot: [0, 0, 0, 0], combatInitiative: [0.9, 0.9, 0, 0, 0] } });
    const run = snapshot.activeRun!; const carrierItem = run.holdings.find((item) => item.location.kind === "carried_by_enemy")!;
    expect(carrierItem).toBeDefined();
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
});
