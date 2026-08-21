import type { CardInstanceSnapshot, CombatantSnapshot, CommandEnvelope, EnemyIntentSnapshot, HeroSnapshot, ItemInstance, ReasonCode } from "@nightfall/contracts";
import type { CardDefinition, EffectDefinition, EnemyDefinition, IntentDefinition, ValidatedContentPack } from "@nightfall/content";
import type { DeepMutable, MutableSnapshot, SimulationContext } from "./internal.js";
import { clamp, emitFact, stableSort } from "./internal.js";
import { createItemInstance } from "./items.js";
import { chooseWeighted, drawInt, drawUnit, shuffle } from "./rng.js";

type MutableCombatant = DeepMutable<CombatantSnapshot>;
type MutableCard = DeepMutable<CardInstanceSnapshot>;

function runOf(snapshot: MutableSnapshot) {
  if (snapshot.activeRun === undefined) throw new Error("Combat requires an active run");
  return snapshot.activeRun;
}

function combatOf(snapshot: MutableSnapshot) {
  const combat = runOf(snapshot).combat;
  if (combat === undefined) throw new Error("Combat snapshot is missing");
  return combat;
}

function itemInitiative(hero: HeroSnapshot, items: readonly ItemInstance[]): number {
  return items.filter((item) => item.location.kind === "equipped" && item.location.heroId === hero.id).reduce((sum, item) => sum + (item.mechanicSnapshot.initiativeDelta ?? 0), 0);
}

function heroHasEquippedModifier(snapshot: MutableSnapshot, heroId: string, modifierId: string): boolean {
  return runOf(snapshot).holdings.some((item) => item.location.kind === "equipped" && item.location.heroId === heroId && item.mechanicSnapshot.modifiers.includes(modifierId));
}

function equippedCardDamageFlat(snapshot: MutableSnapshot, heroId: string, definition: CardDefinition): number {
  if (definition.kind === "spell" && heroHasEquippedModifier(snapshot, heroId, "spell_damage_flat")) return 1;
  if (definition.kind === "basic" && heroHasEquippedModifier(snapshot, heroId, "basic_attack_damage")) return 1;
  return 0;
}

export function effectSummary(definition: CardDefinition, stats?: { strength: number; intellect: number }, mods?: { damageDelta?: number; blockDelta?: number }): string {
  const damageBonus = mods?.damageDelta ?? 0;
  const blockBonus = mods?.blockDelta ?? 0;
  return definition.effects.map((effect) => {
    if (effect.kind === "dealDamage") {
      const scaling = effect.scaling === "strength" ? (stats?.strength ?? 0) : effect.scaling === "intellect" ? (stats?.intellect ?? 0) : 0;
      const total = Math.max(0, effect.amount + scaling + damageBonus);
      return `Deal ${total} ${effect.damageType} damage`;
    }
    if (effect.kind === "gainBlock") return `Gain ${effect.amount + blockBonus} Block`;
    if (effect.kind === "applyCondition") return `Apply ${effect.stacks} ${effect.conditionId}`;
    if (effect.kind === "removeBlock") return `Remove ${effect.amount} Block`;
    if (effect.kind === "createGuard") return "Guard the chosen ally until your next turn";
    return effect.kind.replaceAll(/([A-Z])/g, " $1").toLowerCase();
  }).join("; ");
}

function buildHeroCards(snapshot: MutableSnapshot, pack: ValidatedContentPack, hero: HeroSnapshot, context: SimulationContext): MutableCard[] {
  const run = runOf(snapshot);
  const classDefinition = pack.classes.find((entry) => entry.id === hero.classId)!;
  const sources: { definitionId: string; sourceId: string; item?: ItemInstance }[] = classDefinition.classCardIds.map((definitionId) => ({ definitionId, sourceId: `class:${hero.classId}` }));
  for (const definitionId of [...hero.learnedCardIds, ...hero.runLearnedCardIds].sort()) sources.push({ definitionId, sourceId: `learned:${definitionId}` });
  const slotOrder = ["mainHand", "offHand", "head", "body", "gloves", "legs", "feet", "relic1", "relic2"] as const;
  for (const slot of slotOrder) {
    const itemId = hero.equipment[slot];
    if (itemId === null) continue;
    const item = run.holdings.find((entry) => entry.instanceId === itemId);
    const definitionId = item?.mechanicSnapshot.grantedCardId;
    if (item !== undefined && definitionId !== undefined) sources.push({ definitionId, sourceId: item.instanceId, item });
  }
  const ordered = sources.map((source, index) => {
    const definition = pack.cards.find((entry) => entry.id === source.definitionId)!;
    const costDelta = source.item?.mechanicSnapshot.secondaryCostDelta ?? 0;
    const grantedDamageDelta = source.item?.mechanicSnapshot.damageDelta ?? 0;
    const displayDamageDelta = grantedDamageDelta + equippedCardDamageFlat(snapshot, hero.id, definition);
    return ({
    cardInstanceId: `${hero.id}:${source.definitionId}:${index}`,
    definitionId: source.definitionId,
    ownerId: hero.id,
    sourceId: source.sourceId,
    zone: "draw" as const,
    retain: source.item?.mechanicSnapshot.retain ?? false,
    exhaust: source.item?.mechanicSnapshot.exhaust ?? false,
    costDelta: source.item?.mechanicSnapshot.secondaryCostDelta ?? 0,
    damageDelta: grantedDamageDelta,
    blockDelta: source.item?.mechanicSnapshot.blockDelta ?? 0,
    selfDamage: source.item?.mechanicSnapshot.selfDamage ?? 0,
    presentation: {
      name: definition.display.name,
      apCost: definition.cost.ap,
      manaCost: definition.cost.mana > 0 ? definition.cost.mana + costDelta : 0,
      staminaCost: definition.cost.stamina > 0 ? definition.cost.stamina + costDelta : 0,
      targetSpec: definition.targetSpec,
      summary: effectSummary(definition, { strength: hero.attributes.str, intellect: hero.attributes.int }, { damageDelta: displayDamageDelta, blockDelta: source.item?.mechanicSnapshot.blockDelta ?? 0 })
    }
  }); });
  const shuffled = shuffle(snapshot, "combatDeck", ordered, context);
  return shuffled.map((entry) => ({ ...entry, zone: "draw" }));
}

