import type { AttributeId, CommandEnvelope, HeroSnapshot, ItemInstance, ReasonCode, RewardOffer } from "@nightfall/contracts";
import type { EffectDefinition, EventDefinition, ValidatedContentPack } from "@nightfall/content";
import type { DeepMutable, MutableSnapshot, SimulationContext } from "./internal.js";
import { clamp, emitFact } from "./internal.js";
import { applyCombatCommand, startCombat, syncHeroesFromCombat } from "./combat.js";
import { createItemInstance, itemSlotForDefinition, rarityFromUnit } from "./items.js";
import { legendaryEligibleDefinitionIds, rollGearAffixIds } from "./loot.js";
import { chooseWeighted, drawInt, drawUnit } from "./rng.js";
import { createFoundingParty, createRouteNodes, deriveHeroPools } from "./state.js";

type MutableItem = DeepMutable<ItemInstance>;
type MutableHero = DeepMutable<HeroSnapshot>;

const materialKeys = ["salvage", "emberglass", "rations", "timber", "stone", "wick", "ember_shard"] as const;
type MaterialKey = (typeof materialKeys)[number];

function runOf(snapshot: MutableSnapshot) {
  if (snapshot.activeRun === undefined) throw new Error("An active expedition is required");
  return snapshot.activeRun;
}

function currentNode(snapshot: MutableSnapshot) {
  const run = runOf(snapshot);
  const node = run.nodes.find((entry) => entry.id === run.currentNodeId);
  if (node === undefined) throw new Error(`Missing route node ${run.currentNodeId}`);
  return node;
}

function uniquePush(values: string[], value: string): void {
  if (!values.includes(value)) values.push(value);
}

function addGloom(snapshot: MutableSnapshot, amount: number, source: string, context: SimulationContext, options: { fromEvent?: boolean } = {}): void {
  const run = runOf(snapshot);
  let adjusted = amount;
  if (
    options.fromEvent === true &&
    adjusted > 0 &&
    !run.flags.includes("waystation_used") &&
    run.heroes.some((hero) =>
      run.holdings.some(
        (item) =>
          item.location.kind === "equipped" &&
          item.location.heroId === hero.id &&
          item.mechanicSnapshot.modifiers.includes("gloom_increase_reduction")
      )
    )
  ) {
    adjusted = Math.max(0, adjusted - 5);
    uniquePush(run.flags, "waystation_used");
    emitFact(context, snapshot.revision, "item_passive", "Waystation reduced an Event Run Gloom increase.", { amountBefore: amount, amountAfter: adjusted });
  }
  const before = run.runGloom;
  run.runGloom = clamp(before + adjusted, 0, 100);
  run.diagnostics.gloomChanges.push({ source, before, after: run.runGloom });
  emitFact(context, snapshot.revision, "gloom_changed", `Run Gloom ${adjusted >= 0 ? "rose" : "fell"} by ${Math.abs(adjusted)}.`, { before, after: run.runGloom, source });
}

function addMaterial(snapshot: MutableSnapshot, id: string, amount: number): void {
  if ((materialKeys as readonly string[]).includes(id)) runOf(snapshot).materials[id as MaterialKey] += amount;
}

function itemId(snapshot: MutableSnapshot, source: string): string {
  return `${runOf(snapshot).runId}:${source}:${snapshot.revision}:${runOf(snapshot).holdings.length}`;
}

function generateItem(snapshot: MutableSnapshot, pack: ValidatedContentPack, kind: "gear" | "scroll" | "supply", source: string, context: SimulationContext, minimumRarity: ItemInstance["rarityId"] = "salvaged", extraAffixes: readonly string[] = []): MutableItem {
  const lootDraw = () => drawUnit(snapshot, "loot", context);
  let definitionId: string;
  let rarity: ItemInstance["rarityId"];
  if (kind === "supply") {
    const pool = ["mana_phial", "mana_phial", "mana_phial", "stamina_draught", "stamina_draught", "ash_tonic"];
    definitionId = pool[drawInt(snapshot, "loot", 0, pool.length - 1, context)]!;
    rarity = "salvaged";
  } else if (kind === "scroll") {
    const pool = pack.items.filter((entry) => entry.itemKind === "scroll" && !entry.heldOnly);
    definitionId = pool[drawInt(snapshot, "loot", 0, pool.length - 1, context)]!.id;
    rarity = rarityFromUnit(lootDraw(), minimumRarity);
  } else {
    rarity = rarityFromUnit(lootDraw(), minimumRarity);
    const legendaryIds = legendaryEligibleDefinitionIds();
    let pool = rarity === "legendary"
      ? pack.items.filter((entry) => entry.itemKind === "equipment" && legendaryIds.includes(entry.id))
      : pack.items.filter((entry) => entry.itemKind === "equipment");
    const needsGrantedCard = extraAffixes.some((id) => pack.affixes.find((entry) => entry.id === id)?.requiresGrantedCard);
    if (needsGrantedCard) {
      const withCard = pool.filter((entry) => entry.grantedCardId !== undefined);
      if (withCard.length > 0) pool = withCard;
    }
    const usable = pool.length > 0 ? pool : pack.items.filter((entry) => entry.itemKind === "equipment");
    definitionId = usable[drawInt(snapshot, "loot", 0, usable.length - 1, context)]!.id;
  }
  const affixes = kind === "gear"
    ? rollGearAffixIds(pack, definitionId, rarity, lootDraw, extraAffixes)
    : [...extraAffixes];
  return createItemInstance(pack, definitionId, rarity, snapshot.rngStates.loot, itemId(snapshot, source), { kind: "held_by_expedition", runId: runOf(snapshot).runId }, affixes) as MutableItem;
}

function bossOffers(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): DeepMutable<RewardOffer>[] {
  const definitions = ["kite_shield", "aether_rod", "gloomwood_spear"];
  return definitions.map((definitionId, index) => {
    const legendary = drawUnit(snapshot, "loot", context) < 0.15;
    const rarity = legendary ? "legendary" : "rare";
    const affixes = rollGearAffixIds(pack, definitionId, rarity, () => drawUnit(snapshot, "loot", context));
    const item = createItemInstance(pack, definitionId, rarity, snapshot.rngStates.loot + index, itemId(snapshot, `boss_offer_${index}`), { kind: "held_by_expedition", runId: runOf(snapshot).runId }, affixes) as MutableItem;
    return { id: `boss_offer_${index + 1}`, kind: "item", item };
  });
}

function rewardOffers(snapshot: MutableSnapshot, pack: ValidatedContentPack, encounterId: string, context: SimulationContext): DeepMutable<RewardOffer>[] {
  const tuning = pack.tuning.encounterRewards[encounterId];
  if (tuning === undefined) return [];
  const kinds = [...tuning.offerKinds];
  if (runOf(snapshot).flags.includes("next_reward_three")) { kinds.push("gear"); runOf(snapshot).flags = runOf(snapshot).flags.filter((flag) => flag !== "next_reward_three"); }
  return kinds.map((kind, index) => {
    const normalized = kind === "gear" ? "item" : kind;
    const item = generateItem(snapshot, pack, kind, `${encounterId}_offer_${index}`, context);
    return { id: `${encounterId}_offer_${index + 1}`, kind: normalized, item } as DeepMutable<RewardOffer>;
  });
}

