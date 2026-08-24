import type {
  BurnStack,
  CombatSnapshot,
  CombatantSnapshot,
  EnemyIntentSnapshot,
  GuardLink
} from "@nightfall/contracts";
import type { IntentArtKind } from "../art/artMap.js";

export function intentKind(intent: { label: string; targetLabel: string; magnitude: number }): IntentArtKind {
  const label = intent.label.toLowerCase();
  if (intent.magnitude > 0) return "attack";
  if (/guard|block|circle|skitter|hollow|dirge|swell|mourning/.test(label)) return "defend";
  if (/fury|borrowed|buff|gather/.test(label) || /allies/i.test(intent.targetLabel)) return "buff";
  return "special";
}

export function intentGlyphChar(kind: IntentArtKind): string {
  return kind === "attack" ? "▲" : kind === "defend" ? "◆" : kind === "buff" ? "✚" : "✦";
}

export function intentKindLabel(kind: IntentArtKind): string {
  return kind === "attack" ? "Attack" : kind === "defend" ? "Defend" : kind === "buff" ? "Buff" : "Special";
}

export function intentSummary(intent: EnemyIntentSnapshot): string {
  const kind = intentKind(intent);
  const core = intent.magnitude > 0 ? `${intent.label} ${intent.magnitude}` : intent.label;
  const target = intent.targetLabel.trim();
  if (target.length === 0) {
    if (intent.magnitude > 0) return core;
    if (kind === "defend") return intent.label;
    return intent.label;
  }
  return `${core} · ${target}`;
}

export function burnStackCount(burn: readonly BurnStack[]): number {
  return burn.length;
}

/** Readable Guard chips for a combatant (guardian and/or protected). */
export function guardLabelsFor(
  combatantId: string,
  guards: readonly GuardLink[],
  combatants: readonly Pick<CombatantSnapshot, "id" | "name">[]
): string[] {
  const nameOf = (id: string) => combatants.find((entry) => entry.id === id)?.name ?? "ally";
  const labels: string[] = [];
  for (const guard of guards) {
    if (guard.guardingHeroId === combatantId) {
      labels.push(`Guarding ${nameOf(guard.protectedHeroId)}`);
    }
    if (guard.protectedHeroId === combatantId) {
      labels.push(`Guarded by ${nameOf(guard.guardingHeroId)}`);
    }
  }
  return labels;
}

const CONDITION_TOOLTIPS: Readonly<Record<string, string>> = {
  exposed: "Takes 25% more damage until this condition ends.",
  weakened: "Deals 25% less damage until this condition ends.",
  stun: "Skips the next complete turn, then Stun clears.",
  strain: "Start-of-turn AP is reduced while Strained.",
  burn: "Each stack deals 2 damage at the end of this combatant's turn, then loses one duration."
};

/** Short term explanation for a condition id (tooltip only; label stays title-cased). */
export function conditionTooltip(conditionId: string): string {
  return CONDITION_TOOLTIPS[conditionId] ?? conditionId.replaceAll("_", " ");
}

export function isTimelineCombatant(combatant: CombatantSnapshot): boolean {
  return !combatant.destroyed && combatant.kind !== "entity";
}

/** Rotate timeline so the active combatant is first, preserving round order. */
export function rotatedInitiativeOrder(combat: CombatSnapshot): string[] {
  const alive = new Set(combat.combatants.filter(isTimelineCombatant).map((entry) => entry.id));
  const order: string[] = [];
  for (let offset = 0; offset < combat.timeline.length; offset += 1) {
    const index = (combat.timelineCursor + offset) % combat.timeline.length;
    const id = combat.timeline[index]!;
    if (alive.has(id)) order.push(id);
  }
  return order;
}

/** Enemies that acted between two combat snapshots (for client-side turn replay). */
export function enemiesActedBetween(
  previous: Pick<CombatSnapshot, "timeline" | "timelineCursor" | "activeCombatantId" | "round" | "combatants">,
  next: Pick<CombatSnapshot, "timeline" | "timelineCursor" | "activeCombatantId" | "round" | "combatants">
): string[] {
  // Host JSON always yields a new timeline array; compare turn position, not array identity.
  if (
    previous.timelineCursor === next.timelineCursor &&
    previous.activeCombatantId === next.activeCombatantId &&
    previous.round === next.round
  ) {
    return [];
  }
  const acted: string[] = [];
  let cursor = previous.timelineCursor;
  for (let step = 0; step < previous.timeline.length; step += 1) {
    cursor = (cursor + 1) % previous.timeline.length;
    const id = previous.timeline[cursor]!;
    if (id === next.activeCombatantId) break;
    const combatant = next.combatants.find((entry) => entry.id === id);
    if (combatant !== undefined && combatant.side === "enemies" && isTimelineCombatant(combatant)) {
      acted.push(id);
    }
  }
  return acted;
}

export function playbackIntentFor(
  combatantId: string,
  intents: readonly EnemyIntentSnapshot[]
): EnemyIntentSnapshot | undefined {
  return intents.find((entry) => entry.enemyId === combatantId);
}

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"] as const;

export function queueOrdinal(index: number): string {
  return ORDINALS[index] ?? `${index + 1}th`;
}

