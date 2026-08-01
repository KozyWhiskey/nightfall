import type { DeckCardPreviewSnapshot, HeroSnapshot, ItemInstance } from "@nightfall/contracts";
import type { ValidatedContentPack } from "@nightfall/content";
import { effectSummary } from "./combat.js";

function sourceLabel(sourceId: string, item: ItemInstance | undefined, classId: string): string {
  if (sourceId.startsWith("class:")) return "Class pattern";
  if (sourceId.startsWith("learned:")) return "Learned pattern";
  if (item !== undefined) return item.displaySnapshot.name;
  return classId === "vanguard" ? "Vanguard kit" : "Weaver kit";
}

export function buildHeroDeckPreview(
  pack: ValidatedContentPack,
  hero: HeroSnapshot,
  holdings: readonly ItemInstance[]
): DeckCardPreviewSnapshot[] {
  const classDefinition = pack.classes.find((entry) => entry.id === hero.classId);
  if (classDefinition === undefined) return [];

  const sources: { definitionId: string; sourceId: string; item?: ItemInstance }[] =
    classDefinition.classCardIds.map((definitionId) => ({ definitionId, sourceId: `class:${hero.classId}` }));

  for (const definitionId of [...hero.learnedCardIds, ...hero.runLearnedCardIds].sort()) {
    sources.push({ definitionId, sourceId: `learned:${definitionId}` });
  }

  const slotOrder = ["mainHand", "offHand", "head", "body", "gloves", "legs", "feet", "relic1", "relic2"] as const;
  for (const slot of slotOrder) {
    const itemId = hero.equipment[slot];
    if (itemId === null) continue;
    const item = holdings.find((entry) => entry.instanceId === itemId);
    const definitionId = item?.mechanicSnapshot.grantedCardId;
    if (item !== undefined && definitionId !== undefined) {
      sources.push({ definitionId, sourceId: item.instanceId, item });
    }
  }

  return sources.flatMap(({ definitionId, sourceId, item }) => {
    const definition = pack.cards.find((entry) => entry.id === definitionId);
    if (definition === undefined) return [];
    const costDelta = item?.mechanicSnapshot.secondaryCostDelta ?? 0;
    return [{
      cardId: definitionId,
      name: definition.display.name,
      apCost: definition.cost.ap,
      manaCost: definition.cost.mana > 0 ? definition.cost.mana + costDelta : 0,
      staminaCost: definition.cost.stamina > 0 ? definition.cost.stamina + costDelta : 0,
      summary: effectSummary(definition, { strength: hero.attributes.str, intellect: hero.attributes.int }, {
        damageDelta: item?.mechanicSnapshot.damageDelta ?? 0,
        blockDelta: item?.mechanicSnapshot.blockDelta ?? 0
      }),
      sourceLabel: sourceLabel(sourceId, item, hero.classId)
    }];
  });
}
