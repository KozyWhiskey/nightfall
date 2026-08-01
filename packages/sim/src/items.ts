import type { ItemInstance, ItemLocation, ItemMechanicSnapshot } from "@nightfall/contracts";
import type { CardDefinition, EffectDefinition, ItemDefinition, ValidatedContentPack } from "@nightfall/content";

const rarityOrder = ["salvaged", "imbued", "rare", "legendary"] as const;

const passiveLabels: Record<string, string> = {
  retain_refill: "While equipped: once per combat, your first Retained card stays in hand without reducing next turn's draw",
  combat_start_draw: "While equipped: draw 1 extra card at the start of combat",
  spell_damage_flat: "While equipped: +1 damage on spell cards",
  max_stamina: "While equipped: +1 max Stamina",
  item_initiative: "While equipped: +1 initiative",
  max_hp: "While equipped: +3 max HP",
  basic_attack_damage: "While equipped: +1 damage on basic attacks"
};

const modifierLabels: Record<string, string> = {
  initiative_plus_1: "+1 initiative",
  max_secondary_plus_1: "+1 max Stamina",
  spell_damage_plus_1: "+1 spell damage",
  card_block_plus_2: "+2 Block on the granted card",
  first_block_plus_2: "+2 Block on the first Block each combat",
  retain: "Granted card retains",
  secondary_cost_plus_1: "+1 secondary resource cost on the granted card",
  exhaust: "Granted card exhausts",
  self_damage_1: "Granted card deals 1 self damage",
  card_burn: "Granted card applies burn",
  exposed_damage_plus_2: "+2 damage vs Exposed",
  guard_self_block: "Guard also grants self Block",
  first_burn_plus_1: "+1 stack on first burn applied",
  exposed_resource_discount: "Discount vs Exposed targets",
  retained_resource_discount: "Discount while retaining",
  basic_block_plus_1: "+1 Block on basic block",
  combat_start_draw: "Draw 1 at combat start",
  ally_downed_block: "Gain Block when an ally is Downed",
  gloom_increase_reduction: "Reduce Run Gloom gains",
  guard_ally_block: "Guard grants ally Block",
  burned_enemy_damage_minus_1: "Burned enemies deal less",
  exposed_draw: "Draw when applying Exposed",
  hybrid: "Hybrid craft result",
  imprint: "Imprint craft result",
  improvement: "Improved craft result",
  overdrawn: "Curse: Overdrawn",
  frayed: "Curse: Frayed",
  hollow: "Curse: Hollow"
};

function mechanicsFor(baseId: string, grantedCardId: string | undefined, modifiers: readonly string[], passiveIds: readonly string[] = []): ItemMechanicSnapshot {
  const passive: ItemMechanicSnapshot = {
    modifiers: [...new Set([...modifiers, ...passiveIds])],
    ...(grantedCardId === undefined ? {} : { grantedCardId })
  };
  const withBase = { ...passive } as {
    modifiers: string[];
    grantedCardId?: string;
    secondaryCostDelta?: number;
    damageDelta?: number;
    blockDelta?: number;
    initiativeDelta?: number;
    maxHpDelta?: number;
    maxManaDelta?: number;
    maxStaminaDelta?: number;
    retain?: boolean;
    exhaust?: boolean;
    selfDamage?: number;
  };
  if (baseId === "emberglass_cowl") withBase.initiativeDelta = 1;
  if (baseId === "wayfarers_coat") withBase.maxHpDelta = 3;
  if (baseId === "pilgrims_knot") withBase.maxStaminaDelta = 1;
  if (baseId === "cracked_way_lens") withBase.damageDelta = 1;
  for (const modifier of modifiers) {
    if (modifier === "initiative_plus_1") withBase.initiativeDelta = (withBase.initiativeDelta ?? 0) + 1;
    if (modifier === "max_secondary_plus_1") withBase.maxStaminaDelta = (withBase.maxStaminaDelta ?? 0) + 1;
    if (modifier === "spell_damage_plus_1") withBase.damageDelta = (withBase.damageDelta ?? 0) + 1;
    if (modifier === "card_block_plus_2" || modifier === "first_block_plus_2") withBase.blockDelta = (withBase.blockDelta ?? 0) + 2;
    if (modifier === "retain") withBase.retain = true;
    if (modifier === "secondary_cost_plus_1") withBase.secondaryCostDelta = 1;
    if (modifier === "exhaust") withBase.exhaust = true;
    if (modifier === "self_damage_1") withBase.selfDamage = 1;
  }
  return withBase;
}