function updateOutgoingNodes(snapshot: MutableSnapshot): void {
  const run = runOf(snapshot);
  const destinations = run.edges.filter((edge) => edge.from === run.currentNodeId).map((edge) => edge.to);
  for (const node of run.nodes) if (destinations.includes(node.id) && node.state === "locked") node.state = "available";
}

function resolveCurrentNodeToMap(snapshot: MutableSnapshot): void {
  const run = runOf(snapshot); const node = currentNode(snapshot); node.state = "resolved"; node.visibility = "resolved";
  run.phase = "map"; delete run.pendingDecision; delete run.combat; snapshot.view = "map"; updateOutgoingNodes(snapshot);
}

function eventPack(pack: ValidatedContentPack, eventId: string): EventDefinition {
  const event = pack.events.find((entry) => entry.id === eventId);
  if (event === undefined) throw new Error(`Unknown event ${eventId}`);
  return event;
}

const FLAG_OUTCOME_LABELS: Record<string, string> = {
  courier_escorted: "Next Rest: effective Gloom reduction is 6 less than base; successful Return grants 2 Emberglass and courier contact",
  courier_ledger: "Next combat reward shows three identified alternatives",
  next_combat_block: "Both heroes start next combat with 3 Block",
  next_reward_three: "Next combat reward shows three identified alternatives",
  grant_imbued_relic: "Gain one Imbued relic",
  grant_imbued_relic_frayed: "Gain one Imbued relic with Frayed",
  grant_rare_scroll: "Gain one Rare scroll",
  grant_imbued_scroll: "Gain one Imbued scroll",
  next_combat_one_strain: "One hero starts next combat Strained",
  next_combat_exposed: "Both heroes start next combat Exposed",
  voice_ambush: "Immediately enter ambush combat",
  unstable_resin: "Gain unstable resin: next Safe Fuse needs only one scroll; created card is always Frayed; expires on Return or wipe",
  safe_fuse_voucher: "Next Safe Fuse costs no Emberglass",
  free_risky_overbind: "Free Risky Overbind on chosen gear (no Emberglass)"
};

const OUTCOME_BAND_LABELS: Record<string, string> = {
  rare_scroll: "Rare scroll",
  exposed: "Both heroes begin next combat Exposed",
  steady: "Steady (no Strain)",
  strained: "One hero Strained next combat",
  imbued_relic: "Imbued relic",
  ambush: "Ambush combat",
  clean_relic: "Imbued relic (clean)",
  frayed_relic: "Imbued relic with Frayed",
  improvement: "Strong improvement",
  improvement_overdrawn: "Improvement + Overdrawn",
  improvement_frayed: "Improvement + Frayed",
  improvement_hollow: "Improvement + Hollow"
};

function effectLabel(effect: EffectDefinition): string {
  if (effect.kind === "changeRunGloom") return `${effect.amount > 0 ? "+" : ""}${effect.amount} Run Gloom`;
  if (effect.kind === "grantMaterial") return `+${effect.amount} ${effect.materialId.replaceAll("_", " ")}`;
  if (effect.kind === "addExpeditionFlag") return FLAG_OUTCOME_LABELS[effect.flagId] ?? `gain ${effect.flagId.replaceAll("_", " ")}`;
  if (effect.kind === "dealDirectDamage") return `${effect.amount} direct damage to each living hero`;
  if (effect.kind === "heal") return effect.percentMax ? `heal ${Math.round(effect.amount * 100)}% max HP` : `heal ${effect.amount}`;
  return effect.kind.replaceAll(/([A-Z])/g, " $1").trim();
}

function humanizeId(id: string): string {
  return id.replaceAll("_", " ");
}

function outcomeBandLabel(id: string): string {
  return OUTCOME_BAND_LABELS[id] ?? humanizeId(id);
}

function collectGrantMaterials(option: EventDefinition["options"][number]): Record<string, number> {
  const grants: Record<string, number> = {};
  const add = (effects: readonly EffectDefinition[]) => {
    for (const effect of effects) {
      if (effect.kind !== "grantMaterial") continue;
      grants[effect.materialId] = (grants[effect.materialId] ?? 0) + effect.amount;
    }
  };
  add(option.effects);
  for (const outcome of option.outcomes) add(outcome.effects);
  return grants;
}

function eventChoices(event: EventDefinition, pack: ValidatedContentPack) {
  return event.options.map((option) => {
    const costEntries = Object.entries(option.cost).filter(([, amount]) => amount > 0);
    const costs = costEntries.map(([id, amount]) => `${amount} ${humanizeId(id)}`).join(", ") || "No cost";
    const grantMaterials = collectGrantMaterials(option);
    const needsItemTarget = option.id === "toss_scroll" || (option.cost.target ?? 0) > 0 || (option.cost.gear ?? 0) > 0;

    if (option.id === "toss_scroll") {
      const recipe = pack.recipes.find((entry) => entry.id === "risky_overbind");
      if (recipe === undefined) throw new Error("Missing risky_overbind recipe for Ember Pit toss");
      const effectLines = ["Free Risky Overbind on the chosen gear (no Emberglass)"];
      const outcomeBands = recipe.outcomes.map((outcome) => ({
        id: outcome.id,
        weight: outcome.weight,
        label: outcomeBandLabel(outcome.id)
      }));
      const outcomes = outcomeBands.map((band) => `${band.weight}% ${band.label}`).join(" · ");
      return {
        id: option.id,
        label: option.label,
        detail: [costs, effectLines[0], outcomes].filter(Boolean).join(" · "),
        effectLines,
        outcomeBands,
        ...(Object.keys(grantMaterials).length > 0 ? { grantMaterials } : {}),
        ...(costEntries.length > 0 ? { cost: Object.fromEntries(costEntries) } : {}),
        needsItemTarget: true,
        riskTier: "risky" as const
      };
    }

    const effectLines = option.effects.map(effectLabel);
    const outcomeBands = option.outcomes.map((outcome) => ({
      id: outcome.id,
      weight: outcome.weight,
      label: outcomeBandLabel(outcome.id)
    }));
    const outcomes = outcomeBands.length === 0
      ? "Guaranteed result"
      : outcomeBands.map((band) => `${band.weight}% ${band.label}`).join(" · ");
    const effects = effectLines.join(" · ");
    const risky = option.outcomes.length > 0;
    return {
      id: option.id,
      label: option.label,
      detail: [costs, effects, outcomes].filter(Boolean).join(" · "),
      effectLines,
      outcomeBands,
      ...(Object.keys(grantMaterials).length > 0 ? { grantMaterials } : {}),
      ...(costEntries.length > 0 ? { cost: Object.fromEntries(costEntries) } : {}),
      ...(needsItemTarget ? { needsItemTarget: true } : {}),
      ...(risky ? { riskTier: "risky" as const } : {})
    };
  });
}

