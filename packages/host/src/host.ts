import { SNAPSHOT_SCHEMA_VERSION, type AcceptedCommandRecord, type CommandEnvelope, type CommandResult, type GameHost, type GameSnapshot, type HeroSnapshot, type ItemInstance, type RunRecord, type SnapshotListener, type Unsubscribe } from "@nightfall/contracts";
import type { ValidatedContentPack } from "@nightfall/content";
import type { GameStore } from "@nightfall/persistence";
import { applyCommand, buildHeroDeckPreview, enrichItemDisplay } from "@nightfall/sim";

function enrichHeroes<T extends { heroes: readonly HeroSnapshot[] }>(section: T, holdings: readonly ItemInstance[], pack: ValidatedContentPack): T {
  return {
    ...section,
    heroes: section.heroes.map((hero) => ({
      ...hero,
      deckPreview: buildHeroDeckPreview(pack, hero, holdings)
    }))
  };
}

function enrichSnapshotDisplays(snapshot: GameSnapshot, pack: ValidatedContentPack): GameSnapshot {
  const next = structuredClone(snapshot);
  const havenHoldings = next.haven.holdings.map((item) => enrichItemDisplay(pack, item));
  const haven = enrichHeroes(
    { ...next.haven, holdings: havenHoldings },
    havenHoldings,
    pack
  );
  if (next.activeRun === undefined) return { ...next, haven };
  const run = next.activeRun;
  const runHoldings = run.holdings.map((item) => enrichItemDisplay(pack, item));
  const pending = run.pendingDecision?.kind === "reward"
    ? {
        ...run.pendingDecision,
        offers: run.pendingDecision.offers.map((offer) => ({ ...offer, item: enrichItemDisplay(pack, offer.item) }))
      }
    : run.pendingDecision;
  return {
    ...next,
    haven,
    activeRun: enrichHeroes({
      ...run,
      holdings: runHoldings,
      waypointChest: run.waypointChest.map((item) => enrichItemDisplay(pack, item)),
      ...(pending === undefined ? {} : { pendingDecision: pending })
    }, runHoldings, pack)
  };
}

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

  public static bind(store: GameStore, pack: ValidatedContentPack, snapshot: GameSnapshot): LocalGameHost {
    return new LocalGameHost(store, pack, snapshot);
  }

  public static async tryOpen(store: GameStore, pack: ValidatedContentPack): Promise<
    | { status: "ready"; host: LocalGameHost }
    | { status: "empty" }
    | { status: "content_mismatch"; snapshot: GameSnapshot }
    | { status: "save_unmigratable"; snapshot: GameSnapshot }
  > {
    const loaded = await store.loadSnapshot();
    if (loaded === undefined) return { status: "empty" };
    if (loaded.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) return { status: "save_unmigratable", snapshot: loaded };
    if (loaded.contentVersion !== pack.contentVersion || loaded.contentHash !== pack.contentHash) return { status: "content_mismatch", snapshot: loaded };
    return { status: "ready", host: new LocalGameHost(store, pack, loaded) };
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
    return enrichSnapshotDisplays(this.#snapshot, this.#pack);
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
    if (result.status === "rejected") return { ...result, snapshot: enrichSnapshotDisplays(this.#snapshot, this.#pack) };
    const enriched = { ...result, snapshot: enrichSnapshotDisplays(result.snapshot, this.#pack) };
    const record: AcceptedCommandRecord = {
      commandId: command.commandId,
      sequence: enriched.revision,
      expectedRevision: command.expectedRevision,
      resultingRevision: enriched.revision,
      command: structuredClone(command),
      result: structuredClone(enriched),
      facts: structuredClone(enriched.facts),
      resolvedEventHash: enriched.resolvedEventHash
    };
    await this.#store.commitAccepted(result.snapshot, record, completedRun(result.snapshot, beforeTerminal));
    this.#snapshot = result.snapshot;
    for (const listener of this.#listeners) listener(enrichSnapshotDisplays(this.#snapshot, this.#pack));
    return structuredClone(enriched);
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
  return enrichSnapshotDisplays(snapshot, pack);
}
