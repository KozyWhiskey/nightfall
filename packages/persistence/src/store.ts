import Database from "better-sqlite3";
import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { AcceptedCommandRecord, AcceptedCommandResult, GameSnapshot, RunRecord } from "@nightfall/contracts";
import { acceptedCommand, activeRun, campaignSave, migrationRecord, runRecordTable } from "./schema.js";

export interface GameStore {
  loadSnapshot(): Promise<GameSnapshot | undefined>;
  saveInitial(snapshot: GameSnapshot): Promise<void>;
  loadAcceptedCommand(commandId: string): Promise<AcceptedCommandRecord | undefined>;
  listAcceptedCommands(): Promise<readonly AcceptedCommandRecord[]>;
  commitAccepted(snapshot: GameSnapshot, command: AcceptedCommandRecord, runRecord?: RunRecord): Promise<void>;
  listRunRecords(): Promise<readonly RunRecord[]>;
  close(): Promise<void>;
}

const migrationSql = `
CREATE TABLE IF NOT EXISTS migration_record (
  version INTEGER PRIMARY KEY NOT NULL,
  name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS campaign_save (
  id TEXT PRIMARY KEY NOT NULL,
  schema_version INTEGER NOT NULL,
  content_version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS active_run (
  id TEXT PRIMARY KEY NOT NULL,
  campaign_id TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  content_version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS accepted_command (
  command_id TEXT PRIMARY KEY NOT NULL,
  sequence INTEGER NOT NULL,
  expected_revision INTEGER NOT NULL,
  resulting_revision INTEGER NOT NULL,
  command_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  facts_json TEXT NOT NULL,
  resolved_event_hash TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS accepted_command_sequence_idx ON accepted_command(sequence);
CREATE TABLE IF NOT EXISTS run_record (
  run_id TEXT PRIMARY KEY NOT NULL,
  seed INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  result TEXT NOT NULL,
  diagnostics_json TEXT NOT NULL,
  chronicle_facts_json TEXT
);
CREATE TABLE IF NOT EXISTS chronicle_cache (
  cache_key TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  prose TEXT NOT NULL
);
`;

function commandRow(record: AcceptedCommandRecord) {
  return {
    commandId: record.commandId,
    sequence: record.sequence,
    expectedRevision: record.expectedRevision,
    resultingRevision: record.resultingRevision,
    commandJson: JSON.stringify(record.command),
    resultJson: JSON.stringify(record.result),
    factsJson: JSON.stringify(record.facts),
    resolvedEventHash: record.resolvedEventHash
  };
}

function parseCommandRow(row: typeof acceptedCommand.$inferSelect): AcceptedCommandRecord {
  return {
    commandId: row.commandId,
    sequence: row.sequence,
    expectedRevision: row.expectedRevision,
    resultingRevision: row.resultingRevision,
    command: JSON.parse(row.commandJson) as AcceptedCommandRecord["command"],
    result: JSON.parse(row.resultJson) as AcceptedCommandResult,
    facts: JSON.parse(row.factsJson) as AcceptedCommandRecord["facts"],
    resolvedEventHash: row.resolvedEventHash
  };
}

function runRow(record: RunRecord) {
  return { runId: record.runId, seed: record.seed, contentHash: record.contentHash, result: record.result, diagnosticsJson: JSON.stringify(record.diagnostics), chronicleFactsJson: record.chronicleFacts === undefined ? null : JSON.stringify(record.chronicleFacts) };
}

export class SQLiteGameStore implements GameStore {
  readonly #database: Database.Database;
  readonly #orm: ReturnType<typeof drizzle>;

  public constructor(path: string) {
    this.#database = new Database(path);
    this.#database.pragma("journal_mode = WAL");
    this.#database.pragma("foreign_keys = ON");
    this.#database.exec(migrationSql);
    this.#orm = drizzle(this.#database);
    this.#orm.insert(migrationRecord).values({ version: 1, name: "build_1_initial_envelopes" }).onConflictDoNothing().run();
  }

  public async loadSnapshot(): Promise<GameSnapshot | undefined> {
    const active = this.#orm.select().from(activeRun).orderBy(asc(activeRun.revision)).all().at(-1);
    if (active !== undefined) return JSON.parse(active.snapshotJson) as GameSnapshot;
    const campaign = this.#orm.select().from(campaignSave).all().at(0);
    return campaign === undefined ? undefined : JSON.parse(campaign.snapshotJson) as GameSnapshot;
  }