function effectLine(effect: EffectDefinition): string {
  if (effect.kind === "dealDamage") {
    const bypass = effect.bypassBlock ? " (ignores Block)" : "";
    if (effect.scaling === "none") return `Deal ${effect.amount} ${effect.damageType} damage${bypass}`;
    const stat = effect.scaling === "strength" ? "Strength" : "Intellect";
    if (effect.amount === 0) return `Deal ${effect.damageType} damage equal to ${stat}${bypass}`;
    return `Deal ${effect.amount} + ${stat} ${effect.damageType} damage${bypass}`;
  }
  if (effect.kind === "gainBlock") return `Gain ${effect.amount} Block${effect.target === "ally" ? " on an ally" : effect.target === "allAllies" ? " on all allies" : ""}`;
  if (effect.kind === "applyCondition") return `Apply ${effect.stacks} ${effect.conditionId}`;
  if (effect.kind === "removeBlock") return `Remove ${effect.amount} Block`;
  if (effect.kind === "createGuard") return "Guard the chosen ally until your next turn";
  if (effect.kind === "grantRetain") return "Retain 1 card";
  if (effect.kind === "drawCards") return `Draw ${effect.amount}`;
  if (effect.kind === "heal") return effect.percentMax ? `Heal ${Math.round(effect.amount * 100)}% max HP` : `Heal ${effect.amount}`;
  if (effect.kind === "restoreResource") return `Restore ${effect.amount} ${effect.resource}`;
  if (effect.kind === "grantNextDamageBonus") return `Next hit deals +${effect.amount}`;
  return effect.kind.replaceAll(/([A-Z])/g, " $1").toLowerCase();
}

function cardCostLine(card: CardDefinition): string {
  return [
    `${card.cost.ap} AP`,
    card.cost.mana > 0 ? `${card.cost.mana} Mana` : undefined,
    card.cost.stamina > 0 ? `${card.cost.stamina} Stamina` : undefined
  ].filter(Boolean).join(" · ");
}

function cardEffectSummary(card: CardDefinition): string {
  return card.effects.map(effectLine).join("; ");
}

function buildDisplayDescription(
  pack: ValidatedContentPack,
  definition: ItemDefinition,
  mechanics: ItemMechanicSnapshot
): string {
  if (definition.itemKind === "supply") return definition.display.description;

  const lines: string[] = [];
  const grantedId = mechanics.grantedCardId ?? definition.grantedCardId;
  if (grantedId !== undefined) {
    const card = pack.cards.find((entry) => entry.id === grantedId);
    if (card !== undefined) {
      const summary = `${card.display.name} · ${cardCostLine(card)} — ${cardEffectSummary(card)}`;
      lines.push(definition.itemKind === "scroll" ? `Learn ${summary}` : `Adds to deck: ${summary}`);
    } else {
      lines.push(definition.itemKind === "scroll" ? `Learn ${grantedId}` : `Adds ${grantedId} to deck`);
    }
  }

  for (const passiveId of definition.passiveIds) {
    if (passiveId === "retain_refill") {
      lines.push("While equipped: once per combat, your first Retained card stays in hand without reducing next turn's draw.");
      lines.push("Retain keeps a card between turns; normally that fills a slot in your 3-card hand, so you draw fewer.");
      lines.push("Only helps if you already have a card with Retain (some gear and affixes grant it).");
      continue;
    }
    const label = passiveLabels[passiveId] ?? passiveId.replaceAll("_", " ");
    if (!lines.some((line) => line.toLowerCase().includes(label.toLowerCase()))) lines.push(label);
  }

  if ((mechanics.maxHpDelta ?? 0) > 0) lines.push(`+${mechanics.maxHpDelta} max HP while equipped`);
  if ((mechanics.maxManaDelta ?? 0) > 0) lines.push(`+${mechanics.maxManaDelta} max Mana while equipped`);
  if ((mechanics.maxStaminaDelta ?? 0) > 0) lines.push(`+${mechanics.maxStaminaDelta} max Stamina while equipped`);
  if ((mechanics.initiativeDelta ?? 0) > 0) lines.push(`+${mechanics.initiativeDelta} initiative while equipped`);
  if ((mechanics.damageDelta ?? 0) > 0 && grantedId !== undefined) lines.push(`+${mechanics.damageDelta} damage on the granted card`);
  if ((mechanics.blockDelta ?? 0) > 0 && grantedId !== undefined) lines.push(`+${mechanics.blockDelta} Block on the granted card`);
  if (mechanics.retain) lines.push("Granted card retains");
  if (mechanics.exhaust) lines.push("Granted card exhausts");
  if ((mechanics.selfDamage ?? 0) > 0) lines.push(`Granted card deals ${mechanics.selfDamage} self damage`);
  if ((mechanics.secondaryCostDelta ?? 0) > 0) lines.push(`+${mechanics.secondaryCostDelta} secondary cost on the granted card`);

  for (const modifier of mechanics.modifiers) {
    const label = modifierLabels[modifier] ?? modifier.replaceAll("_", " ");
    if (!lines.some((line) => line.toLowerCase().includes(label.toLowerCase()))) lines.push(label);
  }

  if (definition.itemKind === "scroll") {
    lines.push("Physical scroll is consumed to learn; permanence after successful Return.");
  }

  return lines.length > 0 ? lines.join("\n") : definition.display.description;
}