function eligibleCarrierBases(enemyId: string): string[] {
  if (enemyId === "gloomfang_hound") return ["gloomwood_spear", "pilgrims_knot"];
  if (enemyId === "shattered_husk") return ["hewn_sword", "kite_shield", "pilgrims_knot"];
  if (enemyId === "mire_imp") return ["aether_rod", "archivists_focus", "cracked_way_lens"];
  if (enemyId === "mist_chanter") return ["aether_rod", "way_lantern_buckler", "name_thread_charm"];
  return [];
}

function maybeCreateCarrier(snapshot: MutableSnapshot, pack: ValidatedContentPack, enemyEntries: { id: string; definitionId: string }[], encounterId: string, context: SimulationContext): ItemInstance | undefined {
  const encounter = pack.encounters.find((entry) => entry.id === encounterId);
  if (encounter === undefined || encounter.carrierChance <= 0 || drawUnit(snapshot, "loot", context) >= encounter.carrierChance) return undefined;
  const eligible = enemyEntries.filter((entry) => eligibleCarrierBases(entry.definitionId).length > 0);
  if (eligible.length === 0) return undefined;
  const carrier = eligible[drawInt(snapshot, "loot", 0, eligible.length - 1, context)]!;
  const bases = eligibleCarrierBases(carrier.definitionId);
  const definitionId = bases[drawInt(snapshot, "loot", 0, bases.length - 1, context)]!;
  return createItemInstance(pack, definitionId, "imbued", snapshot.rngStates.loot, `${runOf(snapshot).runId}:carrier:${carrier.id}`, { kind: "carried_by_enemy", enemyId: carrier.id }, ["quickened"]);
}

function combatantFromHero(hero: HeroSnapshot, initiative: number, initiativeBonus: number): MutableCombatant {
  return {
    id: hero.id,
    definitionId: hero.classId,
    name: hero.name,
    side: "heroes",
    kind: "hero",
    hp: hero.hp,
    maxHp: hero.maxHp,
    dex: hero.attributes.dex,
    strength: hero.attributes.str,
    intellect: hero.attributes.int,
    initiative,
    itemInitiative: initiativeBonus,
    blockLayers: [],
    conditions: [],
    burn: [],
    turnsStarted: 0,
    turnsCompleted: 0,
    downed: hero.downed,
    destroyed: false,
    nextDamageBonus: 0,
    targetable: true
  };
}

function combatantFromEnemy(definition: EnemyDefinition, id: string, initiative: number, initiativeBonus: number, carriedItemId?: string): MutableCombatant {
  return {
    id,
    definitionId: definition.id,
    name: definition.display.name,
    side: "enemies",
    kind: "enemy",
    hp: definition.hp,
    maxHp: definition.hp,
    dex: definition.dex,
    strength: definition.strength,
    intellect: definition.intellect,
    initiative,
    itemInitiative: initiativeBonus,
    blockLayers: [],
    conditions: [],
    burn: [],
    turnsStarted: 0,
    turnsCompleted: 0,
    downed: false,
    destroyed: false,
    nextDamageBonus: 0,
    ...(carriedItemId === undefined ? {} : { carriedItemId }),
    targetable: true
  };
}

function findEnemyDefinition(pack: ValidatedContentPack, combatant: MutableCombatant): EnemyDefinition {
  const definition = pack.enemies.find((entry) => entry.id === combatant.definitionId);
  if (definition === undefined) throw new Error(`Unknown enemy ${combatant.definitionId}`);
  return definition;
}

function totalBlock(combatant: MutableCombatant): number {
  return combatant.blockLayers.reduce((sum, layer) => sum + layer.amount, 0);
}

function isAlive(combatant: MutableCombatant): boolean {
  return !combatant.destroyed && !combatant.downed && combatant.hp > 0;
}

function intentEligibility(intent: IntentDefinition, actor: MutableCombatant, combatants: MutableCombatant[]): boolean {
  const allies = combatants.filter((entry) => entry.side === actor.side && isAlive(entry));
  if (intent.eligibility === "allyMissingBlock") return allies.some((entry) => totalBlock(entry) < 4);
  if (intent.eligibility === "damagedAlly") return allies.some((entry) => entry.hp < entry.maxHp);
  if (intent.eligibility === "damagingAllyExists") return allies.some((entry) => entry.id !== actor.id && entry.definitionId !== "gloom_spore");
  return true;
}

function bossIntent(combatants: MutableCombatant[], bossTurn: number): string {
  const shroudAlive = combatants.some((entry) => entry.definitionId === "smothering_shroud" && !entry.destroyed);
  if (bossTurn === 0) return "raking_fog";
  if (bossTurn === 1 || (bossTurn > 2 && bossTurn % 3 === 1)) return "stolen_voice";
  if (bossTurn === 2 || (bossTurn > 2 && bossTurn % 3 === 2)) return shroudAlive ? "consume_the_light" : "scattered_mist";
  return bossTurn % 2 === 0 ? "drown_the_spark" : "raking_fog";
}

function chooseIntent(snapshot: MutableSnapshot, actor: MutableCombatant, definition: EnemyDefinition, context: SimulationContext, forcedId?: string): IntentDefinition {
  const combat = combatOf(snapshot);
  if (definition.id === "lantern_smother") return definition.intents.find((entry) => entry.id === bossIntent(combat.combatants, combat.bossTurn))!;
  if (forcedId !== undefined) return definition.intents.find((entry) => entry.id === forcedId)!;
  const valid = definition.intents.filter((entry) => entry.id !== "rupture" && intentEligibility(entry, actor, combat.combatants));
  return chooseWeighted(snapshot, "combatIntent", valid.length > 0 ? valid : definition.intents.filter((entry) => entry.id !== "rupture"), context);
}

