import type { CommandEnvelope, CommandType, GameSnapshot } from "@nightfall/contracts";
import type { ValidatedContentPack } from "@nightfall/content";
import { applyCommand, cloneSnapshot, createContext, createInitialSnapshot, startCombat, type ForcedStreams, type MutableSnapshot } from "@nightfall/sim";

export function command(snapshot: GameSnapshot, type: CommandType, payload: Record<string, unknown> = {}, actorId?: string, id = `${type}:${snapshot.revision + 1}`): CommandEnvelope {
  return { commandId: id, expectedRevision: snapshot.revision, type, ...(actorId === undefined ? {} : { actorId }), payload };
}

export function accept(snapshot: GameSnapshot, envelope: CommandEnvelope, pack: ValidatedContentPack, forcedStreams?: ForcedStreams): GameSnapshot {
  const result = applyCommand(snapshot, envelope, pack, forcedStreams);
  if (result.status !== "accepted") throw new Error(`Expected ${envelope.type} to be accepted, got ${result.reasonCode}`);
  return result.snapshot;
}

export function createEmbarkedSnapshot(pack: ValidatedContentPack, seed = 12345): GameSnapshot {
  const snapshot = createInitialSnapshot(pack, seed);
  return accept(snapshot, command(snapshot, "commitEmbark"), pack, { map: [0.1, 0.1] });
}

export function startFixtureCombat(pack: ValidatedContentPack, encounterId: string, options: { seed?: number; runGloom?: number; flags?: readonly string[]; forcedStreams?: ForcedStreams } = {}): MutableSnapshot {
  const embarked = createEmbarkedSnapshot(pack, options.seed ?? 12345);
  const mutable = cloneSnapshot(embarked);
  if (mutable.activeRun === undefined) throw new Error("Fixture failed to embark");
  mutable.activeRun.runGloom = options.runGloom ?? 0;
  if (options.flags !== undefined && options.flags.length > 0) mutable.activeRun.flags = [...mutable.activeRun.flags, ...options.flags];
  mutable.activeRun.phase = "combat";
  startCombat(mutable, pack, encounterId, createContext(options.forcedStreams));
  return mutable;
}

export function acceptedResult(snapshot: GameSnapshot, envelope: CommandEnvelope, pack: ValidatedContentPack, forcedStreams?: ForcedStreams) {
  const result = applyCommand(snapshot, envelope, pack, forcedStreams);
  if (result.status !== "accepted") throw new Error(`Expected accepted result, got ${result.reasonCode}`);
  return result;
}