export function enrichItemDisplay(pack: ValidatedContentPack, item: ItemInstance): ItemInstance {
  const definition = pack.items.find((entry) => entry.id === item.definitionId);
  if (definition === undefined) return item;
  const mechanicSnapshot: ItemMechanicSnapshot = {
    ...item.mechanicSnapshot,
    modifiers: [...new Set([...item.mechanicSnapshot.modifiers, ...definition.passiveIds])],
    ...(definition.itemKind === "equipment" && definition.slot !== undefined ? { equipmentSlot: definition.slot } : {}),
    ...(definition.requiredSchools.length > 0 ? { requiredSchools: [...definition.requiredSchools] } : {})
  };
  return {
    ...item,
    mechanicSnapshot,
    displaySnapshot: {
      ...item.displaySnapshot,
      description: buildDisplayDescription(pack, definition, mechanicSnapshot)
    }
  };
}

export function createItemInstance(
  pack: ValidatedContentPack,
  definitionId: string,
  rarityId: ItemInstance["rarityId"],
  seed: number,
  instanceId: string,
  location: ItemLocation,
  affixIds: readonly string[] = []
): ItemInstance {
  const definition = pack.items.find((entry) => entry.id === definitionId);
  if (definition === undefined) throw new Error(`Unknown item definition ${definitionId}`);
  const selectedAffixes = affixIds.map((id) => pack.affixes.find((entry) => entry.id === id)).filter((entry) => entry !== undefined);
  const prefixes = selectedAffixes.filter((entry) => entry.affixKind === "prefix").map((entry) => entry.id);
  const suffixes = selectedAffixes.filter((entry) => entry.affixKind === "suffix").map((entry) => entry.id);
  const curse = selectedAffixes.find((entry) => entry.affixKind === "curse");
  const signature = selectedAffixes.find((entry) => entry.affixKind === "signature");
  const modifiers = selectedAffixes.flatMap((entry) => entry.modifiers);
  const affixName = [selectedAffixes.find((entry) => entry.affixKind === "prefix")?.display.name, definition.display.name, selectedAffixes.find((entry) => entry.affixKind === "suffix")?.display.name].filter(Boolean).join(" ");
  const mechanicSnapshot: ItemMechanicSnapshot = {
    ...mechanicsFor(definitionId, definition.grantedCardId, modifiers, definition.passiveIds),
    ...(definition.itemKind === "equipment" && definition.slot !== undefined ? { equipmentSlot: definition.slot } : {}),
    ...(definition.requiredSchools.length > 0 ? { requiredSchools: [...definition.requiredSchools] } : {})
  };
  return {
    instanceId,
    definitionId,
    itemKind: definition.itemKind,
    generationVersion: pack.contentVersion,
    seed: seed >>> 0,
    rarityId,
    prefixIds: prefixes,
    suffixIds: suffixes,
    ...(curse === undefined ? {} : { curseId: curse.id }),
    ...(signature === undefined ? {} : { signatureId: signature.id }),
    mechanicSnapshot,
    displaySnapshot: {
      name: affixName || definition.display.name,
      description: buildDisplayDescription(pack, definition, mechanicSnapshot)
    },
    location
  };
}

export function rarityFromUnit(value: number, minimum: ItemInstance["rarityId"] = "salvaged"): ItemInstance["rarityId"] {
  const minimumIndex = rarityOrder.indexOf(minimum);
  const result = value < 0.05 ? "legendary" : value < 0.2 ? "rare" : value < 0.5 ? "imbued" : "salvaged";
  return rarityOrder[Math.max(minimumIndex, rarityOrder.indexOf(result))]!;
}

export function itemSlotForDefinition(pack: ValidatedContentPack, definitionId: string): "mainHand" | "offHand" | "head" | "body" | "gloves" | "legs" | "feet" | "relic1" | "relic2" | undefined {
  const slot = pack.items.find((entry) => entry.id === definitionId)?.slot;
  if (slot === "relic") return "relic1";
  return slot;
}