function intentMagnitude(intent: IntentDefinition): number {
  return intent.effects.reduce((sum, effect) => sum + (effect.kind === "dealDamage" || effect.kind === "dealDirectDamage" ? effect.amount : 0), 0);
}

function revealIntent(snapshot: MutableSnapshot, actor: MutableCombatant, definition: EnemyDefinition, context: SimulationContext, forcedId?: string): void {
  const combat = combatOf(snapshot);
  const selected = chooseIntent(snapshot, actor, definition, context, forcedId);
  const targetLabel = selected.targetSpec === "allEnemies" ? "all heroes" : selected.targetSpec === "self" || selected.targetSpec === "allAllies" ? "enemy side" : selected.targetSpec.replaceAll(/([A-Z])/g, " $1").toLowerCase();
  const intent: DeepMutable<EnemyIntentSnapshot> = { enemyId: actor.id, intentId: selected.id, label: selected.label, targetLabel, magnitude: intentMagnitude(selected), revealedAtRevision: snapshot.revision };
  combat.intents = combat.intents.filter((entry) => entry.enemyId !== actor.id);
  combat.intents.push(intent);
  combat.intents.sort((left, right) => left.enemyId.localeCompare(right.enemyId));
}

function zoneCards(combat: ReturnType<typeof combatOf>, heroId: string, zone: CardInstanceSnapshot["zone"]): MutableCard[] {
  return combat.cards.filter((entry) => entry.ownerId === heroId && entry.zone === zone);
}

function drawOne(snapshot: MutableSnapshot, heroId: string, context: SimulationContext): void {
  const combat = combatOf(snapshot);
  let draw = zoneCards(combat, heroId, "draw");
  if (draw.length === 0) {
    const discard = zoneCards(combat, heroId, "discard");
    if (discard.length === 0) return;
    const shuffled = shuffle(snapshot, "combatDeck", discard, context);
    shuffled.forEach((card) => { card.zone = "draw"; });
    draw = shuffled;
  }
  draw[0]!.zone = "hand";
}

function refillHand(snapshot: MutableSnapshot, heroId: string, pack: ValidatedContentPack, context: SimulationContext): void {
  const combat = combatOf(snapshot);
  let target = pack.tuning.handSize;
  const combatant = combat.combatants.find((entry) => entry.id === heroId);
  if (heroHasEquippedModifier(snapshot, heroId, "combat_start_draw") && (combatant?.turnsCompleted ?? 0) === 0) {
    target += 1;
    emitFact(context, snapshot.revision, "item_passive", "Drew 1 extra card at combat start.", { heroId });
  }
  if (heroHasEquippedModifier(snapshot, heroId, "retain_refill") && !combat.retainRefillUsedHeroIds.includes(heroId)) {
    const retainedInHand = zoneCards(combat, heroId, "hand").filter((card) => card.retain).length;
    if (retainedInHand > 0) {
      target += 1;
      combat.retainRefillUsedHeroIds.push(heroId);
      emitFact(context, snapshot.revision, "item_passive", "A Retained card stayed in hand without reducing draw.", { heroId });
    }
  }
  while (zoneCards(combat, heroId, "hand").length < target) {
    const before = zoneCards(combat, heroId, "hand").length;
    drawOne(snapshot, heroId, context);
    if (zoneCards(combat, heroId, "hand").length === before) break;
  }
}

function conditionMultiplier(combatant: MutableCombatant, conditionId: "exposed" | "weakened"): number {
  return combatant.conditions.some((entry) => entry.id === conditionId) ? (conditionId === "exposed" ? 1.25 : 0.75) : 1;
}

function addCondition(target: MutableCombatant, conditionId: "exposed" | "weakened" | "burn" | "stun" | "strain", stacks: number, duration: number): void {
  if (conditionId === "burn") {
    for (let index = 0; index < stacks && target.burn.length < 10; index += 1) target.burn.push({ remainingOwnerTurns: duration });
    return;
  }
  if (conditionId === "stun" && target.conditions.some((entry) => entry.id === "stun")) return;
  const existing = target.conditions.find((entry) => entry.id === conditionId);
  const expiry = target.turnsCompleted + duration;
  if (existing === undefined) target.conditions.push({ id: conditionId, expiresAfterCompletedTurn: expiry });
  else existing.expiresAfterCompletedTurn = Math.max(existing.expiresAfterCompletedTurn, expiry);
}

function addBlock(snapshot: MutableSnapshot, target: MutableCombatant, amount: number, sourceId: string, duration: "ownerNextTurn" | "ownerSecondTurn"): void {
  target.blockLayers.push({ id: `${sourceId}:${snapshot.revision}:${target.blockLayers.length}`, sourceId, amount, createdAtRevision: snapshot.revision, expiresAtOwnerTurnStart: target.turnsStarted + (duration === "ownerSecondTurn" ? 2 : 1), special: duration === "ownerSecondTurn" ? "gloom" : "normal" });
}

function resolveGuard(combat: ReturnType<typeof combatOf>, target: MutableCombatant, directTargeted: boolean): MutableCombatant {
  if (!directTargeted || target.side !== "heroes") return target;
  const links = stableSort(combat.guards.filter((entry) => entry.protectedHeroId === target.id), (entry) => entry.id, (left, right) => right.createdAtRevision - left.createdAtRevision);
  for (const link of links) {
    const guard = combat.combatants.find((entry) => entry.id === link.guardingHeroId);
    if (guard !== undefined && isAlive(guard)) return guard;
  }
  return target;
}

