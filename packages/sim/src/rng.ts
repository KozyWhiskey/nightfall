import { RNG_STREAM_NAMES, type NamedRngStates, type RngStreamName } from "@nightfall/contracts";
import type { MutableSnapshot, SimulationContext } from "./internal.js";

function hashName(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function createNamedRngStates(rootSeed: number): NamedRngStates {
  return Object.fromEntries(RNG_STREAM_NAMES.map((name) => [name, (rootSeed ^ hashName(name) ^ 0x9e3779b9) >>> 0])) as unknown as NamedRngStates;
}

function nextRaw(state: number): { state: number; value: number } {
  const nextState = (state + 0x6d2b79f5) >>> 0;
  let value = nextState;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return { state: nextState, value: ((value ^ (value >>> 14)) >>> 0) / 4294967296 };
}

export function drawUnit(snapshot: MutableSnapshot, stream: RngStreamName, context: SimulationContext): number {
  const next = nextRaw(snapshot.rngStates[stream]);
  snapshot.rngStates[stream] = next.state;
  const offset = context.forcedOffsets[stream] ?? 0;
  const forced = context.forcedStreams?.[stream]?.[offset];
  context.forcedOffsets[stream] = offset + 1;
  return forced === undefined ? next.value : Math.min(0.999999999, Math.max(0, forced));
}

export function drawInt(snapshot: MutableSnapshot, stream: RngStreamName, minimum: number, maximum: number, context: SimulationContext): number {
  return minimum + Math.floor(drawUnit(snapshot, stream, context) * (maximum - minimum + 1));
}

export function chooseWeighted<T extends { readonly weight: number }>(snapshot: MutableSnapshot, stream: RngStreamName, entries: readonly T[], context: SimulationContext): T {
  if (entries.length === 0) throw new Error(`Cannot choose from an empty ${stream} pool`);
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = drawUnit(snapshot, stream, context) * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll < 0) return entry;
  }
  return entries[entries.length - 1]!;
}

export function shuffle<T>(snapshot: MutableSnapshot, stream: RngStreamName, values: readonly T[], context: SimulationContext): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const selected = drawInt(snapshot, stream, 0, index, context);
    const temporary = result[index]!;
    result[index] = result[selected]!;
    result[selected] = temporary;
  }
  return result;
}
