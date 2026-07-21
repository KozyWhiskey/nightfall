import { SNAPSHOT_SCHEMA_VERSION, type AcceptedCommandRecord, type CommandEnvelope, type CommandResult, type GameHost, type GameSnapshot, type RunRecord, type SnapshotListener, type Unsubscribe } from "@nightfall/contracts";
import type { ValidatedContentPack } from "@nightfall/content";
import type { GameStore } from "@nightfall/persistence";
import { applyCommand } from "@nightfall/sim";

function completedRun(snapshot: GameSnapshot, previousTerminal: string | undefined): RunRecord | undefined {
  const run = snapshot.activeRun;
  if (run?.terminalResult === undefined || run.terminalResult === previousTerminal) return undefined;
  return {
    runId: run.runId,
    seed: run.rootSeed,
    contentHash: snapshot.contentHash,
    result: run.terminalResult,
    diagnostics: run.diagnostics,
    ...(run.chronicleFacts === undefined ? {} : { chronicleFacts: run.chronicleFacts })
  };
}

export class LocalGameHost implements GameHost {
  readonly #store: GameStore;
  readonly #pack: ValidatedContentPack;
  readonly #listeners = new Set<SnapshotListener>();
  #snapshot: GameSnapshot;
  #queue: Promise<void> = Promise.resolve();

  private constructor(store: GameStore, pack: ValidatedContentPack, snapshot: GameSnapshot) {
    this.#store = store;
    this.#pack = pack;
    this.#snapshot = snapshot;
  }

  public static async open(store: GameStore, pack: ValidatedContentPack, initialSnapshot: GameSnapshot): Promise<LocalGameHost> {
    const loaded = await store.loadSnapshot();
    const snapshot = loaded ?? initialSnapshot;
    if (snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) throw new Error(`save_unmigratable: snapshot schema ${snapshot.schemaVersion}`);
    if (snapshot.contentVersion !== pack.contentVersion || snapshot.contentHash !== pack.contentHash) throw new Error(`content_mismatch: save ${snapshot.contentVersion}/${snapshot.contentHash}, pack ${pack.contentVersion}/${pack.contentHash}`);
    if (loaded === undefined) await store.saveInitial(snapshot);
    return new LocalGameHost(store, pack, snapshot);
  }

  public async getSnapshot(): Promise<GameSnapshot> {
    return structuredClone(this.#snapshot);
  }

  public submit(command: CommandEnvelope): Promise<CommandResult> {
    return new Promise<CommandResult>((resolve, reject) => {
      this.#queue = this.#queue.then(async () => resolve(await this.#submit(command))).catch(reject);
    });
  }

  async #submit(command: CommandEnvelope): Promise<CommandResult> {
    const duplicate = await this.#store.loadAcceptedCommand(command.commandId);
    if (duplicate !== undefined) return structuredClone(duplicate.result);
    const beforeTerminal = this.#snapshot.activeRun?.terminalResult;
    const result = applyCommand(this.#snapshot, command, this.#pack);
    if (result.status === "rejected") return { ...result, snapshot: structuredClone(this.#snapshot) };
    const record: AcceptedCommandRecord = {
      commandId: command.commandId,
      sequence: result.revision,
      expectedRevision: command.expectedRevision,
      resultingRevision: result.revision,
      command: structuredClone(command),
      result: structuredClone(result),
      facts: structuredClone(result.facts),
      resolvedEventHash: result.resolvedEventHash
    };
    await this.#store.commitAccepted(result.snapshot, record, completedRun(result.snapshot, beforeTerminal));
    this.#snapshot = result.snapshot;
    for (const listener of this.#listeners) listener(structuredClone(this.#snapshot));
    return structuredClone(result);
  }

  public subscribe(listener: SnapshotListener): Unsubscribe {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  public async close(): Promise<void> {
    await this.#queue;
    await this.#store.close();
  }
}

export function replayAcceptedCommands(initial: GameSnapshot, records: readonly AcceptedCommandRecord[], pack: ValidatedContentPack): GameSnapshot {
  let snapshot = structuredClone(initial);
  for (const record of [...records].sort((left, right) => left.sequence - right.sequence)) {
    const result = applyCommand(snapshot, record.command, pack);
    if (result.status !== "accepted") throw new Error(`Replay rejected ${record.commandId}: ${result.reasonCode}`);
    if (result.resolvedEventHash !== record.resolvedEventHash || result.revision !== record.resultingRevision) throw new Error(`Replay mismatch at ${record.commandId}`);
    snapshot = result.snapshot;
  }
  return snapshot;
}