function dealDamage(snapshot: MutableSnapshot, actor: MutableCombatant, originalTarget: MutableCombatant, amount: number, scaling: "strength" | "intellect" | "none", bypassBlock: boolean, directTargeted: boolean, sourceId: string, context: SimulationContext): void {
  const combat = combatOf(snapshot);
  const target = resolveGuard(combat, originalTarget, directTargeted);
  const scalingValue = scaling === "strength" ? actor.strength : scaling === "intellect" ? actor.intellect : 0;
  const raw = Math.max(0, amount + scalingValue + actor.nextDamageBonus);
  const calculated = Math.max(0, Math.floor(raw * conditionMultiplier(actor, "weakened") * conditionMultiplier(target, "exposed")));
  if (actor.nextDamageBonus > 0) actor.nextDamageBonus = 0;
  let remaining = calculated;
  let stillWallAbsorbed = false;
  if (!bypassBlock) {
    for (let index = target.blockLayers.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const layer = target.blockLayers[index]!;
      const absorbed = Math.min(layer.amount, remaining);
      layer.amount -= absorbed;
      remaining -= absorbed;
      if (absorbed > 0 && layer.sourceId === "still_wall" && remaining === 0) stillWallAbsorbed = true;
    }
    target.blockLayers = target.blockLayers.filter((layer) => layer.amount > 0);
  }
  target.hp = Math.max(0, target.hp - remaining);
  emitFact(context, snapshot.revision, "damage", `${actor.name} dealt ${calculated} damage to ${target.name}.`, { actorId: actor.id, targetId: target.id, amount: calculated, hpDamage: remaining, redirected: target.id !== originalTarget.id });
  if (stillWallAbsorbed) addCondition(actor, "weakened", 1, 1);
  if (target.hp === 0) {
    if (target.side === "heroes") target.downed = true;
    else target.destroyed = true;
    emitFact(context, snapshot.revision, target.side === "heroes" ? "hero_downed" : "enemy_destroyed", target.side === "heroes" ? `${target.name} was Downed.` : `${target.name} was destroyed.`, { targetId: target.id });
    if (target.definitionId === "smothering_shroud") {
      runOf(snapshot).diagnostics.shroudOutcome = "destroyed";
      const boss = combat.combatants.find((entry) => entry.definitionId === "lantern_smother");
      const revealed = boss === undefined ? undefined : combat.intents.find((entry) => entry.enemyId === boss.id);
      if (revealed !== undefined) {
        revealed.intentId = "scattered_mist";
        revealed.label = "Scattered Mist";
        revealed.targetLabel = "all heroes";
        revealed.magnitude = 3;
        revealed.revealedAtRevision = snapshot.revision;
      }
    }
  }
}

function directDamage(snapshot: MutableSnapshot, actor: MutableCombatant, target: MutableCombatant, amount: number, context: SimulationContext): void {
  target.hp = Math.max(0, target.hp - amount);
  emitFact(context, snapshot.revision, "direct_damage", `${target.name} took ${amount} direct damage.`, { actorId: actor.id, targetId: target.id, amount });
  if (target.hp === 0) {
    if (target.side === "heroes") target.downed = true;
    else target.destroyed = true;
  }
}

function selectTargets(snapshot: MutableSnapshot, actor: MutableCombatant, targetRule: EffectDefinition["target"], explicitTargetId: string | undefined, context: SimulationContext): MutableCombatant[] {
  const combatants = combatOf(snapshot).combatants;
  const allies = combatants.filter((entry) => entry.side === actor.side && isAlive(entry) && entry.targetable);
  const enemies = combatants.filter((entry) => entry.side !== actor.side && isAlive(entry) && entry.targetable);
  if (targetRule === "none") return [];
  if (targetRule === "self") return [actor];
  if (targetRule === "ally") return allies.filter((entry) => entry.id === explicitTargetId);
  if (targetRule === "enemy") return enemies.filter((entry) => entry.id === explicitTargetId);
  if (targetRule === "allAllies") return stableSort(allies, (entry) => entry.id, (left, right) => combatOf(snapshot).timeline.indexOf(left.id) - combatOf(snapshot).timeline.indexOf(right.id));
  if (targetRule === "allEnemies" || targetRule === "allCombatants") return stableSort(targetRule === "allEnemies" ? enemies : [...allies, ...enemies], (entry) => entry.id, (left, right) => combatOf(snapshot).timeline.indexOf(left.id) - combatOf(snapshot).timeline.indexOf(right.id));
  const heroes = combatants.filter((entry) => entry.side === "heroes" && isAlive(entry));
  if (heroes.length === 0) return [];
  if (targetRule === "randomLivingHero") return [heroes[drawInt(snapshot, "combatTarget", 0, heroes.length - 1, context)]!];
  if (targetRule === "lowestBlockHero") return [stableSort(heroes, (entry) => entry.id, (left, right) => totalBlock(left) - totalBlock(right))[0]!];
  return [stableSort(heroes, (entry) => entry.id, (left, right) => left.hp - right.hp)[0]!];
}