function enterNode(snapshot: MutableSnapshot, pack: ValidatedContentPack, nodeId: string, context: SimulationContext): void {
  const run = runOf(snapshot); const node = run.nodes.find((entry) => entry.id === nodeId);
  if (node === undefined) throw new Error(`Unknown node ${nodeId}`);
  node.state = "entered"; node.visibility = "resolved"; run.currentNodeId = nodeId; run.visitedNodeIds.push(nodeId); run.diagnostics.nodes.push(nodeId);
  if (node.type === "combat" || node.type === "return_combat" || node.type === "boss") {
    const encounterId = node.type === "boss" ? "lantern_smother" : node.contentId!;
    run.phase = "combat"; snapshot.view = "combat"; startCombat(snapshot, pack, encounterId, context); return;
  }
  if (node.type === "event" || node.type === "return_event") {
    const eventId = node.contentId!; const event = eventPack(pack, eventId);
    run.phase = "event"; run.pendingDecision = { kind: "event", eventId, optionIds: [...event.optionIds], choices: eventChoices(event, pack) }; snapshot.view = "event"; return;
  }
  if (node.type === "rest") {
    const modifier = run.flags.includes("courier_escorted") ? 6 : 0;
    run.phase = "rest";
    run.pendingDecision = {
      kind: "rest",
      baseGloomReduction: 12,
      modifier,
      optionIds: ["tend_wounds", "resupply", "keep_watch"],
      choices: [
        { id: "tend_wounds", label: "Tend Wounds", detail: "Heal one hero for 40% of maximum HP.", needsHeroTarget: true },
        { id: "resupply", label: "Resupply", detail: "Fully restore both heroes' Mana and Stamina." },
        { id: "keep_watch", label: "Keep Watch", detail: "Remove one temporary injury or Strain from one hero; both heroes start the next combat with 3 Block.", needsHeroTarget: true }
      ]
    };
    snapshot.view = "rest";
    return;
  }
  if (node.type === "safe_craft") {
    run.phase = "craft";
    run.pendingDecision = {
      kind: "craft",
      recipeIds: pack.recipes.map((entry) => entry.id),
      choices: pack.recipes.map((recipe) => {
        const inputs = { ...recipe.inputs };
        if (recipe.id === "safe_fuse" && run.flags.includes("unstable_resin")) inputs.unlearned_scroll = 1;
        if (recipe.id === "safe_fuse" && run.flags.includes("safe_fuse_voucher")) inputs.emberglass = 0;
        const costEntries = Object.entries(inputs).filter(([, amount]) => amount > 0);
        const riskTier = recipe.id === "risky_overbind" ? "risky" as const : "safe" as const;
        return {
          id: recipe.id,
          label: recipe.display.name,
          detail: `${costEntries.map(([id, amount]) => `${amount} ${id.replaceAll("_", " ")}`).join(" + ")} · ${recipe.outcomes.map((outcome) => `${outcome.weight}% ${outcome.id.replaceAll("_", " ")}`).join(" · ")}`,
          cost: Object.fromEntries(costEntries),
          needsItemTarget: recipe.id === "safe_imprint" || recipe.id === "risky_overbind",
          needsHeroTarget: recipe.id === "safe_fuse",
          riskTier
        };
      })
    };
    snapshot.view = "craft";
    return;
  }
  if (node.type === "waypoint") { run.phase = "waypoint"; run.pendingDecision = { kind: "waypoint", maxChestSlots: 3 }; snapshot.view = "waypoint"; return; }
  if (node.id === "haven_return") successfulReturn(snapshot, pack, context);
}

export function commitEmbark(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): ReasonCode | undefined {
  if (snapshot.activeRun !== undefined || snapshot.view !== "haven" || snapshot.haven.heroes.length !== 2) return "invalid_phase";
  const rootSeed = snapshot.rngStates.map >>> 0;
  const runId = `run_${snapshot.campaign.havenSequence}_${snapshot.revision + 1}_${rootSeed}`;
  const holdings = snapshot.haven.holdings.map((item) => {
    if (item.location.kind === "haven") item.location = { kind: "held_by_expedition", runId };
    return item;
  });
  const nodes = createRouteNodes(pack) as DeepMutable<ReturnType<typeof createRouteNodes>>;
  const earlyEvent = drawUnit(snapshot, "map", context) < 0.5 ? "last_courier" : "choir_in_the_bark";
  const deepEvent = drawUnit(snapshot, "map", context) < 0.5 ? "fallen_waystation" : "cache_ember_pit";
  const early = nodes.find((node) => node.id === "early_event"); if (early !== undefined) early.contentId = earlyEvent;
  const deep = nodes.find((node) => node.id === "deep_event"); if (deep !== undefined) deep.contentId = deepEvent;
  const route = pack.routes.find((entry) => entry.id === "unlit_road")!;
  snapshot.activeRun = {
    runId,
    rootSeed,
    phase: "map",
    runGloom: snapshot.haven.gloom * 4,
    routeId: "unlit_road",
    currentNodeId: "haven_gate",
    nodes,
    edges: route.edges.map((edge) => ({ ...edge })),
    visitedNodeIds: ["haven_gate"],
    heroes: snapshot.haven.heroes,
    materials: { salvage: 0, emberglass: 0, rations: 0, timber: 0, stone: 0, wick: 0, ember_shard: 0 },
    holdings,
    waypointChest: [],
    flags: [],
    standardCombatsWon: 0,
    bossDefeated: false,
    waypointClaimed: false,
    remotePillarRepairs: 0,
    diagnostics: { nodes: ["haven_gate"], gloomChanges: [], combatRounds: 0, cardsPlayed: 0, basicActions: 0, downs: 0, rewardsChosen: [], eventChoices: [], craftBranches: [] }
  };
  snapshot.haven.heroes = []; snapshot.haven.holdings = []; snapshot.view = "map";
  emitFact(context, snapshot.revision, "embark_committed", `${snapshot.haven.name} committed its Vanguard and Aether Weaver to The Unlit Road.`, { runId, rootSeed });
  return undefined;
}

export function chooseMapEdge(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); if (run.phase !== "map") return "invalid_phase";
  const edgeId = typeof command.payload.edgeId === "string" ? command.payload.edgeId : "";
  const edge = run.edges.find((entry) => entry.id === edgeId && entry.from === run.currentNodeId);
  if (edge === undefined) return "invalid_target";
  addGloom(snapshot, edge.runGloomCost, edge.id, context); enterNode(snapshot, pack, edge.to, context); return undefined;
}

function recoverAfterVictory(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): void {
  const run = runOf(snapshot); const combat = run.combat!; syncHeroesFromCombat(snapshot);
  run.diagnostics.combatRounds += combat.round;
  for (const hero of run.heroes) {
    if (hero.downed) {
      const injuries = ["injured", "wounded", "drained"];
      const injury = injuries[drawInt(snapshot, "injury", 0, injuries.length - 1, context)]!;
      hero.injuries.push(injury); hero.downed = false; hero.hp = 1; run.diagnostics.downs += 1;
    }
    hero.mana = Math.min(hero.maxMana, hero.mana + Math.ceil(hero.maxMana * pack.tuning.victoryRecoveryPercent / 100));
    hero.stamina = Math.min(hero.maxStamina, hero.stamina + Math.ceil(hero.maxStamina * pack.tuning.victoryRecoveryPercent / 100));
  }
  for (const item of run.holdings) if (item.location.kind === "carried_by_enemy") item.location = { kind: "held_by_expedition", runId: run.runId };
  emitFact(context, snapshot.revision, "combat_victory", "The party won and recovered 50% of maximum Mana and Stamina.", { encounterId: combat.encounterId, rounds: combat.round });
}

