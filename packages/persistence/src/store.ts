import Database from "better-sqlite3";
import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { randomUUID } from "node:crypto";
import type { AcceptedCommandRecord, AcceptedCommandResult, GameSnapshot, RunRecord } from "@nightfall/contracts";
import { applyPersistenceSchema } from "./migrate.js";
import { acceptedCommand, activeRun, archivedSave, campaignSave, localProfile, localSession, runRecordTable } from "./schema.js";

export const DEFAULT_TEST_PROFILE_ID = "profile_default";

export interface GameStore {
  loadSnapshot(): Promise<GameSnapshot | undefined>;
  saveInitial(snapshot: GameSnapshot): Promise<void>;
  loadAcceptedCommand(commandId: string): Promise<AcceptedCommandRecord | undefined>;
  listAcceptedCommands(): Promise<readonly AcceptedCommandRecord[]>;
  commitAccepted(snapshot: GameSnapshot, command: AcceptedCommandRecord, runRecord?: RunRecord): Promise<void>;
  listRunRecords(): Promise<readonly RunRecord[]>;
  close(): Promise<void>;
}

export interface ProfileRecord {
  readonly id: string;
  readonly displayName: string;
  readonly pinHash: string | null;
  readonly createdAt: number;
  readonly lastOpenedAt: number;
}

export interface SessionRecord {
  readonly tokenHash: string;
  readonly profileId: string;
  readonly createdAt: number;
  readonly lastSeenAt: number;
  readonly expiresAt: number;
}

export interface ArchivedSaveRecord {
  readonly id: string;
  readonly profileId: string;
  readonly reason: string;
  readonly archivedAt: number;
  readonly schemaVersion: number;
  readonly contentVersion: string;
  readonly contentHash: string;
  readonly snapshotJson: string;
}

type Orm = ReturnType<typeof drizzle>;