function resolveEffects(snapshot: MutableSnapshot, actor: MutableCombatant, effects: readonly EffectDefinition[], explicitTargetId: string | undefined, sourceId: string, context: SimulationContext, cardModifiers?: { damageDelta?: number; blockDelta?: number; selfDamage?: number }): void {
  const combat = combatOf(snapshot);
  for (const effect of effects) {
    const targets = selectTargets(snapshot, actor, effect.target, explicitTargetId, context);
    if (effect.kind === "changeRunGloom") {
      const run = runOf(snapshot); const before = run.runGloom; run.runGloom = clamp(before + effect.amount, 0, 100); run.diagnostics.gloomChanges.push({ source: sourceId, before, after: run.runGloom });
      emitFact(context, snapshot.revision, "gloom_changed", `Run Gloom changed by ${effect.amount}.`, { before, after: run.runGloom, source: sourceId });
      continue;
    }
    if (effect.kind === "addExpeditionFlag") { if (!runOf(snapshot).flags.includes(effect.flagId)) runOf(snapshot).flags.push(effect.flagId); continue; }
    if (effect.kind === "createCombatEntity") {
      const entity: MutableCombatant = { id: `${combat.combatId}:${effect.definitionId}`, definitionId: effect.definitionId, name: "Smothering Shroud", side: actor.side, kind: "entity", hp: effect.hp, maxHp: effect.hp, dex: 0, strength: 0, intellect: 0, initiative: 0, itemInitiative: 0, blockLayers: [], conditions: [], burn: [], turnsStarted: 0, turnsCompleted: 0, downed: false, destroyed: false, nextDamageBonus: 0, ownerId: actor.id, targetable: effect.targetable };
      combat.combatants = combat.combatants.filter((entry) => entry.id !== entity.id); combat.combatants.push(entity);
      continue;
    }
    for (const originalTarget of targets) {
      if (!isAlive(originalTarget) && !(effect.kind === "heal" && effect.revive)) continue;
      if (effect.kind === "dealDamage") dealDamage(snapshot, actor, originalTarget, effect.amount + (cardModifiers?.damageDelta ?? 0), effect.scaling, effect.bypassBlock, ["enemy", "ally", "lowestHpHero", "lowestBlockHero", "randomLivingHero"].includes(effect.target), sourceId, context);
      else if (effect.kind === "dealDirectDamage") directDamage(snapshot, actor, originalTarget, effect.amount, context);
      else if (effect.kind === "gainBlock") addBlock(snapshot, originalTarget, effect.amount + (cardModifiers?.blockDelta ?? 0), sourceId, effect.duration);
      else if (effect.kind === "removeBlock") {
        let remaining = effect.amount;
        for (let index = originalTarget.blockLayers.length - 1; index >= 0 && remaining > 0; index -= 1) { const layer = originalTarget.blockLayers[index]!; const removed = Math.min(layer.amount, remaining); layer.amount -= removed; remaining -= removed; }
        originalTarget.blockLayers = originalTarget.blockLayers.filter((layer) => layer.amount > 0);
      }
      else if (effect.kind === "applyCondition") addCondition(originalTarget, effect.conditionId, effect.stacks, effect.duration + (combat.activeCombatantId === originalTarget.id ? 1 : 0));
      else if (effect.kind === "removeCondition") { originalTarget.conditions = originalTarget.conditions.filter((entry) => entry.id !== effect.conditionId); if (effect.conditionId === "burn") originalTarget.burn = []; }
      else if (effect.kind === "createGuard") combat.guards.push({ id: `${sourceId}:${snapshot.revision}`, guardingHeroId: actor.id, protectedHeroId: originalTarget.id, expiresAtGuardTurnStart: actor.turnsStarted + 1, createdAtRevision: snapshot.revision });
      else if (effect.kind === "grantNextDamageBonus") originalTarget.nextDamageBonus += effect.amount;
      else if (effect.kind === "restoreResource") { const resource = combat.heroResources.find((entry) => entry.heroId === originalTarget.id); const hero = runOf(snapshot).heroes.find((entry) => entry.id === originalTarget.id); if (resource !== undefined && hero !== undefined) resource[effect.resource] = Math.min(effect.resource === "mana" ? hero.maxMana : hero.maxStamina, resource[effect.resource] + effect.amount); }
      else if (effect.kind === "heal") { const healed = effect.percentMax ? Math.ceil(originalTarget.maxHp * effect.amount) : effect.amount; originalTarget.hp = Math.min(originalTarget.maxHp, Math.max(effect.revive ? 1 : 0, originalTarget.hp + healed)); if (effect.revive && originalTarget.hp > 0) originalTarget.downed = false; }
      else if (effect.kind === "drawCards") for (let index = 0; index < effect.amount; index += 1) drawOne(snapshot, originalTarget.id, context);
    }
  }
  const selfDamage = cardModifiers?.selfDamage ?? 0;
  if (selfDamage > 0) directDamage(snapshot, actor, actor, selfDamage, context);
}

function expireAtTurnStart(combat: ReturnType<typeof combatOf>, actor: MutableCombatant): void {
  actor.turnsStarted += 1;
  actor.blockLayers = actor.blockLayers.filter((layer) => layer.expiresAtOwnerTurnStart > actor.turnsStarted);
  combat.guards = combat.guards.filter((guard) => !(guard.guardingHeroId === actor.id && guard.expiresAtGuardTurnStart <= actor.turnsStarted));
}

function finishTurn(snapshot: MutableSnapshot, actor: MutableCombatant, context: SimulationContext): void {
  if (actor.burn.length > 0 && isAlive(actor)) {
    const damage = Math.floor(actor.burn.length * 2 * conditionMultiplier(actor, "exposed"));
    directDamage(snapshot, actor, actor, damage, context);
    actor.burn = actor.burn.map((stack) => ({ remainingOwnerTurns: stack.remainingOwnerTurns - 1 })).filter((stack) => stack.remainingOwnerTurns > 0);
  }
  actor.turnsCompleted += 1;
  actor.conditions = actor.conditions.filter((entry) => entry.id === "strain" || entry.expiresAfterCompletedTurn > actor.turnsCompleted);
  if (actor.side === "heroes") {
    for (const card of zoneCards(combatOf(snapshot), actor.id, "hand")) if (!card.retain) card.zone = "discard";
  }
}

function checkOutcome(snapshot: MutableSnapshot): "active" | "victory" | "wipe" {
  const combat = combatOf(snapshot);
  const bossDead = combat.encounterId === "lantern_smother" && combat.combatants.some((entry) => entry.definitionId === "lantern_smother" && entry.destroyed);
  const enemiesAlive = combat.combatants.some((entry) => entry.side === "enemies" && entry.kind === "enemy" && isAlive(entry));
  const heroesAlive = combat.combatants.some((entry) => entry.side === "heroes" && isAlive(entry));
  combat.outcome = !heroesAlive ? "wipe" : bossDead || !enemiesAlive ? "victory" : "active";
  return combat.outcome;
}