/** Combatant ids whose display name appears more than once in the current timeline. */
export function duplicateTimelineNameIds(combat: CombatSnapshot): ReadonlySet<string> {
  const order = rotatedInitiativeOrder(combat);
  const nameCounts = new Map<string, number>();
  for (const id of order) {
    const combatant = combat.combatants.find((entry) => entry.id === id);
    if (combatant === undefined) continue;
    nameCounts.set(combatant.name, (nameCounts.get(combatant.name) ?? 0) + 1);
  }
  const duplicates = new Set<string>();
  for (const id of order) {
    const combatant = combat.combatants.find((entry) => entry.id === id);
    if (combatant !== undefined && (nameCounts.get(combatant.name) ?? 0) > 1) duplicates.add(id);
  }
  return duplicates;
}

/** Queue position labels keyed by combatant id (1-based from current actor). */
export function initiativeQueueLabels(combat: CombatSnapshot): ReadonlyMap<string, string> {
  const order = rotatedInitiativeOrder(combat);
  const duplicates = duplicateTimelineNameIds(combat);
  const labels = new Map<string, string>();
  order.forEach((id, index) => {
    const combatant = combat.combatants.find((entry) => entry.id === id);
    if (combatant === undefined) return;
    if (combatant.side === "enemies" && duplicates.has(id)) {
      labels.set(id, `${queueOrdinal(index)} in queue`);
    }
  });
  return labels;
}

export interface DefenseCoverageWindow {
  readonly heroId: string;
  readonly enemyIds: readonly string[];
  readonly blockAmount: number;
  readonly blockCovers: boolean;
  readonly blockCoveredEnemyIds: readonly string[];
  readonly guardCovers: boolean;
  readonly guardCoveredEnemyIds: readonly string[];
  readonly guardLabel: string | undefined;
}

function livingHeroes(combat: CombatSnapshot): CombatantSnapshot[] {
  return combat.combatants.filter(
    (entry) => entry.side === "heroes" && entry.kind === "hero" && !entry.downed && !entry.destroyed
  );
}

function blockAmountOf(combatant: CombatantSnapshot): number {
  return combatant.blockLayers.reduce((sum, layer) => sum + layer.amount, 0);
}

/** Upcoming living enemies that resolve before `heroId`'s next turn start. */
export function upcomingEnemiesBeforeNextTurnStart(combat: CombatSnapshot, heroId: string): string[] {
  const order = rotatedInitiativeOrder(combat);
  const heroIndex = order.indexOf(heroId);
  if (heroIndex < 0) return [];
  const end = heroIndex === 0 ? order.length : heroIndex;
  const enemyIds: string[] = [];
  for (let index = 1; index < end; index += 1) {
    const id = order[index]!;
    const combatant = combat.combatants.find((entry) => entry.id === id);
    if (combatant !== undefined && combatant.side === "enemies" && isTimelineCombatant(combatant)) {
      enemyIds.push(id);
    }
  }
  return enemyIds;
}

/**
 * Snapshot-derived Block/Guard coverage windows.
 * Does not recompute damage, initiative, or targeting — reads published layers and Guard links.
 */
export function defenseCoverageWindows(combat: CombatSnapshot): readonly DefenseCoverageWindow[] {
  return livingHeroes(combat).map((hero) => {
    const enemyIds = upcomingEnemiesBeforeNextTurnStart(combat, hero.id);
    const blockAmount = blockAmountOf(hero);
    const blockCoveredEnemyIds = blockAmount > 0 ? enemyIds : [];
    const protecting = combat.guards.find((guard) => guard.protectedHeroId === hero.id);
    const guardian = protecting === undefined
      ? undefined
      : combat.combatants.find((entry) => entry.id === protecting.guardingHeroId);
    const guardCoveredEnemyIds = protecting === undefined || guardian === undefined || guardian.downed || guardian.destroyed
      ? []
      : upcomingEnemiesBeforeNextTurnStart(combat, protecting.guardingHeroId);
    const guardLabel = protecting === undefined
      ? undefined
      : guardLabelsFor(hero.id, combat.guards, combat.combatants).find((label) => label.startsWith("Guarded by"));
    return {
      heroId: hero.id,
      enemyIds,
      blockAmount,
      blockCovers: blockCoveredEnemyIds.length > 0,
      blockCoveredEnemyIds,
      guardCovers: guardCoveredEnemyIds.length > 0,
      guardCoveredEnemyIds,
      guardLabel
    };
  });
}

function turnsPhrase(count: number): string {
  return count === 1 ? "next 1 enemy turn" : `next ${count} enemy turns`;
}

/** Visible (not color-only) coverage copy for a hero timeline row. */
export function heroDefenseCoverageText(window: DefenseCoverageWindow): string | undefined {
  const parts: string[] = [];
  if (window.blockCovers) parts.push(`Block ${window.blockAmount} covers ${turnsPhrase(window.blockCoveredEnemyIds.length)}`);
  if (window.guardCovers) {
    const who = window.guardLabel ?? "Guard";
    parts.push(`${who} covers ${turnsPhrase(window.guardCoveredEnemyIds.length)}`);
  }
  if (parts.length === 0) return undefined;
  return parts.join(" · ");
}

/** Visible coverage copy for an enemy timeline row covered by any hero window. */
export function enemyDefenseCoverageText(
  windows: readonly DefenseCoverageWindow[],
  enemyId: string
): string | undefined {
  const tags: string[] = [];
  if (windows.some((window) => window.blockCoveredEnemyIds.includes(enemyId))) tags.push("Block");
  if (windows.some((window) => window.guardCoveredEnemyIds.includes(enemyId))) tags.push("Guard");
  if (tags.length === 0) return undefined;
  return `Covered by ${tags.join(" · ")}`;
}