function beginReward(snapshot: MutableSnapshot, pack: ValidatedContentPack, encounterId: string, context: SimulationContext): void {
  const run = runOf(snapshot); const tuning = pack.tuning.encounterRewards[encounterId];
  const automatic: Record<string, number> = tuning === undefined ? {} : { ...tuning.automatic };
  for (const [id, amount] of Object.entries(automatic)) addMaterial(snapshot, id, amount);
  const offers = rewardOffers(snapshot, pack, encounterId, context);
  const carrier = run.holdings.find((item) => item.instanceId.includes(":carrier:") && item.location.kind === "held_by_expedition");
  run.phase = "reward"; run.pendingDecision = { kind: "reward", sourceId: encounterId, offers, automatic, ...(carrier === undefined ? {} : { carrierItemId: carrier.instanceId }) }; snapshot.view = "reward";
}

function commitBossWorldFacts(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): void {
  const run = runOf(snapshot); run.bossDefeated = true; run.waypointClaimed = true;
  uniquePush(snapshot.campaign.claimedWaypointIds, "whisperwood_waypoint"); uniquePush(snapshot.campaign.settlementTraceIds, "whisperwood_ruined_settlement"); uniquePush(snapshot.campaign.blueprintIds, "ember_vault");
  addMaterial(snapshot, "timber", 4); addMaterial(snapshot, "stone", 4); addMaterial(snapshot, "wick", 1); addMaterial(snapshot, "ember_shard", 1);
  run.phase = "reward"; run.pendingDecision = { kind: "reward", sourceId: "lantern_smother", offers: bossOffers(snapshot, pack, context), automatic: { timber: 4, stone: 4, wick: 1, ember_shard: 1 } }; snapshot.view = "reward";
  emitFact(context, snapshot.revision, "waypoint_claimed", "Whisperwood Waypoint and the Ember Vault blueprint became permanent world knowledge.", { waypointId: "whisperwood_waypoint", blueprintId: "ember_vault" });
}

export function finishCombatIfNeeded(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): void {
  const run = runOf(snapshot); const combat = run.combat;
  if (combat === undefined || combat.outcome === "active") return;
  if (combat.outcome === "wipe") { syncHeroesFromCombat(snapshot); wipe(snapshot, pack, context); return; }
  recoverAfterVictory(snapshot, pack, context);
  if (combat.encounterId === "lantern_smother") {
    if (run.bossDefeated) return;
    commitBossWorldFacts(snapshot, pack, context); return;
  }
  if (combat.encounterId !== "return_roadwardens" && combat.encounterId !== "voice_ambush") run.standardCombatsWon += 1;
  beginReward(snapshot, pack, combat.encounterId, context);
}

export function chooseReward(snapshot: MutableSnapshot, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); const decision = run.pendingDecision;
  if (run.phase !== "reward" || decision?.kind !== "reward") return "invalid_phase";
  const offerId = typeof command.payload.offerId === "string" ? command.payload.offerId : "";
  const offer = decision.offers.find((entry) => entry.id === offerId);
  if (offer === undefined) return "invalid_target";
  const item = offer.item as MutableItem; item.location = { kind: "held_by_expedition", runId: run.runId }; run.holdings.push(item); run.diagnostics.rewardsChosen.push(item.definitionId);
  emitFact(context, snapshot.revision, "reward_chosen", `${item.displaySnapshot.name} joined the expedition holdings.`, { offerId, itemId: item.instanceId });
  const source = decision.sourceId;
  return finishRewardDecision(snapshot, source, context);
}

function finishRewardDecision(snapshot: MutableSnapshot, source: string, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot);
  if (source === "lantern_smother") {
    addGloom(snapshot, 5, "edge_19", context); run.currentNodeId = "waypoint"; run.visitedNodeIds.push("waypoint"); run.diagnostics.nodes.push("waypoint");
    const waypoint = run.nodes.find((node) => node.id === "waypoint")!; waypoint.state = "entered"; waypoint.visibility = "resolved";
    run.phase = "waypoint"; run.pendingDecision = { kind: "waypoint", maxChestSlots: 3 }; delete run.combat; snapshot.view = "waypoint";
  } else {
    delete run.pendingDecision; delete run.combat;
    const current = currentNode(snapshot); current.state = "resolved";
    if (run.standardCombatsWon === 3 && run.heroes.some((hero) => hero.temporaryAttribute === undefined)) {
      run.phase = "temporary_growth"; run.pendingDecision = { kind: "temporary_growth", heroIds: run.heroes.filter((hero) => hero.temporaryAttribute === undefined).map((hero) => hero.id) }; snapshot.view = "growth";
    } else { run.phase = "map"; snapshot.view = "map"; updateOutgoingNodes(snapshot); }
  }
  return undefined;
}

export function leaveReward(snapshot: MutableSnapshot, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); const decision = run.pendingDecision;
  if (run.phase !== "reward" || decision?.kind !== "reward" || decision.sourceId === "lantern_smother") return "invalid_phase";
  emitFact(context, snapshot.revision, "reward_left", "The party left the identified offers behind.", { sourceId: decision.sourceId });
  return finishRewardDecision(snapshot, decision.sourceId, context);
}

function hasCost(snapshot: MutableSnapshot, cost: Readonly<Record<string, number>>): boolean {
  const run = runOf(snapshot);
  return Object.entries(cost).every(([id, amount]) => {
    if (id === "unlearned_scroll") return run.holdings.filter((item) => item.itemKind === "scroll" && item.location.kind === "held_by_expedition").length >= amount;
    if (id === "gear" || id === "target") return run.holdings.filter((item) => item.itemKind === "equipment" && item.location.kind !== "lost" && item.location.kind !== "consumed").length >= amount;
    return (materialKeys as readonly string[]).includes(id) && run.materials[id as MaterialKey] >= amount;
  });
}

function payCost(snapshot: MutableSnapshot, cost: Readonly<Record<string, number>>): void {
  const run = runOf(snapshot);
  for (const [id, amount] of Object.entries(cost)) {
    if (id === "unlearned_scroll") {
      let remaining = amount; for (const item of run.holdings.filter((entry) => entry.itemKind === "scroll" && entry.location.kind === "held_by_expedition")) if (remaining > 0) { item.location = { kind: "consumed" }; remaining -= 1; }
    } else if ((materialKeys as readonly string[]).includes(id)) run.materials[id as MaterialKey] -= amount;
  }
}