function beginCurrentTurn(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): "ready" | "skipped" {
  const combat = combatOf(snapshot);
  const actor = combat.combatants.find((entry) => entry.id === combat.activeCombatantId);
  if (actor === undefined || !isAlive(actor)) return "skipped";
  expireAtTurnStart(combat, actor);
  if (actor.conditions.some((entry) => entry.id === "stun")) {
    actor.conditions = actor.conditions.filter((entry) => entry.id !== "stun");
    return "skipped";
  }
  if (actor.side === "heroes") {
    const resource = combat.heroResources.find((entry) => entry.heroId === actor.id)!;
    const strained = actor.conditions.some((entry) => entry.id === "strain");
    resource.ap = pack.tuning.heroAp - (strained ? 1 : 0);
    actor.conditions = actor.conditions.filter((entry) => entry.id !== "strain");
    refillHand(snapshot, actor.id, pack, context);
  }
  return "ready";
}

function moveCursor(snapshot: MutableSnapshot): void {
  const combat = combatOf(snapshot);
  let next = combat.timelineCursor;
  for (let attempts = 0; attempts < combat.timeline.length; attempts += 1) {
    next = (next + 1) % combat.timeline.length;
    if (next === 0) combat.round += 1;
    const candidate = combat.combatants.find((entry) => entry.id === combat.timeline[next]);
    if (candidate !== undefined && isAlive(candidate) && candidate.kind !== "entity") { combat.timelineCursor = next; combat.activeCombatantId = candidate.id; return; }
  }
}

function executeEnemyTurn(snapshot: MutableSnapshot, pack: ValidatedContentPack, actor: MutableCombatant, context: SimulationContext): void {
  const combat = combatOf(snapshot);
  const definition = findEnemyDefinition(pack, actor);
  const revealed = combat.intents.find((entry) => entry.enemyId === actor.id);
  const intentDefinition = definition.intents.find((entry) => entry.id === revealed?.intentId);
  if (intentDefinition === undefined) throw new Error(`Missing revealed intent for ${actor.id}`);
  resolveEffects(snapshot, actor, intentDefinition.effects, undefined, intentDefinition.id, context);
  if (intentDefinition.id === "circle") actor.nextDamageBonus += 2;
  if (definition.id === "lantern_smother") {
    combat.bossTurn += 1;
    if (intentDefinition.id === "consume_the_light") {
      const shroud = combat.combatants.find((entry) => entry.definitionId === "smothering_shroud" && !entry.destroyed);
      if (shroud !== undefined) shroud.destroyed = true;
      runOf(snapshot).diagnostics.shroudOutcome = "survived";
    }
  }
  finishTurn(snapshot, actor, context);
  if (checkOutcome(snapshot) === "active") revealIntent(snapshot, actor, definition, context, intentDefinition.forcesNextIntentId);
}

function advanceUntilHero(snapshot: MutableSnapshot, pack: ValidatedContentPack, context: SimulationContext): void {
  while (checkOutcome(snapshot) === "active") {
    const combat = combatOf(snapshot);
    const actor = combat.combatants.find((entry) => entry.id === combat.activeCombatantId);
    if (actor !== undefined && isAlive(actor)) {
      const turn = beginCurrentTurn(snapshot, pack, context);
      if (turn === "skipped") {
        finishTurn(snapshot, actor, context);
        if (checkOutcome(snapshot) !== "active") return;
        moveCursor(snapshot);
        continue;
      }
      if (actor.side === "heroes") return;
      executeEnemyTurn(snapshot, pack, actor, context);
      if (checkOutcome(snapshot) !== "active") return;
      moveCursor(snapshot);
      continue;
    }
    if (checkOutcome(snapshot) !== "active") return;
    moveCursor(snapshot);
  }
}

