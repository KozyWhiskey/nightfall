import { describe, expect, it } from "vitest";
import { build1Pack, validateContentPack, validateItemOwnership } from "@nightfall/content";
import { applyCommand, cloneSnapshot, createContext, createItemInstance, finishCombatIfNeeded, wipe, type MutableSnapshot } from "@nightfall/sim";
import { accept, command, createEmbarkedSnapshot, startFixtureCombat } from "./index.js";

function addScroll(snapshot: MutableSnapshot, suffix: string): string {
  const run = snapshot.activeRun!; const id = `${run.runId}:scroll:${suffix}`;
  run.holdings.push(createItemInstance(build1Pack, "scroll_still_wall", "salvaged", 1, id, { kind: "held_by_expedition", runId: run.runId }) as never);
  return id;
}

function eventFixture(eventId: string): MutableSnapshot {
  const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const run = snapshot.activeRun!;
  run.currentNodeId = eventId === "returning_echo" ? "return_event" : "early_event";
  const node = run.nodes.find((entry) => entry.id === run.currentNodeId)!; node.contentId = eventId; node.state = "entered";
  const event = build1Pack.events.find((entry) => entry.id === eventId)!;
  run.phase = "event"; run.pendingDecision = { kind: "event", eventId, optionIds: [...event.optionIds], choices: event.options.map((option) => ({ id: option.id, label: option.label, detail: "fixture" })) };
  run.runGloom = 20; run.materials.emberglass = 20; run.materials.rations = 20; run.materials.ember_shard = 1; addScroll(snapshot, eventId);
  return snapshot;
}

function craftFixture(): MutableSnapshot {
  const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const run = snapshot.activeRun!;
  run.currentNodeId = "safe_craft"; run.nodes.find((entry) => entry.id === "safe_craft")!.state = "entered";
  run.phase = "craft"; run.pendingDecision = { kind: "craft", recipeIds: ["safe_fuse", "safe_imprint", "risky_overbind"], choices: [] };
  run.materials.emberglass = 20; run.materials.ember_shard = 2;
  addScroll(snapshot, "craft_a"); addScroll(snapshot, "craft_b"); addScroll(snapshot, "craft_c");
  return snapshot;
}

function setActiveHero(snapshot: MutableSnapshot, heroId: string): void {
  const combat = snapshot.activeRun!.combat!; combat.activeCombatantId = heroId; combat.timelineCursor = Math.max(0, combat.timeline.indexOf(heroId)); combat.heroResources.find((entry) => entry.heroId === heroId)!.ap = 3;
}

function gatherShroud(): MutableSnapshot {
  let snapshot = startFixtureCombat(build1Pack, "lantern_smother", { forcedStreams: { combatInitiative: [0.9, 0.9, 0] } });
  const combat = snapshot.activeRun!.combat!; const boss = combat.combatants.find((entry) => entry.definitionId === "lantern_smother")!; const hero = combat.combatants.find((entry) => entry.side === "heroes")!;
  combat.bossTurn = 1; const intent = combat.intents.find((entry) => entry.enemyId === boss.id)!; intent.intentId = "stolen_voice"; intent.label = "Stolen Voice / Gather Shroud"; intent.magnitude = 4;
  combat.timeline = [hero.id, boss.id, ...combat.timeline.filter((id) => id !== hero.id && id !== boss.id)]; setActiveHero(snapshot, hero.id);
  snapshot = accept(snapshot, command(snapshot, "endTurn", {}, hero.id), build1Pack) as MutableSnapshot;
  expect(snapshot.activeRun!.combat!.combatants.some((entry) => entry.definitionId === "smothering_shroud" && !entry.destroyed)).toBe(true);
  expect(snapshot.activeRun!.combat!.intents.find((entry) => entry.enemyId === boss.id)?.intentId).toBe("consume_the_light");
  return snapshot;
}