function applyExpeditionEffects(snapshot: MutableSnapshot, pack: ValidatedContentPack, effects: readonly EffectDefinition[], source: string, context: SimulationContext): void {
  const run = runOf(snapshot);
  for (const effect of effects) {
    if (effect.kind === "changeRunGloom") addGloom(snapshot, effect.amount, source, context, { fromEvent: true });
    else if (effect.kind === "grantMaterial") addMaterial(snapshot, effect.materialId, effect.amount);
    else if (effect.kind === "addExpeditionFlag") uniquePush(run.flags, effect.flagId);
    else if (effect.kind === "dealDirectDamage") for (const hero of run.heroes.filter((entry) => !entry.downed)) { hero.hp = Math.max(0, hero.hp - effect.amount); if (hero.hp === 0) hero.downed = true; }
    else if (effect.kind === "heal") {
      const hero = run.heroes[0]; if (hero !== undefined) hero.hp = Math.min(hero.maxHp, hero.hp + (effect.percentMax ? Math.ceil(hero.maxHp * effect.amount) : effect.amount));
    }
  }
  if (run.heroes.every((hero) => hero.downed)) wipe(snapshot, pack, context);
}

function grantFlagRewards(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): void {
  const run = runOf(snapshot);
  const mappings: [string, "gear" | "scroll", ItemInstance["rarityId"], readonly string[]][] = [
    ["grant_rare_scroll", "scroll", "rare", []],
    ["grant_imbued_scroll", "scroll", "imbued", []],
    ["grant_imbued_relic", "gear", "imbued", []],
    ["grant_imbued_relic_frayed", "gear", "imbued", ["frayed"]]
  ];
  for (const [flag, kind, rarity, extraAffixes] of mappings) {
    if (!run.flags.includes(flag)) continue;
    const item = generateItem(snapshot, pack, kind, flag, context, rarity, extraAffixes);
    run.holdings.push(item);
    run.flags = run.flags.filter((entry) => entry !== flag);
  }
}

export function chooseEvent(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); const decision = run.pendingDecision;
  if (run.phase !== "event" || decision?.kind !== "event") return "invalid_phase";
  const event = eventPack(pack, decision.eventId); const optionId = typeof command.payload.optionId === "string" ? command.payload.optionId : ""; const option = event.options.find((entry) => entry.id === optionId);
  if (option === undefined) return "invalid_target"; if (!hasCost(snapshot, option.cost)) return "insufficient_resource";
  payCost(snapshot, option.cost); applyExpeditionEffects(snapshot, pack, option.effects, `${event.id}.${option.id}`, context);
  let outcomeId = "guaranteed";
  if (option.outcomes.length > 0) { const outcome = chooseWeighted(snapshot, "event", option.outcomes, context); outcomeId = outcome.id; applyExpeditionEffects(snapshot, pack, outcome.effects, `${event.id}.${option.id}.${outcome.id}`, context); }
  run.diagnostics.eventChoices.push(`${event.id}.${option.id}.${outcomeId}`); grantFlagRewards(snapshot, pack, context);
  if (event.id === "cache_ember_pit" && option.id === "toss_scroll") {
    const targetId = typeof command.payload.targetItemId === "string" ? command.payload.targetItemId : undefined;
    const target = run.holdings.find((item) => item.itemKind === "equipment" && item.location.kind !== "lost" && item.location.kind !== "consumed" && (targetId === undefined || item.instanceId === targetId));
    if (target === undefined) return "invalid_target";
    const recipe = pack.recipes.find((entry) => entry.id === "risky_overbind")!;
    const craftOutcome = chooseWeighted(snapshot, "craft", recipe.outcomes, context);
    target.mechanicSnapshot.modifiers = [...target.mechanicSnapshot.modifiers, ...craftOutcome.modifiers];
    target.mechanicSnapshot.damageDelta = (target.mechanicSnapshot.damageDelta ?? 0) + 1;
    if (craftOutcome.modifiers.includes("overdrawn")) target.mechanicSnapshot.secondaryCostDelta = (target.mechanicSnapshot.secondaryCostDelta ?? 0) + 1;
    if (craftOutcome.modifiers.includes("frayed")) target.mechanicSnapshot.selfDamage = 1;
    if (craftOutcome.modifiers.includes("hollow")) target.mechanicSnapshot.exhaust = true;
    run.flags = run.flags.filter((flag) => flag !== "free_risky_overbind");
    run.diagnostics.craftBranches.push(`risky_overbind.${craftOutcome.id}.ember_pit`);
    outcomeId = craftOutcome.id;
  }
  emitFact(context, snapshot.revision, "event_resolved", `${event.display.name}: ${option.label} resolved as ${outcomeId.replaceAll("_", " ")}.`, { eventId: event.id, optionId, outcomeId });
  if (run.flags.includes("voice_ambush")) { run.flags = run.flags.filter((flag) => flag !== "voice_ambush"); delete run.pendingDecision; run.phase = "combat"; snapshot.view = "combat"; startCombat(snapshot, pack, "voice_ambush", context); }
  else resolveCurrentNodeToMap(snapshot);
  return undefined;
}

export function chooseRest(snapshot: MutableSnapshot, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); const decision = run.pendingDecision;
  if (run.phase !== "rest" || decision?.kind !== "rest") return "invalid_phase";
  const optionId = typeof command.payload.optionId === "string" ? command.payload.optionId : ""; if (!decision.optionIds.includes(optionId)) return "invalid_target";
  addGloom(snapshot, -(decision.baseGloomReduction - decision.modifier), "rest", context); run.flags = run.flags.filter((flag) => flag !== "courier_escorted");
  if (optionId === "resupply") for (const hero of run.heroes) { hero.mana = hero.maxMana; hero.stamina = hero.maxStamina; }
  else if (optionId === "tend_wounds") { const heroId = typeof command.payload.heroId === "string" ? command.payload.heroId : run.heroes[0]!.id; const hero = run.heroes.find((entry) => entry.id === heroId); if (hero === undefined) return "invalid_target"; hero.hp = Math.min(hero.maxHp, hero.hp + Math.ceil(hero.maxHp * 0.4)); }
  else { for (const hero of run.heroes) uniquePush(run.flags, `next_block_${hero.id}`); const hero = run.heroes.find((entry) => entry.id === command.payload.heroId) ?? run.heroes[0]; if (hero !== undefined) { hero.injuries = hero.injuries.slice(1); } }
  emitFact(context, snapshot.revision, "rest_resolved", `Rest resolved: ${optionId.replaceAll("_", " ")}.`, { optionId, effectiveGloomReduction: decision.baseGloomReduction - decision.modifier }); resolveCurrentNodeToMap(snapshot); return undefined;
}