export function startCombat(snapshot: MutableSnapshot, pack: ValidatedContentPack, encounterId: string, context: SimulationContext): void {
  const run = runOf(snapshot);
    const encounter = encounterId === "lantern_smother" ? undefined : pack.encounters.find((entry) => entry.id === encounterId);
    const enemyDefinitionIds = encounterId === "lantern_smother" ? ["lantern_smother"] : encounter?.enemyIds;
    if (enemyDefinitionIds === undefined) throw new Error(`Unknown encounter ${encounterId}`);
    const enemyEntries = enemyDefinitionIds.map((definitionId, index) => ({ id: `${definitionId}_${index + 1}`, definitionId }));
    const carrier = encounterId === "lantern_smother" ? undefined : maybeCreateCarrier(snapshot, pack, enemyEntries, encounterId, context);
    if (carrier !== undefined) run.holdings.push(carrier as DeepMutable<ItemInstance>);
    const combatants: MutableCombatant[] = [];
    for (const hero of run.heroes) {
      const initiativeBonus = itemInitiative(hero, run.holdings);
      const variance = drawInt(snapshot, "combatInitiative", pack.tuning.initiativeVariance.min, pack.tuning.initiativeVariance.max, context);
      combatants.push(combatantFromHero(hero, hero.attributes.dex * 2 + initiativeBonus + variance, initiativeBonus));
    }
    for (const entry of enemyEntries) {
      const definition = pack.enemies.find((candidate) => candidate.id === entry.definitionId)!;
      const carried = carrier?.location.kind === "carried_by_enemy" && carrier.location.enemyId === entry.id ? carrier : undefined;
      const initiativeBonus = carried?.mechanicSnapshot.initiativeDelta ?? 0;
      const variance = drawInt(snapshot, "combatInitiative", pack.tuning.initiativeVariance.min, pack.tuning.initiativeVariance.max, context);
      combatants.push(combatantFromEnemy(definition, entry.id, definition.dex * 2 + initiativeBonus + variance, initiativeBonus, carried?.instanceId));
    }
    const sorted = stableSort(combatants, (entry) => entry.id, (left, right) => right.initiative - left.initiative);
    const cards = run.heroes.flatMap((hero) => buildHeroCards(snapshot, pack, hero, context));
    run.combat = {
      combatId: `${run.runId}:${encounterId}:${run.visitedNodeIds.length}`,
      encounterId,
      round: 1,
      timeline: sorted.map((entry) => entry.id),
      timelineCursor: 0,
      activeCombatantId: sorted[0]!.id,
      combatants: sorted,
      heroResources: run.heroes.map((hero) => ({ heroId: hero.id, ap: 0, mana: hero.mana, stamina: hero.stamina })),
      cards,
      basicActions: run.heroes.map((hero) => {
        const classDefinition = pack.classes.find((entry) => entry.id === hero.classId)!;
        const attack = pack.cards.find((entry) => entry.id === classDefinition.basicActionIds[0])!;
        const basicBlock = pack.cards.find((entry) => entry.id === classDefinition.basicActionIds[1])!;
        const attackFlat = equippedCardDamageFlat(snapshot, hero.id, attack);
        return {
          heroId: hero.id,
          attack: { definitionId: attack.id, name: attack.display.name, apCost: attack.cost.ap, targetSpec: "enemy" as const, summary: effectSummary(attack, { strength: hero.attributes.str, intellect: hero.attributes.int }, { damageDelta: attackFlat }) },
          block: { definitionId: basicBlock.id, name: basicBlock.display.name, apCost: basicBlock.cost.ap, targetSpec: "self" as const, summary: effectSummary(basicBlock, { strength: hero.attributes.str, intellect: hero.attributes.int }) }
        };
      }),
      intents: [],
      guards: [],
      supplyUsed: false,
      retainRefillUsedHeroIds: [],
      bossTurn: 0,
      outcome: "active"
    };
    for (const enemyCombatant of sorted.filter((entry) => entry.side === "enemies")) revealIntent(snapshot, enemyCombatant, findEnemyDefinition(pack, enemyCombatant), context);
    if (run.runGloom >= 40) for (const enemyCombatant of sorted.filter((entry) => entry.side === "enemies")) addBlock(snapshot, enemyCombatant, pack.tuning.gloomTouchedBlock, "gloom_touched", "ownerSecondTurn");
    if (run.runGloom >= 90) for (const hero of sorted.filter((entry) => entry.side === "heroes")) addCondition(hero, "strain", 1, 99);
    else if (run.runGloom >= 70) {
      const heroes = sorted.filter((entry) => entry.side === "heroes");
      addCondition(heroes[drawInt(snapshot, "combatTarget", 0, heroes.length - 1, context)]!, "strain", 1, 99);
    }
    if (run.flags.includes("next_combat_block")) {
      for (const hero of sorted.filter((entry) => entry.side === "heroes")) addBlock(snapshot, hero, 3, "event_start_block", "ownerNextTurn");
      run.flags = run.flags.filter((flag) => flag !== "next_combat_block");
    }
    if (run.flags.includes("next_combat_exposed")) {
      for (const hero of sorted.filter((entry) => entry.side === "heroes")) addCondition(hero, "exposed", 1, 1);
      run.flags = run.flags.filter((flag) => flag !== "next_combat_exposed");
    }
    if (run.flags.includes("next_combat_one_strain")) {
      const heroes = sorted.filter((entry) => entry.side === "heroes");
      addCondition(heroes[drawInt(snapshot, "combatTarget", 0, heroes.length - 1, context)]!, "strain", 1, 99);
      run.flags = run.flags.filter((flag) => flag !== "next_combat_one_strain");
    }
    for (const hero of sorted.filter((entry) => entry.side === "heroes")) {
      const flag = `next_block_${hero.id}`;
      if (run.flags.includes(flag)) { addBlock(snapshot, hero, 3, "rest_keep_watch", "ownerNextTurn"); run.flags = run.flags.filter((entry) => entry !== flag); }
    }
    emitFact(context, snapshot.revision, "combat_started", `${encounterId.replaceAll("_", " ")} began.`, { encounterId, timelineSize: sorted.length, markedCarrier: carrier !== undefined });
  advanceUntilHero(snapshot, pack, context);
}

function activeHero(snapshot: MutableSnapshot, actorId: string | undefined): { actor: MutableCombatant; resource: DeepMutable<{ heroId: string; ap: number; mana: number; stamina: number }> } | ReasonCode {
  const combat = combatOf(snapshot);
  const actor = combat.combatants.find((entry) => entry.id === actorId);
  if (actor === undefined || actor.side !== "heroes" || !isAlive(actor)) return "invalid_actor";
  if (combat.activeCombatantId !== actor.id) return "not_players_turn";
  const resource = combat.heroResources.find((entry) => entry.heroId === actor.id);
  if (resource === undefined) return "invalid_actor";
  return { actor, resource };
}

function validateTarget(snapshot: MutableSnapshot, actor: MutableCombatant, targetSpec: EffectDefinition["target"], targetId: string | undefined, context: SimulationContext): boolean {
  if (["enemy", "ally"].includes(targetSpec)) return selectTargets(snapshot, actor, targetSpec, targetId, context).length === 1;
  return targetId === undefined || selectTargets(snapshot, actor, targetSpec, targetId, context).length > 0 || targetSpec === "none";
}

