import type { GameSnapshot, ItemInstance, ResolvedFact } from "@nightfall/contracts";
import { titleCase } from "./decisionUi.js";
import { rarityGlyph } from "./rewardUi.js";

const LOOT_FACT_KINDS = new Set(["reward_chosen", "item_equipped", "craft_resolved"]);

export function isLootCelebrationKind(kind: string): boolean {
  return LOOT_FACT_KINDS.has(kind);
}

export function resolveFactItem(snapshot: GameSnapshot, fact: ResolvedFact): ItemInstance | undefined {
  const itemId = fact.data.itemId;
  if (typeof itemId !== "string" || itemId.length === 0) return undefined;
  const runItem = snapshot.activeRun?.holdings.find((item) => item.instanceId === itemId);
  if (runItem !== undefined) return runItem;
  return snapshot.haven.holdings.find((item) => item.instanceId === itemId);
}

export function isNotableLootItem(item: ItemInstance): boolean {
  if (item.curseId !== undefined) return true;
  return item.rarityId === "imbued" || item.rarityId === "rare" || item.rarityId === "legendary";
}

export interface LootFactPresentation {
  readonly message: string;
  readonly rarityId: ItemInstance["rarityId"] | undefined;
  readonly glyph: string | undefined;
  readonly rarityLabel: string | undefined;
  readonly cursed: boolean;
  readonly notable: boolean;
  readonly className: string;
}

export function presentLootFact(snapshot: GameSnapshot, fact: ResolvedFact): LootFactPresentation {
  if (!isLootCelebrationKind(fact.kind)) {
    return {
      message: fact.message,
      rarityId: undefined,
      glyph: undefined,
      rarityLabel: undefined,
      cursed: false,
      notable: false,
      className: "fact-log-row"
    };
  }

  const item = resolveFactItem(snapshot, fact);
  if (item === undefined) {
    return {
      message: fact.message,
      rarityId: undefined,
      glyph: undefined,
      rarityLabel: undefined,
      cursed: false,
      notable: false,
      className: "fact-log-row"
    };
  }

  const cursed = item.curseId !== undefined;
  const notable = isNotableLootItem(item);
  const classes = ["fact-log-row", `is-rarity-${item.rarityId}`];
  if (notable) classes.push("is-loot-notable");
  if (cursed) classes.push("is-loot-cursed");
  if (notable) classes.push("is-loot-celebrate");

  return {
    message: fact.message,
    rarityId: item.rarityId,
    glyph: rarityGlyph(item.rarityId),
    rarityLabel: cursed ? `${titleCase(item.rarityId)} · cursed` : titleCase(item.rarityId),
    cursed,
    notable,
    className: classes.join(" ")
  };
}