export function chooseCraft(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); if (run.phase !== "craft") return "invalid_phase";
  const recipeId = typeof command.payload.recipeId === "string" ? command.payload.recipeId : ""; const recipe = pack.recipes.find((entry) => entry.id === recipeId); if (recipe === undefined) return "unknown_content_id";
  const cost = { ...recipe.inputs };
  if (recipeId === "safe_fuse" && run.flags.includes("unstable_resin")) cost.unlearned_scroll = 1;
  if (recipeId === "safe_fuse" && run.flags.includes("safe_fuse_voucher")) cost.emberglass = 0;
  if (!hasCost(snapshot, cost)) return "insufficient_resource";
  const targetItemId = typeof command.payload.targetItemId === "string" ? command.payload.targetItemId : undefined;
  const target = targetItemId === undefined ? undefined : run.holdings.find((entry) => entry.instanceId === targetItemId && entry.location.kind !== "lost" && entry.location.kind !== "consumed");
  if ((recipeId === "safe_imprint" || recipeId === "risky_overbind") && target === undefined) return "invalid_target";
  payCost(snapshot, cost);
  const outcome = chooseWeighted(snapshot, "craft", recipe.outcomes, context); const modifiers = [...outcome.modifiers];
  const stabilize = command.payload.spendEmberShard === true && run.materials.ember_shard > 0;
  if (stabilize) { run.materials.ember_shard -= 1; const hollow = modifiers.indexOf("hollow"); if (hollow >= 0) modifiers[hollow] = "frayed"; }
  if (recipeId === "safe_fuse") {
    const hero = run.heroes.find((entry) => entry.id === command.payload.heroId) ?? run.heroes[0]!; const definitionId = hero.classId === "vanguard" ? "wardstrike" : "cinder_arc"; uniquePush(hero.runLearnedCardIds, definitionId);
    if (run.flags.includes("unstable_resin")) { modifiers.push("frayed"); run.flags = run.flags.filter((flag) => flag !== "unstable_resin"); }
    run.flags = run.flags.filter((flag) => flag !== "safe_fuse_voucher");
  } else if (target !== undefined) {
    target.mechanicSnapshot.modifiers = [...target.mechanicSnapshot.modifiers, ...modifiers];
    if (modifiers.includes("overdrawn")) {
      target.mechanicSnapshot.secondaryCostDelta = (target.mechanicSnapshot.secondaryCostDelta ?? 0) + 1;
      if (target.curseId === undefined) target.curseId = "overdrawn";
    }
    if (modifiers.includes("frayed")) {
      target.mechanicSnapshot.selfDamage = 1;
      if (target.curseId === undefined) target.curseId = "frayed";
    }
    if (modifiers.includes("hollow")) {
      target.mechanicSnapshot.exhaust = true;
      if (target.curseId === undefined) target.curseId = "hollow";
    }
    target.mechanicSnapshot.damageDelta = (target.mechanicSnapshot.damageDelta ?? 0) + 1;
  }
  run.diagnostics.craftBranches.push(`${recipeId}.${outcome.id}${stabilize ? ".stabilized" : ""}`);
  const curseLabel = modifiers.includes("hollow") ? "Hollow" : modifiers.includes("frayed") ? "Frayed" : modifiers.includes("overdrawn") ? "Overdrawn" : undefined;
  const outcomeLabel = outcome.id.replaceAll("_", " ");
  const craftMessage = target !== undefined
    ? `${recipe.display.name} reforged ${target.displaySnapshot.name}${curseLabel !== undefined ? ` — ${curseLabel}` : ` (${outcomeLabel})`}${stabilize ? " · stabilized" : ""}.`
    : `${recipe.display.name} produced ${outcomeLabel}${stabilize ? " · stabilized" : ""}.`;
  emitFact(context, snapshot.revision, "craft_resolved", craftMessage, {
    recipeId,
    outcomeId: outcome.id,
    stabilized: stabilize,
    itemDeleted: false,
    ...(target !== undefined ? { itemId: target.instanceId } : {})
  });
  resolveCurrentNodeToMap(snapshot);
  return undefined;
}

export function cancelCraft(snapshot: MutableSnapshot, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot);
  if (run.phase !== "craft" || run.pendingDecision?.kind !== "craft") return "invalid_phase";
  emitFact(context, snapshot.revision, "craft_cancelled", "The party left the ruined forge without consuming inputs.", { nodeId: run.currentNodeId });
  resolveCurrentNodeToMap(snapshot);
  return undefined;
}

function recomputeHero(pack: ValidatedContentPack, hero: MutableHero, run: ReturnType<typeof runOf>): void {
  const definition = pack.classes.find((entry) => entry.id === hero.classId)!; const equipped = run.holdings.filter((item) => item.location.kind === "equipped" && item.location.heroId === hero.id); const pools = deriveHeroPools(definition, hero.attributes, equipped);
  hero.maxHp = pools.maxHp; hero.maxMana = pools.maxMana; hero.maxStamina = pools.maxStamina; hero.hp = Math.min(hero.hp, hero.maxHp); hero.mana = Math.min(hero.mana, hero.maxMana); hero.stamina = Math.min(hero.stamina, hero.maxStamina);
}

export function assignTemporaryStat(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); const decision = run.pendingDecision;
  if (run.phase !== "temporary_growth" || decision?.kind !== "temporary_growth") return "invalid_phase";
  const heroId = typeof command.payload.heroId === "string" ? command.payload.heroId : ""; const stat = command.payload.stat as AttributeId; const hero = run.heroes.find((entry) => entry.id === heroId);
  if (hero === undefined || hero.temporaryAttribute !== undefined || !(["vit", "dex", "str", "int"] as const).includes(stat)) return "invalid_target";
  hero.temporaryAttribute = stat; hero.attributes[stat] += 1; recomputeHero(pack, hero, run); decision.heroIds = decision.heroIds.filter((id) => id !== heroId);
  emitFact(context, snapshot.revision, "temporary_growth", `${hero.name} gained temporary ${stat.toUpperCase()}.`, { heroId, stat });
  if (decision.heroIds.length === 0) resolveCurrentNodeToMap(snapshot); return undefined;
}

export function waypointCommand(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); if (run.phase !== "waypoint") return "invalid_phase";
  if (command.type === "spendEmberShardRite") {
    if (run.materials.ember_shard < 1 || snapshot.haven.litPillars >= 10) return "insufficient_resource";
    run.materials.ember_shard -= 1; snapshot.haven.litPillars += 1; snapshot.haven.gloom = Math.max(10 - snapshot.haven.litPillars, snapshot.haven.gloom - 1); run.remotePillarRepairs += 1;
    emitFact(context, snapshot.revision, "pillar_repaired", "The remote rite relit one Haven pillar permanently.", { litPillars: snapshot.haven.litPillars }); return undefined;
  }
  if (command.type === "sealChestItem") {
    if (run.waypointChest.length >= 3) return "item_unavailable"; const itemIdValue = typeof command.payload.itemId === "string" ? command.payload.itemId : ""; const item = run.holdings.find((entry) => entry.instanceId === itemIdValue && entry.location.kind === "held_by_expedition");
    if (item === undefined || !["equipment", "scroll", "ember_shard"].includes(item.itemKind)) return "item_unavailable";
    item.location = { kind: "sealed_in_waypoint", waypointId: "whisperwood_waypoint" }; run.holdings = run.holdings.filter((entry) => entry.instanceId !== item.instanceId); run.waypointChest.push(item);
    emitFact(context, snapshot.revision, "chest_sealed", `${item.displaySnapshot.name} was sealed at Whisperwood.`, { itemId: item.instanceId, slotsUsed: run.waypointChest.length }); return undefined;
  }
  if (command.type === "chooseReturnEdge") {
    const edgeId = typeof command.payload.edgeId === "string" ? command.payload.edgeId : ""; const edge = run.edges.find((entry) => entry.id === edgeId && entry.from === "waypoint" && (entry.to === "return_combat" || entry.to === "return_event")); if (edge === undefined) return "invalid_target";
    addGloom(snapshot, 5, edge.id, context); enterNode(snapshot, pack, edge.to, context); return undefined;
  }
  return "invalid_command";
}

