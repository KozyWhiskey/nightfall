import type { CombatSnapshot, CombatantSnapshot, ItemInstance } from "@nightfall/contracts";
import { titleCase } from "../decisionUi.js";

export function livingMarkedCarriers(combat: CombatSnapshot): readonly CombatantSnapshot[] {
  return combat.combatants.filter(
    (entry) =>
      entry.side === "enemies" &&
      !entry.destroyed &&
      !entry.downed &&
      entry.carriedItemId !== undefined
  );
}

export function isMarkedCarrier(combatant: CombatantSnapshot): boolean {
  return combatant.side === "enemies" && !combatant.destroyed && combatant.carriedItemId !== undefined;
}

export function carrierRarityChip(
  combatant: CombatantSnapshot,
  holdings: readonly ItemInstance[]
): string | undefined {
  if (combatant.carriedItemId === undefined) return undefined;
  const item = holdings.find((entry) => entry.instanceId === combatant.carriedItemId);
  if (item === undefined) return "Carrying exceptional gear";
  return `Wielding ${titleCase(item.rarityId)}`;
}

export function markedCarrierFieldStatus(combat: CombatSnapshot): string | undefined {
  const carriers = livingMarkedCarriers(combat);
  if (carriers.length === 0) return undefined;
  if (carriers.length === 1) {
    return `Marked carrier on the field — ${carriers[0]!.name}. Identity hidden until it falls.`;
  }
  return `Marked carriers on the field (${carriers.length}). Identity hidden until they fall.`;
}

export function carrierRecoveredAnnouncement(item: ItemInstance): string {
  return `Marked carrier recovered: ${item.displaySnapshot.name}.`;
}