function commandRow(profileId: string, record: AcceptedCommandRecord) {
  return {
    profileId,
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

function parseProfile(row: typeof localProfile.$inferSelect): ProfileRecord {
  return { id: row.id, displayName: row.displayName, pinHash: row.pinHash, createdAt: row.createdAt, lastOpenedAt: row.lastOpenedAt };
}

export class NightfallSqlite {
  readonly #database: Database.Database;
  readonly #orm: Orm;

  public constructor(path: string) {
    this.#database = new Database(path);
    this.#database.pragma("journal_mode = WAL");
    this.#database.pragma("foreign_keys = ON");
    applyPersistenceSchema(this.#database);
    this.#orm = drizzle(this.#database);
  }

  public store(profileId: string): SQLiteGameStore {
    return SQLiteGameStore.attach(this.#database, this.#orm, profileId);
  }

  public listProfiles(): readonly ProfileRecord[] {
    return this.#orm.select().from(localProfile).orderBy(asc(localProfile.createdAt)).all().map(parseProfile);
  }

  public getProfile(profileId: string): ProfileRecord | undefined {
    const row = this.#orm.select().from(localProfile).where(eq(localProfile.id, profileId)).get();
    return row === undefined ? undefined : parseProfile(row);
  }

  public findProfileByName(displayName: string): ProfileRecord | undefined {
    return this.listProfiles().find((profile) => profile.displayName.localeCompare(displayName, undefined, { sensitivity: "accent" }) === 0);
  }

  public createProfile(input: { id?: string; displayName: string; pinHash: string | null; now: number }): ProfileRecord {
    const id = input.id ?? randomUUID();
    try {
      this.#orm.insert(localProfile).values({ id, displayName: input.displayName, pinHash: input.pinHash, createdAt: input.now, lastOpenedAt: input.now }).run();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("UNIQUE") || message.includes("unique")) throw new Error("display_name_taken");
      throw error;
    }
    return this.getProfile(id)!;
  }

  public updateProfile(profileId: string, patch: { displayName?: string; pinHash?: string | null; lastOpenedAt?: number }): ProfileRecord {
    const current = this.getProfile(profileId);
    if (current === undefined) throw new Error("profile_not_found");
    try {
      this.#orm.update(localProfile).set({
        displayName: patch.displayName ?? current.displayName,
        pinHash: patch.pinHash === undefined ? current.pinHash : patch.pinHash,
        lastOpenedAt: patch.lastOpenedAt ?? current.lastOpenedAt
      }).where(eq(localProfile.id, profileId)).run();
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("UNIQUE") || message.includes("unique")) throw new Error("display_name_taken");
      throw error;
    }
    return this.getProfile(profileId)!;
  }

  public deleteProfile(profileId: string): void {
    this.#database.transaction(() => {
      this.#orm.delete(acceptedCommand).where(eq(acceptedCommand.profileId, profileId)).run();
      this.#orm.delete(runRecordTable).where(eq(runRecordTable.profileId, profileId)).run();
      this.#orm.delete(activeRun).where(eq(activeRun.profileId, profileId)).run();
      this.#orm.delete(campaignSave).where(eq(campaignSave.profileId, profileId)).run();
      this.#orm.delete(archivedSave).where(eq(archivedSave.profileId, profileId)).run();
      this.#orm.delete(localSession).where(eq(localSession.profileId, profileId)).run();
      this.#orm.delete(localProfile).where(eq(localProfile.id, profileId)).run();
    })();
  }

  public createSession(input: { tokenHash: string; profileId: string; now: number; expiresAt: number }): void {
    this.#orm.insert(localSession).values({
      tokenHash: input.tokenHash,
      profileId: input.profileId,
      createdAt: input.now,
      lastSeenAt: input.now,
      expiresAt: input.expiresAt
    }).run();
  }

  public getSession(tokenHash: string): SessionRecord | undefined {
    const row = this.#orm.select().from(localSession).where(eq(localSession.tokenHash, tokenHash)).get();
    if (row === undefined) return undefined;
    return { tokenHash: row.tokenHash, profileId: row.profileId, createdAt: row.createdAt, lastSeenAt: row.lastSeenAt, expiresAt: row.expiresAt };
  }

  public touchSession(tokenHash: string, now: number, expiresAt: number): void {
    this.#orm.update(localSession).set({ lastSeenAt: now, expiresAt }).where(eq(localSession.tokenHash, tokenHash)).run();
  }

  public deleteSession(tokenHash: string): void {
    this.#orm.delete(localSession).where(eq(localSession.tokenHash, tokenHash)).run();
  }

  public loadSnapshot(profileId: string): GameSnapshot | undefined {
    const active = this.#orm.select().from(activeRun).where(eq(activeRun.profileId, profileId)).get();
    if (active !== undefined) return JSON.parse(active.snapshotJson) as GameSnapshot;
    const campaign = this.#orm.select().from(campaignSave).where(eq(campaignSave.profileId, profileId)).get();
    return campaign === undefined ? undefined : JSON.parse(campaign.snapshotJson) as GameSnapshot;
  }

  public archiveSnapshot(profileId: string, reason: string, snapshot: GameSnapshot, now: number): void {
    this.#orm.insert(archivedSave).values({
      id: randomUUID(),
      profileId,
      reason,
      archivedAt: now,
      schemaVersion: snapshot.schemaVersion,
      contentVersion: snapshot.contentVersion,
      contentHash: snapshot.contentHash,
      snapshotJson: JSON.stringify(snapshot)
    }).run();
  }

  public clearCampaign(profileId: string): void {
    this.#database.transaction(() => {
      this.#orm.delete(acceptedCommand).where(eq(acceptedCommand.profileId, profileId)).run();
      this.#orm.delete(runRecordTable).where(eq(runRecordTable.profileId, profileId)).run();
      this.#orm.delete(activeRun).where(eq(activeRun.profileId, profileId)).run();
      this.#orm.delete(campaignSave).where(eq(campaignSave.profileId, profileId)).run();
    })();
  }

  public listArchivedSaves(profileId: string): readonly ArchivedSaveRecord[] {
    return this.#orm.select().from(archivedSave).where(eq(archivedSave.profileId, profileId)).all();
  }

  public close(): void {
    this.#database.close();
  }
}

export class SQLiteGameStore implements GameStore {
  readonly #database: Database.Database;
  readonly #orm: Orm;
  readonly #profileId: string;
  readonly #ownsDatabase: boolean;