  public async saveInitial(snapshot: GameSnapshot): Promise<void> {
    this.#writeSnapshot(snapshot);
  }

  public async loadAcceptedCommand(commandId: string): Promise<AcceptedCommandRecord | undefined> {
    const row = this.#orm.select().from(acceptedCommand).where(eq(acceptedCommand.commandId, commandId)).get();
    return row === undefined ? undefined : parseCommandRow(row);
  }

  public async listAcceptedCommands(): Promise<readonly AcceptedCommandRecord[]> {
    return this.#orm.select().from(acceptedCommand).orderBy(asc(acceptedCommand.sequence)).all().map(parseCommandRow);
  }

  public async commitAccepted(snapshot: GameSnapshot, command: AcceptedCommandRecord, completedRun?: RunRecord): Promise<void> {
    this.#database.transaction(() => {
      this.#writeSnapshot(snapshot);
      this.#orm.insert(acceptedCommand).values(commandRow(command)).run();
      if (completedRun !== undefined) this.#orm.insert(runRecordTable).values(runRow(completedRun)).onConflictDoNothing().run();
    })();
  }

  #writeSnapshot(snapshot: GameSnapshot): void {
    const value = { schemaVersion: snapshot.schemaVersion, contentVersion: snapshot.contentVersion, contentHash: snapshot.contentHash, revision: snapshot.revision, snapshotJson: JSON.stringify(snapshot) };
    this.#orm.insert(campaignSave).values({ id: snapshot.campaign.campaignId, ...value }).onConflictDoUpdate({ target: campaignSave.id, set: value }).run();
    this.#orm.delete(activeRun).run();
    if (snapshot.activeRun !== undefined) this.#orm.insert(activeRun).values({ id: snapshot.activeRun.runId, campaignId: snapshot.campaign.campaignId, ...value }).run();
  }

  public async listRunRecords(): Promise<readonly RunRecord[]> {
    return this.#orm.select().from(runRecordTable).all().map((row) => ({ runId: row.runId, seed: row.seed, contentHash: row.contentHash, result: row.result as RunRecord["result"], diagnostics: JSON.parse(row.diagnosticsJson) as RunRecord["diagnostics"], ...(row.chronicleFactsJson === null ? {} : { chronicleFacts: JSON.parse(row.chronicleFactsJson) as NonNullable<RunRecord["chronicleFacts"]> }) }));
  }

  public async close(): Promise<void> {
    this.#database.close();
  }
}

export class InMemoryGameStore implements GameStore {
  #snapshot?: GameSnapshot;
  readonly #commands = new Map<string, AcceptedCommandRecord>();
  readonly #runs = new Map<string, RunRecord>();

  public async loadSnapshot(): Promise<GameSnapshot | undefined> { return this.#snapshot === undefined ? undefined : structuredClone(this.#snapshot); }
  public async saveInitial(snapshot: GameSnapshot): Promise<void> { this.#snapshot = structuredClone(snapshot); }
  public async loadAcceptedCommand(commandId: string): Promise<AcceptedCommandRecord | undefined> { const value = this.#commands.get(commandId); return value === undefined ? undefined : structuredClone(value); }
  public async listAcceptedCommands(): Promise<readonly AcceptedCommandRecord[]> { return [...this.#commands.values()].sort((left, right) => left.sequence - right.sequence).map((entry) => structuredClone(entry)); }
  public async commitAccepted(snapshot: GameSnapshot, command: AcceptedCommandRecord, runRecord?: RunRecord): Promise<void> {
    if (this.#commands.has(command.commandId)) throw new Error(`Accepted command ${command.commandId} already exists`);
    this.#snapshot = structuredClone(snapshot); this.#commands.set(command.commandId, structuredClone(command)); if (runRecord !== undefined && !this.#runs.has(runRecord.runId)) this.#runs.set(runRecord.runId, structuredClone(runRecord));
  }
  public async listRunRecords(): Promise<readonly RunRecord[]> { return [...this.#runs.values()].map((entry) => structuredClone(entry)); }
  public async close(): Promise<void> {}
}
