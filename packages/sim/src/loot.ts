import type { ItemInstance } from "@nightfall/contracts";
import type { AffixDefinition, ItemDefinition, ValidatedContentPack } from "@nightfall/content";

/** Curated Legendary templates from the Build 1 content registry. */
const LEGENDARY_TEMPLATES: readonly { readonly bases: readonly string[]; readonly signatureId: string }[] = [
  { bases: ["kite_shield", "way_lantern_buckler"], signatureId: "vigils_promise" },
  { bases: ["aether_rod", "cinder_scepter"], signatureId: "cinder_scar" },
  { bases: ["gloomwood_spear"], signatureId: "hounds_pursuit" }
];

export function legendaryEligibleDefinitionIds(): string[] {
  return [...new Set(LEGENDARY_TEMPLATES.flatMap((entry) => entry.bases))];
}

export function signatureForDefinition(definitionId: string): string | undefined {
  return LEGENDARY_TEMPLATES.find((entry) => entry.bases.includes(definitionId))?.signatureId;
}

function pickUniform<T>(entries: readonly T[], drawUnit: () => number): T {
  if (entries.length === 0) throw new Error("Cannot pick from an empty affix pool");
  const index = Math.min(entries.length - 1, Math.floor(drawUnit() * entries.length));
  return entries[index]!;
}

function grantedCardContext(pack: ValidatedContentPack, item: ItemDefinition) {
  const card = item.grantedCardId === undefined ? undefined : pack.cards.find((entry) => entry.id === item.grantedCardId);
  const tags = card === undefined ? [] : [card.kind];
  const hasSecondary = card !== undefined && (card.cost.mana > 0 || card.cost.stamina > 0);
  return { card, tags, hasSecondary };
}

function isCompatible(
  pack: ValidatedContentPack,
  item: ItemDefinition,
  affix: AffixDefinition,
  selected: readonly AffixDefinition[]
): boolean {
  if (affix.requiresGrantedCard && item.grantedCardId === undefined) return false;
  const { card, tags, hasSecondary } = grantedCardContext(pack, item);
  if (affix.requiredTags.some((tag) => !tags.includes(tag))) return false;
  if (affix.incompatibleIds.includes(item.id)) return false;
  if (affix.incompatibleIds.some((id) => selected.some((entry) => entry.id === id))) return false;
  if (selected.some((entry) => entry.incompatibleIds.includes(affix.id))) return false;
  if (affix.id === "overdrawn" && !hasSecondary) return false;
  if ((affix.id === "frayed" || affix.id === "hollow" || affix.id === "overdrawn") && card === undefined) return false;

  const selectedAndCandidate = [...selected, affix];
  const handModules = selectedAndCandidate.filter((entry) =>
    entry.modifiers.some((modifier) => modifier.includes("draw") || modifier.includes("retain"))
  );
  if (handModules.length > 1) return false;

  const itemHasDrawPassive = item.passiveIds.some((id) => id.includes("draw") || id.includes("retain"));
  if (itemHasDrawPassive && affix.modifiers.some((modifier) => modifier.includes("draw") || modifier.includes("retain"))) return false;

  return true;
}

function poolFor(
  pack: ValidatedContentPack,
  item: ItemDefinition,
  kind: AffixDefinition["affixKind"],
  selected: readonly AffixDefinition[]
): AffixDefinition[] {
  return pack.affixes.filter((entry) => entry.affixKind === kind && isCompatible(pack, item, entry, selected));
}

/**
 * Rolls prefix/suffix/curse/signature IDs for a gear vessel per content-registry Affix allocation.
 * `drawUnit` must consume the named `loot` stream (0..1).
 */
export function rollGearAffixIds(
  pack: ValidatedContentPack,
  definitionId: string,
  rarityId: ItemInstance["rarityId"],
  drawUnit: () => number,
  extraAffixIds: readonly string[] = []
): string[] {
  const item = pack.items.find((entry) => entry.id === definitionId);
  if (item === undefined) throw new Error(`Unknown item definition ${definitionId}`);
  if (item.itemKind !== "equipment" || rarityId === "salvaged") return [...extraAffixIds];

  const selected: AffixDefinition[] = [];
  const pushId = (id: string | undefined) => {
    if (id === undefined) return;
    const affix = pack.affixes.find((entry) => entry.id === id);
    if (affix === undefined) return;
    if (!isCompatible(pack, item, affix, selected)) return;
    selected.push(affix);
  };

  for (const id of extraAffixIds) pushId(id);

  if (rarityId === "legendary") {
    pushId(signatureForDefinition(definitionId));
  }

  const hasPrefix = () => selected.some((entry) => entry.affixKind === "prefix");
  const hasSuffix = () => selected.some((entry) => entry.affixKind === "suffix");

  if (rarityId === "imbued") {
    if (!hasPrefix() && !hasSuffix()) {
      const wantPrefix = drawUnit() < 0.7;
      const kind = wantPrefix ? "prefix" : "suffix";
      const pool = poolFor(pack, item, kind, selected);
      if (pool.length > 0) selected.push(pickUniform(pool, drawUnit));
      else {
        const fallback = poolFor(pack, item, wantPrefix ? "suffix" : "prefix", selected);
        if (fallback.length > 0) selected.push(pickUniform(fallback, drawUnit));
      }
    }
  } else if (rarityId === "rare" || rarityId === "legendary") {
    if (!hasPrefix()) {
      const prefixes = poolFor(pack, item, "prefix", selected);
      if (prefixes.length > 0) selected.push(pickUniform(prefixes, drawUnit));
    }
    if (!hasSuffix()) {
      const suffixes = poolFor(pack, item, "suffix", selected);
      if (suffixes.length > 0) selected.push(pickUniform(suffixes, drawUnit));
    }
    const curseChance = rarityId === "legendary" ? 0.25 : 0.15;
    const upside = selected.filter((entry) => entry.affixKind !== "curse");
    if (upside.length > 0 && !selected.some((entry) => entry.affixKind === "curse") && drawUnit() < curseChance) {
      const curses = poolFor(pack, item, "curse", selected);
      if (curses.length > 0) selected.push(pickUniform(curses, drawUnit));
    }
  }

  return selected.map((entry) => entry.id);
}
