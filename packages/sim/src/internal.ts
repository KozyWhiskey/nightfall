import type { GameSnapshot, ResolvedFact, RngStreamName } from "@nightfall/contracts";

export type DeepMutable<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? DeepMutable<U>[]
    : T extends object
      ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
      : T;

export type MutableSnapshot = DeepMutable<GameSnapshot>;

export interface ForcedStreams {
  readonly map?: readonly number[];
  readonly encounter?: readonly number[];
  readonly combatInitiative?: readonly number[];
  readonly combatIntent?: readonly number[];
  readonly combatTarget?: readonly number[];
  readonly combatDeck?: readonly number[];
  readonly loot?: readonly number[];
  readonly craft?: readonly number[];
  readonly event?: readonly number[];
  readonly injury?: readonly number[];
}

export interface SimulationContext {
  readonly forcedStreams?: ForcedStreams;
  forcedOffsets: Partial<Record<RngStreamName, number>>;
  facts: DeepMutable<ResolvedFact>[];
  factSequence: number;
}

export function createContext(forcedStreams?: ForcedStreams): SimulationContext {
  return { ...(forcedStreams === undefined ? {} : { forcedStreams }), forcedOffsets: {}, facts: [], factSequence: 0 };
}

export function emitFact(context: SimulationContext, revision: number, kind: string, message: string, data: Record<string, string | number | boolean | null> = {}): void {
  context.facts.push({ id: `${revision + 1}:${kind}:${context.factSequence}`, kind, message, data });
  context.factSequence += 1;
}

export function cloneSnapshot(snapshot: GameSnapshot): MutableSnapshot {
  return structuredClone(snapshot) as MutableSnapshot;
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function stableSort<T>(values: readonly T[], id: (value: T) => string, compare: (left: T, right: T) => number): T[] {
  return [...values].sort((left, right) => compare(left, right) || id(left).localeCompare(id(right)));
}