function residualGloom(runGloom: number): number { return runGloom <= 24 ? -1 : runGloom <= 59 ? 0 : runGloom <= 79 ? 1 : 2; }

function chronicle(run: ReturnType<typeof runOf>, result: "return" | "wipe" | "succession") {
  const sealedItemNames = run.waypointChest.map((item) => item.displaySnapshot.name);
  const lostItemNames = run.holdings.filter((item) => item.location.kind === "lost").map((item) => item.displaySnapshot.name);
  const recoveredItemNames = result === "return"
    ? run.holdings.filter((item) => item.location.kind !== "lost" && item.location.kind !== "consumed").map((item) => item.displaySnapshot.name)
    : [];
  return {
    runId: run.runId,
    seed: run.rootSeed,
    heroNames: run.heroes.map((hero) => hero.name),
    visitedNodes: [...run.visitedNodeIds],
    encounters: run.visitedNodeIds.filter((id) => id.startsWith("combat") || id === "boss" || id === "return_combat"),
    eventChoices: [...run.diagnostics.eventChoices],
    injuries: run.heroes.flatMap((hero) => hero.injuries.map((injury) => `${hero.name}:${injury}`)),
    claimedWaypointIds: run.waypointClaimed ? ["whisperwood_waypoint"] : [],
    recoveredItemNames,
    sealedItemNames,
    lostItemNames,
    terminalResult: result
  };
}

function successfulReturn(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): void {
  const run = runOf(snapshot); if (run.terminalResult !== undefined) return;
  for (const item of run.waypointChest) item.location = { kind: "haven", havenId: snapshot.haven.id };
  for (const item of run.holdings) if (item.location.kind === "held_by_expedition") item.location = { kind: "haven", havenId: snapshot.haven.id };
  snapshot.haven.holdings = [...run.holdings.filter((item) => item.location.kind !== "consumed" && item.location.kind !== "lost"), ...run.waypointChest];
  for (const key of materialKeys) snapshot.haven.resources[key] += run.materials[key];
  for (const hero of run.heroes) {
    if (hero.temporaryAttribute !== undefined) { hero.attributes[hero.temporaryAttribute] -= 1; delete hero.temporaryAttribute; }
    hero.learnedCardIds = [...new Set([...hero.learnedCardIds, ...hero.runLearnedCardIds])].sort(); hero.runLearnedCardIds = []; recomputeHero(pack, hero, run); hero.hp = hero.maxHp; hero.mana = hero.maxMana; hero.stamina = hero.maxStamina; hero.downed = false; hero.pendingLeadership += 1;
  }
  snapshot.haven.heroes = run.heroes;
  const snuffed = 10 - snapshot.haven.litPillars; snapshot.haven.gloom = clamp(Math.max(snuffed, snapshot.haven.gloom + residualGloom(run.runGloom)), snuffed, 10);
  if (run.flags.includes("courier_escorted")) { snapshot.haven.resources.emberglass += 2; uniquePush(snapshot.campaign.discoveryIds, "courier_contact"); }
  const chronicleFacts = chronicle(run, "return");
  run.holdings = []; run.waypointChest = [];
  run.terminalResult = "return"; run.phase = "return_results"; run.chronicleFacts = chronicleFacts; snapshot.view = "returnResults";
  emitFact(context, snapshot.revision, "successful_return", `${run.heroes.map((hero) => hero.name).join(" and ")} returned to ${snapshot.haven.name}.`, { runId: run.runId, leadershipPoints: run.heroes.length, havenGloom: snapshot.haven.gloom });
}

function memorial(snapshot: MutableSnapshot, kind: "expedition_wipe" | "haven_fall", runId: string, names: string[]): void {
  snapshot.campaign.memorials.push({ id: `${snapshot.haven.id}:${runId}:${kind}`, havenId: snapshot.haven.id, heroNames: names, kind, runId });
}

export function wipe(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): void {
  const run = runOf(snapshot); if (run.terminalResult !== undefined) return;
  const lostNames = run.heroes.map((hero) => hero.name); for (const item of run.holdings) item.location = { kind: "lost" };
  for (const key of materialKeys) run.materials[key] = 0;
  snapshot.haven.litPillars = Math.max(0, snapshot.haven.litPillars - 1); const snuffed = 10 - snapshot.haven.litPillars; snapshot.haven.gloom = clamp(Math.max(snuffed, snapshot.haven.gloom + 1), snuffed, 10); memorial(snapshot, "expedition_wipe", run.runId, lostNames);
  if (snapshot.haven.litPillars === 0) {
    memorial(snapshot, "haven_fall", run.runId, lostNames); snapshot.campaign.fallenHavenIds.push(snapshot.haven.id); snapshot.campaign.havenSequence += 1;
    const havenId = `haven_${snapshot.campaign.havenSequence}`; const locationId = snapshot.campaign.claimedWaypointIds.at(-1) ?? "cinder_refuge"; const party = createFoundingParty(pack, havenId, snapshot.campaign.havenSequence, run.rootSeed + snapshot.campaign.havenSequence);
    snapshot.haven = { id: havenId, name: `Emberwake ${snapshot.campaign.havenSequence}`, locationId, pillarCapacity: 10, litPillars: 3, gloom: 7, resources: { salvage: 0, emberglass: 0, rations: 0, timber: 3, stone: 3, wick: 0, ember_shard: 0 }, buildings: [{ id: "pillarhouse", state: "built" }, { id: "cinder_forge", state: "available" }, { id: "quiet_house", state: "available" }, { id: "wardyard", state: "available" }, { id: "ember_vault", state: snapshot.campaign.blueprintIds.includes("ember_vault") ? "available" : "unavailable" }, { id: "wayfarer", state: snapshot.campaign.blueprintIds.includes("wayfarer") ? "available" : "unavailable" }], heroes: party.heroes as DeepMutable<HeroSnapshot[]>, holdings: party.holdings as DeepMutable<ItemInstance[]>, memorialAcknowledged: false };
    snapshot.campaign.currentHavenId = havenId; run.terminalResult = "succession"; run.phase = "succession"; run.chronicleFacts = chronicle(run, "succession"); snapshot.view = "succession";
    emitFact(context, snapshot.revision, "haven_succession", `${snapshot.haven.name} was founded at ${locationId} with 3 lit pillars.`, { havenId, locationId, litPillars: 3, havenGloom: 7 });
  } else {
    const party = createFoundingParty(pack, snapshot.haven.id, snapshot.campaign.memorials.length + 1, run.rootSeed + snapshot.campaign.memorials.length); snapshot.haven.heroes = party.heroes as DeepMutable<HeroSnapshot[]>; snapshot.haven.holdings = party.holdings as DeepMutable<ItemInstance[]>;
    run.terminalResult = "wipe"; run.phase = "wipe_results"; run.chronicleFacts = chronicle(run, "wipe"); snapshot.view = "wipeResults";
    emitFact(context, snapshot.revision, "expedition_wipe", `The expedition party was lost. ${snapshot.haven.litPillars} pillars remain lit.`, { runId: run.runId, litPillars: snapshot.haven.litPillars });
  }
}

