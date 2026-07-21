import type { ItemInstance, ItemLocation, ItemMechanicSnapshot } from "@nightfall/contracts";
import type { ValidatedContentPack } from "@nightfall/content";

const rarityOrder = ["salvaged", "imbued", "rare", "legendary"] as const;

function mechanicsFor(baseId: string, grantedCardId: string | undefined, modifiers: readonly string[]): ItemMechanicSnapshot {
  const passive: ItemMechanicSnapshot = {
    modifiers: [...modifiers],
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
    mechanicSnapshot: mechanicsFor(definitionId, definition.grantedCardId, modifiers),
    displaySnapshot: { name: affixName || definition.display.name, description: definition.display.description },
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