function playDefinition(snapshot: MutableSnapshot, actor: MutableCombatant, resource: { ap: number; mana: number; stamina: number }, definition: CardDefinition, targetId: string | undefined, context: SimulationContext, instance?: MutableCard): ReasonCode | undefined {
  const costDelta = instance?.costDelta ?? 0;
  const manaCost = definition.cost.mana > 0 ? definition.cost.mana + costDelta : 0;
  const staminaCost = definition.cost.stamina > 0 ? definition.cost.stamina + costDelta : 0;
  if (resource.ap < definition.cost.ap) return "insufficient_ap";
  if (resource.mana < manaCost || resource.stamina < staminaCost) return "insufficient_resource";
  if (!validateTarget(snapshot, actor, definition.targetSpec, targetId, context)) return "invalid_target";
  resource.ap -= definition.cost.ap; resource.mana -= manaCost; resource.stamina -= staminaCost;
  resolveEffects(snapshot, actor, definition.effects, targetId, definition.id, context, {
    damageDelta: (instance?.damageDelta ?? 0) + equippedCardDamageFlat(snapshot, actor.id, definition),
    blockDelta: instance?.blockDelta ?? 0,
    selfDamage: instance?.selfDamage ?? 0
  });
  if (instance !== undefined) instance.zone = instance.exhaust || definition.disposition === "exhaust" ? "exhaust" : "discard";
  runOf(snapshot).diagnostics.cardsPlayed += instance === undefined ? 0 : 1;
  if (definition.alwaysAvailable) runOf(snapshot).diagnostics.basicActions += 1;
  emitFact(context, snapshot.revision, "card_played", `${actor.name} used ${definition.display.name}.`, { actorId: actor.id, cardId: definition.id, targetId: targetId ?? null });
  return undefined;
}

export function applyCombatCommand(snapshot: MutableSnapshot, command: CommandEnvelope, pack: ValidatedContentPack, context: SimulationContext): ReasonCode | undefined {
  const combat = combatOf(snapshot);
    if (combat.outcome !== "active") return "invalid_phase";
    const active = activeHero(snapshot, command.actorId);
    if (typeof active === "string") return active;
    const targetId = typeof command.payload.targetId === "string" ? command.payload.targetId : undefined;
    if (command.type === "playCard") {
      const instanceId = typeof command.payload.cardInstanceId === "string" ? command.payload.cardInstanceId : "";
      const cardInstance = combat.cards.find((entry) => entry.cardInstanceId === instanceId && entry.ownerId === active.actor.id && entry.zone === "hand");
      if (cardInstance === undefined) return "item_unavailable";
      const definition = pack.cards.find((entry) => entry.id === cardInstance.definitionId);
      if (definition === undefined) return "unknown_content_id";
      const reason = playDefinition(snapshot, active.actor, active.resource, definition, targetId, context, cardInstance);
      if (reason !== undefined) return reason;
    } else if (command.type === "useBasicAttack" || command.type === "useBasicBlock") {
      const hero = runOf(snapshot).heroes.find((entry) => entry.id === active.actor.id)!;
      const classDefinition = pack.classes.find((entry) => entry.id === hero.classId)!;
      const definitionId = classDefinition.basicActionIds[command.type === "useBasicAttack" ? 0 : 1]!;
      const definition = pack.cards.find((entry) => entry.id === definitionId)!;
      const reason = playDefinition(snapshot, active.actor, active.resource, definition, targetId, context);
      if (reason !== undefined) return reason;
    } else if (command.type === "useSupply") {
      if (combat.supplyUsed) return "item_unavailable";
      if (active.resource.ap < 1) return "insufficient_ap";
      const itemId = typeof command.payload.itemId === "string" ? command.payload.itemId : "";
      const item = runOf(snapshot).holdings.find((entry) => entry.instanceId === itemId && entry.itemKind === "supply" && entry.location.kind === "held_by_expedition");
      const target = combat.combatants.find((entry) => entry.id === targetId && entry.side === "heroes" && isAlive(entry));
      if (item === undefined) return "item_unavailable";
      if (target === undefined) return "invalid_target";
      active.resource.ap -= 1; combat.supplyUsed = true; item.location = { kind: "consumed" };
      const targetResource = combat.heroResources.find((entry) => entry.heroId === target.id)!;
      const hero = runOf(snapshot).heroes.find((entry) => entry.id === target.id)!;
      if (item.definitionId === "mana_phial" || item.definitionId === "ash_tonic") targetResource.mana = Math.min(hero.maxMana, targetResource.mana + (item.definitionId === "mana_phial" ? 4 : 2));
      if (item.definitionId === "stamina_draught" || item.definitionId === "ash_tonic") targetResource.stamina = Math.min(hero.maxStamina, targetResource.stamina + (item.definitionId === "stamina_draught" ? 4 : 2));
      if (item.definitionId === "ash_tonic") directDamage(snapshot, active.actor, target, 1, context);
    } else if (command.type === "endTurn") {
      finishTurn(snapshot, active.actor, context);
      moveCursor(snapshot);
      advanceUntilHero(snapshot, pack, context);
    } else return "invalid_command";
    checkOutcome(snapshot);
  return undefined;
}

export function syncHeroesFromCombat(snapshot: MutableSnapshot): void {
  const run = runOf(snapshot); const combat = combatOf(snapshot);
  for (const hero of run.heroes) {
    const combatant = combat.combatants.find((entry) => entry.id === hero.id)!;
    const resource = combat.heroResources.find((entry) => entry.heroId === hero.id)!;
    hero.hp = combatant.hp; hero.downed = combatant.downed; hero.mana = resource.mana; hero.stamina = resource.stamina;
  }
}

export function reviveForFixture(snapshot: MutableSnapshot, heroId: string, hp: number): void {
  const combatant = combatOf(snapshot).combatants.find((entry) => entry.id === heroId);
  if (combatant === undefined || combatant.side !== "heroes" || !combatant.downed) throw new Error("Only a Downed hero can be revived");
  combatant.hp = Math.max(1, Math.min(combatant.maxHp, hp)); combatant.downed = false;
}

export function refillForFixture(snapshot: MutableSnapshot, heroId: string, pack: ValidatedContentPack, context: SimulationContext): void {
  refillHand(snapshot, heroId, pack, context);
}

export function totalBlockForFixture(snapshot: MutableSnapshot, combatantId: string): number {
  const combatant = combatOf(snapshot).combatants.find((entry) => entry.id === combatantId);
  return combatant === undefined ? 0 : totalBlock(combatant);
}