export function continueAfterTerminal(snapshot: MutableSnapshot): ReasonCode | undefined {
  const run = snapshot.activeRun; if (run === undefined || run.terminalResult === undefined) return "invalid_phase";
  if (snapshot.view === "returnResults") { snapshot.view = "postReturn"; return undefined; }
  snapshot.activeRun = undefined; snapshot.view = "haven"; snapshot.haven.memorialAcknowledged = true; return undefined;
}

export function buildingCommand(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  if (snapshot.view !== "haven" && snapshot.view !== "postReturn") return "invalid_phase";
  if (command.type === "buildBuilding") {
    const buildingId = typeof command.payload.buildingId === "string" ? command.payload.buildingId : ""; const building = snapshot.haven.buildings.find((entry) => entry.id === buildingId); const cost = pack.tuning.buildings[buildingId];
    if (building === undefined || cost === undefined || building.state !== "available") return "invalid_target";
    if (snapshot.haven.resources.timber < cost.timber || snapshot.haven.resources.stone < cost.stone || snapshot.haven.resources.wick < cost.wick) return "insufficient_resource";
    snapshot.haven.resources.timber -= cost.timber; snapshot.haven.resources.stone -= cost.stone; snapshot.haven.resources.wick -= cost.wick; building.state = "built";
    emitFact(context, snapshot.revision, "building_constructed", `${buildingId.replaceAll("_", " ")} was constructed.`, { buildingId }); return undefined;
  }
  if (command.type === "assignLeadership") {
    if (!snapshot.haven.buildings.some((entry) => entry.id === "wardyard" && entry.state === "built")) return "invalid_phase";
    const hero = snapshot.haven.heroes.find((entry) => entry.id === command.payload.heroId); const stat = command.payload.stat as AttributeId; if (hero === undefined || hero.pendingLeadership < 1 || !(["vit", "dex", "str", "int"] as const).includes(stat)) return "invalid_target";
    hero.pendingLeadership -= 1; hero.attributes[stat] += 1; const definition = pack.classes.find((entry) => entry.id === hero.classId)!; const pools = deriveHeroPools(definition, hero.attributes, snapshot.haven.holdings.filter((item) => item.location.kind === "equipped" && item.location.heroId === hero.id)); hero.maxHp = pools.maxHp; hero.maxMana = pools.maxMana; hero.maxStamina = pools.maxStamina;
    emitFact(context, snapshot.revision, "leadership_assigned", `${hero.name} permanently gained ${stat.toUpperCase()}.`, { heroId: hero.id, stat }); return undefined;
  }
  if (command.type === "repairPillar") {
    if (snapshot.haven.resources.ember_shard < 1 || snapshot.haven.litPillars >= 10) return "insufficient_resource"; snapshot.haven.resources.ember_shard -= 1; snapshot.haven.litPillars += 1; snapshot.haven.gloom = Math.max(10 - snapshot.haven.litPillars, snapshot.haven.gloom - 1); emitFact(context, snapshot.revision, "pillar_repaired", "One pillar was relit at the Pillarhouse.", { litPillars: snapshot.haven.litPillars }); return undefined;
  }
  return "invalid_command";
}

export function preparationCommand(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = snapshot.activeRun;
  const atHaven = run === undefined && snapshot.view === "haven";
  const preparation = run !== undefined && ["map", "reward", "rest", "craft", "waypoint", "event", "temporary_growth"].includes(run.phase);
  if (!atHaven && !preparation) return "invalid_phase";
  const heroes = run?.heroes ?? snapshot.haven.heroes;
  const holdings = run?.holdings ?? snapshot.haven.holdings;
  const hero = heroes.find((entry) => entry.id === command.payload.heroId);
  if (hero === undefined) return "invalid_actor";
  if (command.type === "learnScroll") {
    const item = holdings.find((entry) => entry.instanceId === command.payload.itemId && entry.itemKind === "scroll" && (entry.location.kind === "haven" || entry.location.kind === "held_by_expedition"));
    const definition = item === undefined ? undefined : pack.items.find((entry) => entry.id === item.definitionId);
    const cardId = definition?.grantedCardId;
    if (item === undefined || definition === undefined || cardId === undefined) return "item_unavailable";
    if (definition.heldOnly || !definition.requiredSchools.some((school) => hero.schools.includes(school))) return "item_ineligible";
    item.location = { kind: "consumed" };
    if (run === undefined) uniquePush(hero.learnedCardIds, cardId);
    else uniquePush(hero.runLearnedCardIds, cardId);
    emitFact(context, snapshot.revision, "scroll_learned", `${hero.name} learned ${cardId.replaceAll("_", " ")}. The pattern stays permanent only after a successful Return.`, { heroId: hero.id, cardId });
    return undefined;
  }
  if (command.type === "equipItem") {
    const item = holdings.find((entry) => entry.instanceId === command.payload.itemId && entry.itemKind === "equipment" && (entry.location.kind === "haven" || entry.location.kind === "held_by_expedition"));
    if (item === undefined) return "item_unavailable";
    const definition = pack.items.find((entry) => entry.id === item.definitionId)!;
    if (definition.requiredSchools.length > 0 && !definition.requiredSchools.some((school) => hero.schools.includes(school))) return "item_ineligible";
    let slot = itemSlotForDefinition(pack, item.definitionId);
    if (slot === "relic1" && hero.equipment.relic1 !== null) slot = "relic2";
    if (slot === undefined || hero.equipment[slot] !== null) return "item_unavailable";
    hero.equipment[slot] = item.instanceId;
    item.location = { kind: "equipped", heroId: hero.id, slotId: slot };
    const grantedCardId = item.mechanicSnapshot.grantedCardId ?? definition.grantedCardId;
    const cardHint = grantedCardId === undefined ? item.displaySnapshot.name : `${grantedCardId.replaceAll("_", " ")} added to deck`;
    emitFact(context, snapshot.revision, "item_equipped", `${hero.name} equipped ${item.displaySnapshot.name}. ${cardHint}.`, { heroId: hero.id, itemId: item.instanceId, slotId: slot });
    return undefined;
  }
  if (command.type === "unequipItem") {
    const slot = command.payload.slotId as keyof typeof hero.equipment;
    if (!(slot in hero.equipment)) return "invalid_target";
    const instanceId = hero.equipment[slot];
    if (instanceId === null) return "item_unavailable";
    const item = holdings.find((entry) => entry.instanceId === instanceId);
    if (item === undefined) return "item_unavailable";
    hero.equipment[slot] = null;
    item.location = run === undefined ? { kind: "haven", havenId: snapshot.haven.id } : { kind: "held_by_expedition", runId: run.runId };
    emitFact(context, snapshot.revision, "item_unequipped", `${hero.name} unequipped ${item.displaySnapshot.name}.`, { heroId: hero.id, itemId: item.instanceId, slotId: String(slot) });
    return undefined;
  }
  return "invalid_command";
}

export function combatCommand(snapshot: MutableSnapshot, pack: ValidatedContentPack, command: CommandEnvelope, context: SimulationContext): ReasonCode | undefined {
  const run = runOf(snapshot); if (run.phase !== "combat" || run.combat === undefined) return "invalid_phase"; const reason = applyCombatCommand(snapshot, command, pack, context); if (reason === undefined) finishCombatIfNeeded(snapshot, pack, context); return reason;
}