  public constructor(path: string, profileId?: string);
  public constructor(handle: { database: Database.Database; orm: Orm; profileId: string; ownsDatabase: boolean });
  public constructor(pathOrHandle: string | { database: Database.Database; orm: Orm; profileId: string; ownsDatabase: boolean }, profileId = DEFAULT_TEST_PROFILE_ID) {
    if (typeof pathOrHandle === "string") {
      this.#database = new Database(pathOrHandle);
      this.#database.pragma("journal_mode = WAL");
      this.#database.pragma("foreign_keys = ON");
      applyPersistenceSchema(this.#database);
      this.#orm = drizzle(this.#database);
      this.#profileId = profileId;
      this.#ownsDatabase = true;
      this.#ensureProfile();
      return;
    }
    this.#database = pathOrHandle.database;
    this.#orm = pathOrHandle.orm;
    this.#profileId = pathOrHandle.profileId;
    this.#ownsDatabase = pathOrHandle.ownsDatabase;
  }

  public static attach(database: Database.Database, orm: Orm, profileId: string): SQLiteGameStore {
    return new SQLiteGameStore({ database, orm, profileId, ownsDatabase: false });
  }

  #ensureProfile(): void {
    const existing = this.#orm.select().from(localProfile).where(eq(localProfile.id, this.#profileId)).get();
    if (existing !== undefined) return;
    const now = Date.now();
    this.#orm.insert(localProfile).values({
      id: this.#profileId,
      displayName: this.#profileId === DEFAULT_TEST_PROFILE_ID ? "Fixture" : this.#profileId,
      pinHash: null,
      createdAt: now,
      lastOpenedAt: now
    }).onConflictDoNothing().run();
  }

  public async loadSnapshot(): Promise<GameSnapshot | undefined> {
    const active = this.#orm.select().from(activeRun).where(eq(activeRun.profileId, this.#profileId)).get();
    if (active !== undefined) return JSON.parse(active.snapshotJson) as GameSnapshot;
    const campaign = this.#orm.select().from(campaignSave).where(eq(campaignSave.profileId, this.#profileId)).get();
    return campaign === undefined ? undefined : JSON.parse(campaign.snapshotJson) as GameSnapshot;
  }

  public async saveInitial(snapshot: GameSnapshot): Promise<void> {
    this.#writeSnapshot(snapshot);
  }

  public async loadAcceptedCommand(commandId: string): Promise<AcceptedCommandRecord | undefined> {
    const row = this.#orm.select().from(acceptedCommand).where(and(eq(acceptedCommand.profileId, this.#profileId), eq(acceptedCommand.commandId, commandId))).get();
    return row === undefined ? undefined : parseCommandRow(row);
  }

  public async listAcceptedCommands(): Promise<readonly AcceptedCommandRecord[]> {
    return this.#orm.select().from(acceptedCommand).where(eq(acceptedCommand.profileId, this.#profileId)).orderBy(asc(acceptedCommand.sequence)).all().map(parseCommandRow);
  }

  public async commitAccepted(snapshot: GameSnapshot, command: AcceptedCommandRecord, completedRun?: RunRecord): Promise<void> {
    this.#database.transaction(() => {
      this.#writeSnapshot(snapshot);
      this.#orm.insert(acceptedCommand).values(commandRow(this.#profileId, command)).run();
      if (completedRun !== undefined) {
        this.#orm.insert(runRecordTable).values({
          profileId: this.#profileId,
          runId: completedRun.runId,
          seed: completedRun.seed,
          contentHash: completedRun.contentHash,
          result: completedRun.result,
          diagnosticsJson: JSON.stringify(completedRun.diagnostics),
          chronicleFactsJson: completedRun.chronicleFacts === undefined ? null : JSON.stringify(completedRun.chronicleFacts)
        }).onConflictDoNothing().run();
      }
    })();
  }

  #writeSnapshot(snapshot: GameSnapshot): void {
    const value = {
      profileId: this.#profileId,
      id: snapshot.campaign.campaignId,
      schemaVersion: snapshot.schemaVersion,
      contentVersion: snapshot.contentVersion,
      contentHash: snapshot.contentHash,
      revision: snapshot.revision,
      snapshotJson: JSON.stringify(snapshot)
    };
    this.#orm.insert(campaignSave).values(value).onConflictDoUpdate({ target: campaignSave.profileId, set: value }).run();
    this.#orm.delete(activeRun).where(eq(activeRun.profileId, this.#profileId)).run();
    if (snapshot.activeRun !== undefined) {
      this.#orm.insert(activeRun).values({
        profileId: this.#profileId,
        id: snapshot.activeRun.runId,
        campaignId: snapshot.campaign.campaignId,
        schemaVersion: snapshot.schemaVersion,
        contentVersion: snapshot.contentVersion,
        contentHash: snapshot.contentHash,
        revision: snapshot.revision,
        snapshotJson: JSON.stringify(snapshot)
      }).run();
    }
  }

  public async listRunRecords(): Promise<readonly RunRecord[]> {
    return this.#orm.select().from(runRecordTable).where(eq(runRecordTable.profileId, this.#profileId)).all().map((row) => ({
      runId: row.runId,
      seed: row.seed,
      contentHash: row.contentHash,
      result: row.result as RunRecord["result"],
      diagnostics: JSON.parse(row.diagnosticsJson) as RunRecord["diagnostics"],
      ...(row.chronicleFactsJson === null ? {} : { chronicleFacts: JSON.parse(row.chronicleFactsJson) as NonNullable<RunRecord["chronicleFacts"]> })
    }));
  }

  public async close(): Promise<void> {
    if (this.#ownsDatabase) this.#database.close();
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