describe("Build 1 expedition acceptance", () => {
  it("event pending decisions expose structured Cost / Outcome / Odds fields", () => {
    const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack));
    const run = snapshot.activeRun!;
    run.phase = "map";
    run.currentNodeId = "combat_1";
    snapshot.view = "map";
    const combatNode = run.nodes.find((entry) => entry.id === "combat_1")!;
    combatNode.state = "resolved";
    combatNode.visibility = "resolved";
    const early = run.nodes.find((entry) => entry.id === "early_event")!;
    early.contentId = "choir_in_the_bark";
    early.visibility = "category_revealed";
    const after = accept(snapshot, command(snapshot, "chooseMapEdge", { edgeId: "edge_03" }), build1Pack) as MutableSnapshot;
    const decision = after.activeRun!.pendingDecision;
    expect(decision?.kind).toBe("event");
    if (decision?.kind !== "event") throw new Error("expected event");
    expect(decision.eventId).toBe("choir_in_the_bark");
    const byId = Object.fromEntries(decision.choices.map((choice) => [choice.id, choice]));
    expect(byId.free_names?.effectLines).toEqual(expect.arrayContaining(["-10 Run Gloom", "Both heroes start next combat with 3 Block"]));
    expect(byId.free_names?.outcomeBands).toEqual([
      { id: "steady", weight: 50, label: "Steady (no Strain)" },
      { id: "strained", weight: 50, label: "One hero Strained next combat" }
    ]);
    expect(byId.familiar_voice?.effectLines).toEqual([]);
    expect(byId.familiar_voice?.outcomeBands?.map((band) => `${band.weight}% ${band.id}`)).toEqual([
      "40% rare_scroll",
      "30% imbued_relic",
      "30% ambush"
    ]);
    expect(byId.black_resin?.effectLines?.[0]).toMatch(/unstable resin/i);
    expect(byId.black_resin?.outcomeBands).toEqual([]);
    expect(byId.black_resin?.riskTier).toBeUndefined();
    expect(byId.free_names?.riskTier).toBe("risky");
  });

  it("Ember Pit toss_scroll discloses Risky Overbind odds before choose", () => {
    const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack));
    const run = snapshot.activeRun!;
    run.phase = "map";
    run.currentNodeId = "combat_5";
    snapshot.view = "map";
    const from = run.nodes.find((entry) => entry.id === "combat_5")!;
    from.state = "resolved";
    from.visibility = "resolved";
    const pit = run.nodes.find((entry) => entry.id === "deep_event")!;
    pit.contentId = "cache_ember_pit";
    pit.visibility = "category_revealed";
    // edge_12 is combat_5 -> deep_event
    const after = accept(snapshot, command(snapshot, "chooseMapEdge", { edgeId: "edge_12" }), build1Pack) as MutableSnapshot;
    const decision = after.activeRun!.pendingDecision;
    expect(decision?.kind).toBe("event");
    if (decision?.kind !== "event") throw new Error("expected event");
    const toss = decision.choices.find((choice) => choice.id === "toss_scroll");
    expect(toss?.riskTier).toBe("risky");
    expect(toss?.needsItemTarget).toBe(true);
    expect(toss?.effectLines).toEqual(["Free Risky Overbind on the chosen gear (no Emberglass)"]);
    expect(toss?.outcomeBands).toEqual([
      { id: "improvement", weight: 55, label: "Strong improvement" },
      { id: "improvement_overdrawn", weight: 25, label: "Improvement + Overdrawn" },
      { id: "improvement_frayed", weight: 15, label: "Improvement + Frayed" },
      { id: "improvement_hollow", weight: 5, label: "Improvement + Hollow" }
    ]);
    const haul = decision.choices.find((choice) => choice.id === "haul");
    expect(haul?.grantMaterials).toEqual({ emberglass: 3 });
  });

  it("SIM-07 resolves every branch of the four expedition events with disclosed costs and flags", () => {
    const guaranteed = [
      ["last_courier", "escort"], ["last_courier", "ledger"], ["last_courier", "feed_lantern"],
      ["fallen_waystation", "rekindle"],
      ["choir_in_the_bark", "black_resin"], ["cache_ember_pit", "haul"], ["cache_ember_pit", "dig"]
    ] as const;
    for (const [eventId, optionId] of guaranteed) {
      const before = eventFixture(eventId); const beforeGloom = before.activeRun!.runGloom;
      const after = accept(before, command(before, "chooseEventOption", { optionId }), build1Pack) as MutableSnapshot;
      expect(after.activeRun!.diagnostics.eventChoices[0]).toContain(`${eventId}.${optionId}`);
      if (eventId === "last_courier" && optionId === "escort") expect(after.activeRun!.flags).toContain("courier_escorted");
      if (eventId === "last_courier" && optionId === "ledger") expect(after.activeRun!.runGloom).toBe(beforeGloom + 8);
      if (eventId === "cache_ember_pit" && optionId === "dig") expect(after.activeRun!.heroes.every((hero) => hero.hp === hero.maxHp - 3)).toBe(true);
    }
    const randomBranches = [
      ["fallen_waystation", "memory_loop", 0.1, "rare_scroll"], ["fallen_waystation", "memory_loop", 0.9, "exposed"],
      ["fallen_waystation", "salvage_lens", 0.1, "clean_relic"], ["fallen_waystation", "salvage_lens", 0.9, "frayed_relic"],
      ["choir_in_the_bark", "free_names", 0.1, "steady"], ["choir_in_the_bark", "free_names", 0.9, "strained"],
      ["choir_in_the_bark", "familiar_voice", 0.1, "rare_scroll"], ["choir_in_the_bark", "familiar_voice", 0.5, "imbued_relic"], ["choir_in_the_bark", "familiar_voice", 0.9, "ambush"]
    ] as const;
    for (const [eventId, optionId, roll, outcome] of randomBranches) {
      const before = eventFixture(eventId);
      const after = accept(before, command(before, "chooseEventOption", { optionId }), build1Pack, { event: [roll], combatInitiative: [0.9, 0.9, 0, 0], loot: [0.4, 0.4] }) as MutableSnapshot;
      expect(after.latestFacts.find((fact) => fact.kind === "event_resolved")?.data.outcomeId).toBe(outcome);
      if (outcome === "ambush") expect(after.activeRun!.phase).toBe("combat");
      if (outcome === "frayed_relic") {
        const beforeIds = new Set(before.activeRun!.holdings.map((item) => item.instanceId));
        const relic = after.activeRun!.holdings.find((item) => !beforeIds.has(item.instanceId) && item.itemKind === "equipment");
        expect(relic?.curseId).toBe("frayed");
        expect(relic?.mechanicSnapshot.selfDamage).toBe(1);
      }
      if (outcome === "clean_relic") {
        const beforeIds = new Set(before.activeRun!.holdings.map((item) => item.instanceId));
        const relic = after.activeRun!.holdings.find((item) => !beforeIds.has(item.instanceId) && item.itemKind === "equipment");
        expect(relic?.curseId).toBeUndefined();
      }
    }
  });

  it("cancels Safe Craft without consuming inputs and returns to the map", () => {
    const before = craftFixture();
    const scrolls = before.activeRun!.holdings.filter((item) => item.itemKind === "scroll" && item.location.kind === "held_by_expedition").length;
    const emberglass = before.activeRun!.materials.emberglass;
    const after = accept(before, command(before, "cancelCraft"), build1Pack) as MutableSnapshot;
    expect(after.view).toBe("map");
    expect(after.activeRun!.phase).toBe("map");
    expect(after.activeRun!.materials.emberglass).toBe(emberglass);
    expect(after.activeRun!.holdings.filter((item) => item.itemKind === "scroll" && item.location.kind === "held_by_expedition").length).toBe(scrolls);
    expect(after.latestFacts.some((fact) => fact.kind === "craft_cancelled")).toBe(true);
  });

  it("SIM-08 resolves every Safe, Risky, and Ember-Pit craft outcome without deleting an item", () => {
    for (const roll of [0.1, 0.9]) {
      const fuse = craftFixture(); const heroId = fuse.activeRun!.heroes[0]!.id;
      const after = accept(fuse, command(fuse, "chooseCraftRecipe", { recipeId: "safe_fuse", heroId }), build1Pack, { craft: [roll] }) as MutableSnapshot;
      expect(after.activeRun!.heroes[0]!.runLearnedCardIds).toContain("wardstrike");
      expect(after.latestFacts[0]?.data.itemDeleted).toBe(false);
    }
    for (const recipeId of ["safe_imprint", "risky_overbind"] as const) {
      const rolls = recipeId === "safe_imprint" ? [0.1, 0.9] : [0.1, 0.65, 0.85, 0.99];
      for (const roll of rolls) {
        const fixture = craftFixture(); const target = fixture.activeRun!.holdings.find((item) => item.itemKind === "equipment")!; const beforeId = target.instanceId;
        const after = accept(fixture, command(fixture, "chooseCraftRecipe", { recipeId, targetItemId: target.instanceId }), build1Pack, { craft: [roll] }) as MutableSnapshot;
        expect(after.activeRun!.holdings.find((item) => item.instanceId === beforeId)?.location.kind).not.toBe("lost");
        expect(after.activeRun!.holdings.find((item) => item.instanceId === beforeId)?.location.kind).not.toBe("consumed");
      }
    }
    const stabilized = craftFixture(); const target = stabilized.activeRun!.holdings.find((item) => item.itemKind === "equipment")!;
    const protectedResult = accept(stabilized, command(stabilized, "chooseCraftRecipe", { recipeId: "risky_overbind", targetItemId: target.instanceId, spendEmberShard: true }), build1Pack, { craft: [0.99] }) as MutableSnapshot;
    const protectedItem = protectedResult.activeRun!.holdings.find((item) => item.instanceId === target.instanceId)!;
    expect(protectedItem.mechanicSnapshot.selfDamage).toBe(1); expect(protectedItem.mechanicSnapshot.exhaust).not.toBe(true);

    for (const roll of [0.1, 0.65, 0.85, 0.99]) {
      const pit = eventFixture("cache_ember_pit"); const pitTarget = pit.activeRun!.holdings.find((item) => item.itemKind === "equipment")!;
      const after = accept(pit, command(pit, "chooseEventOption", { optionId: "toss_scroll", targetItemId: pitTarget.instanceId }), build1Pack, { craft: [roll] }) as MutableSnapshot;
      expect(after.activeRun!.diagnostics.craftBranches[0]).toContain("ember_pit");
      expect(after.activeRun!.holdings.find((item) => item.instanceId === pitTarget.instanceId)?.location.kind).not.toBe("lost");
    }
  });

  it("SIM-09 changes Consume the Light to Scattered Mist when Shroud is destroyed", () => {
    let snapshot = gatherShroud(); const combat = snapshot.activeRun!.combat!; const shroud = combat.combatants.find((entry) => entry.definitionId === "smothering_shroud")!; shroud.hp = 1;
    const hero = combat.combatants.find((entry) => entry.side === "heroes" && !entry.downed)!; setActiveHero(snapshot, hero.id);
    snapshot = accept(snapshot, command(snapshot, "useBasicAttack", { targetId: shroud.id }, hero.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.diagnostics.shroudOutcome).toBe("destroyed");
    expect(snapshot.activeRun!.combat!.intents.find((entry) => entry.intentId === "scattered_mist")).toBeDefined();
    const boss = snapshot.activeRun!.combat!.combatants.find((entry) => entry.definitionId === "lantern_smother")!;
    snapshot.activeRun!.combat!.timeline = [hero.id, boss.id, ...snapshot.activeRun!.combat!.timeline.filter((id) => id !== hero.id && id !== boss.id)]; setActiveHero(snapshot, hero.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, hero.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.combat!.combatants.find((entry) => entry.id === boss.id)!.conditions.some((entry) => entry.id === "exposed")).toBe(true);
  });

  it("SIM-10 resolves an unbroken Shroud once, damages all heroes, and adds 8 Gloom", () => {
    let snapshot = gatherShroud(); const combat = snapshot.activeRun!.combat!; const boss = combat.combatants.find((entry) => entry.definitionId === "lantern_smother")!; const hero = combat.combatants.find((entry) => entry.side === "heroes" && entry.id === combat.activeCombatantId)!;
    const beforeHp = combat.combatants.filter((entry) => entry.side === "heroes").map((entry) => entry.hp); const beforeGloom = snapshot.activeRun!.runGloom;
    combat.timeline = [hero.id, boss.id, ...combat.timeline.filter((id) => id !== hero.id && id !== boss.id)]; setActiveHero(snapshot, hero.id);
    snapshot = accept(snapshot, command(snapshot, "endTurn", {}, hero.id), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.runGloom).toBe(beforeGloom + 8);
    expect(snapshot.activeRun!.combat!.combatants.filter((entry) => entry.side === "heroes").every((entry, index) => entry.hp < beforeHp[index]!)).toBe(true);
    expect(snapshot.activeRun!.diagnostics.shroudOutcome).toBe("survived");
    const run = snapshot.activeRun!; const bossAfter = run.combat!.combatants.find((entry) => entry.definitionId === "lantern_smother")!; bossAfter.hp = 0; bossAfter.destroyed = true; run.combat!.outcome = "victory";
    finishCombatIfNeeded(snapshot, build1Pack, createContext()); finishCombatIfNeeded(snapshot, build1Pack, createContext());
    expect(snapshot.campaign.blueprintIds.filter((id) => id === "ember_vault")).toHaveLength(1);
    expect(run.materials.ember_shard).toBe(1);
  });

  it("SIM-11 commits waypoint knowledge and makes a chest seal irreversible and unavailable on Return", () => {
    let snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const run = snapshot.activeRun!;
    run.phase = "waypoint"; run.currentNodeId = "waypoint"; run.pendingDecision = { kind: "waypoint", maxChestSlots: 3 }; run.bossDefeated = true; run.waypointClaimed = true; snapshot.campaign.claimedWaypointIds.push("whisperwood_waypoint"); snapshot.campaign.blueprintIds.push("ember_vault"); snapshot.campaign.settlementTraceIds.push("whisperwood_ruined_settlement");
    const scrollId = addScroll(snapshot, "chest");
    snapshot = accept(snapshot, command(snapshot, "sealChestItem", { itemId: scrollId }), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.waypointChest[0]!.location.kind).toBe("sealed_in_waypoint");
    const rejected = applyCommand(snapshot, command(snapshot, "learnScroll", { itemId: scrollId, heroId: snapshot.activeRun!.heroes[0]!.id }), build1Pack);
    expect(rejected.status).toBe("rejected");
    expect(snapshot.campaign).toMatchObject({ claimedWaypointIds: ["whisperwood_waypoint"], blueprintIds: ["ember_vault"] });
  });

  it("SIM-12 banks once, releases chest, preserves learned cards, resets temporary growth, and queues Leadership", () => {
    let snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const run = snapshot.activeRun!;
    run.currentNodeId = "return_event"; run.nodes.find((entry) => entry.id === "return_event")!.state = "resolved"; run.phase = "map"; run.runGloom = 70; run.bossDefeated = true; run.waypointClaimed = true; run.flags.push("courier_escorted"); snapshot.campaign.claimedWaypointIds.push("whisperwood_waypoint"); snapshot.campaign.blueprintIds.push("ember_vault");
    run.materials.timber = 7; run.materials.stone = 7; run.materials.wick = 1; run.materials.emberglass = 3;
    const hero = run.heroes[0]!; hero.temporaryAttribute = "vit"; hero.attributes.vit += 1; hero.maxHp += 3; hero.runLearnedCardIds.push("still_wall");
    const chestId = addScroll(snapshot, "return_chest"); const chestItem = run.holdings.find((item) => item.instanceId === chestId)!; run.holdings = run.holdings.filter((item) => item.instanceId !== chestId); chestItem.location = { kind: "sealed_in_waypoint", waypointId: "whisperwood_waypoint" }; run.waypointChest.push(chestItem);
    snapshot = accept(snapshot, command(snapshot, "chooseMapEdge", { edgeId: "edge_23" }), build1Pack) as MutableSnapshot;
    expect(snapshot.activeRun!.terminalResult).toBe("return");
    expect(snapshot.haven.holdings.some((item) => item.instanceId === chestId)).toBe(true);
    const returned = snapshot.haven.heroes.find((entry) => entry.id === hero.id)!; expect(returned.learnedCardIds).toContain("still_wall"); expect(returned.temporaryAttribute).toBeUndefined(); expect(returned.pendingLeadership).toBe(1);
    expect(snapshot.haven.resources).toMatchObject({ timber: 7, stone: 7, wick: 1, emberglass: 5 });
    expect(snapshot.activeRun!.chronicleFacts?.terminalResult).toBe("return");
  });

  it("SIM-13 resolves a pre-boss wipe exactly once with party and unsealed holdings lost", () => {
    const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const run = snapshot.activeRun!; const scrollId = addScroll(snapshot, "wipe"); const beforePillars = snapshot.haven.litPillars;
    wipe(snapshot, build1Pack, createContext()); const memorials = snapshot.campaign.memorials.length; wipe(snapshot, build1Pack, createContext());
    expect(run.terminalResult).toBe("wipe"); expect(snapshot.haven.litPillars).toBe(beforePillars - 1); expect(snapshot.campaign.memorials).toHaveLength(memorials); expect(snapshot.campaign.blueprintIds).not.toContain("ember_vault");
    expect(run.holdings.find((item) => item.instanceId === scrollId)?.location.kind).toBe("lost"); expect(snapshot.haven.heroes).toHaveLength(2);
  });

  it("SIM-14 preserves waypoint facts, chest, and a spent repair while losing unsealed boss loot", () => {
    const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const run = snapshot.activeRun!; snapshot.haven.litPillars = 9; run.bossDefeated = true; run.waypointClaimed = true; run.remotePillarRepairs = 1; snapshot.campaign.claimedWaypointIds.push("whisperwood_waypoint"); snapshot.campaign.blueprintIds.push("ember_vault"); snapshot.campaign.settlementTraceIds.push("whisperwood_ruined_settlement"); run.materials.ember_shard = 1;
    const chestId = addScroll(snapshot, "protected"); const chest = run.holdings.find((item) => item.instanceId === chestId)!; run.holdings = run.holdings.filter((item) => item.instanceId !== chestId); chest.location = { kind: "sealed_in_waypoint", waypointId: "whisperwood_waypoint" }; run.waypointChest.push(chest);
    const lootId = addScroll(snapshot, "boss_loot"); wipe(snapshot, build1Pack, createContext());
    expect(snapshot.campaign.claimedWaypointIds).toContain("whisperwood_waypoint"); expect(snapshot.campaign.blueprintIds).toContain("ember_vault"); expect(run.waypointChest[0]!.instanceId).toBe(chestId); expect(run.holdings.find((item) => item.instanceId === lootId)?.location.kind).toBe("lost"); expect(run.materials.ember_shard).toBe(0); expect(snapshot.haven.litPillars).toBe(8);
  });

  it("SIM-15 creates exactly one playable successor with the approved legacy boundary", () => {
    const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const run = snapshot.activeRun!; snapshot.haven.litPillars = 1; snapshot.haven.resources.timber = 99; snapshot.haven.buildings.find((entry) => entry.id === "cinder_forge")!.state = "built"; snapshot.campaign.claimedWaypointIds.push("whisperwood_waypoint"); snapshot.campaign.blueprintIds.push("ember_vault");
    wipe(snapshot, build1Pack, createContext()); const havenId = snapshot.haven.id; wipe(snapshot, build1Pack, createContext());
    expect(run.terminalResult).toBe("succession"); expect(snapshot.haven.id).toBe(havenId); expect(snapshot.haven.locationId).toBe("whisperwood_waypoint"); expect(snapshot.haven).toMatchObject({ litPillars: 3, gloom: 7, resources: { timber: 3, stone: 3, wick: 0, ember_shard: 0 } }); expect(snapshot.haven.heroes).toHaveLength(2); expect(snapshot.haven.buildings.find((entry) => entry.id === "cinder_forge")?.state).toBe("available"); expect(snapshot.campaign.blueprintIds).toContain("ember_vault");
  });

  it("SIM-17 rejects future/archived/unknown/incompatible and duplicate ownership before play", () => {
    const future = structuredClone(build1Pack); const black = future.cards.find((entry) => entry.id === "black_thread")!; black.learnable = true; expect(() => validateContentPack(future)).toThrow(/future Umbra/);
    const archived = structuredClone(build1Pack); archived.events[0]!.id = "survivor_lantern_child"; expect(() => validateContentPack(archived)).toThrow(/Archived/);
    const snapshot = cloneSnapshot(createEmbarkedSnapshot(build1Pack)); const item = snapshot.activeRun!.holdings[0]!; expect(() => validateItemOwnership([item, item])).toThrow(/duplicate locations/);
    const unknown = { ...item, definitionId: "unknown_item" }; expect(() => validateItemOwnership([unknown], new Set(build1Pack.items.map((entry) => entry.id)))).toThrow(/unknown definition/);
    const badTarget = applyCommand(startFixtureCombat(build1Pack, "roadside_trail"), command(startFixtureCombat(build1Pack, "roadside_trail"), "useBasicAttack", { targetId: "unknown" }, "vanguard_1"), build1Pack); expect(badTarget.status).toBe("rejected");
  });
});
