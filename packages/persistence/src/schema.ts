import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const localProfile = sqliteTable("local_profile", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  pinHash: text("pin_hash"),
  createdAt: integer("created_at").notNull(),
  lastOpenedAt: integer("last_opened_at").notNull()
});

export const localSession = sqliteTable("local_session", {
  tokenHash: text("token_hash").primaryKey(),
  profileId: text("profile_id").notNull(),
  createdAt: integer("created_at").notNull(),
  lastSeenAt: integer("last_seen_at").notNull(),
  expiresAt: integer("expires_at").notNull()
});

export const archivedSave = sqliteTable("archived_save", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").notNull(),
  reason: text("reason").notNull(),
  archivedAt: integer("archived_at").notNull(),
  schemaVersion: integer("schema_version").notNull(),
  contentVersion: text("content_version").notNull(),
  contentHash: text("content_hash").notNull(),
  snapshotJson: text("snapshot_json").notNull()
});

export const campaignSave = sqliteTable("campaign_save", {
  profileId: text("profile_id").primaryKey(),
  id: text("id").notNull(),
  schemaVersion: integer("schema_version").notNull(),
  contentVersion: text("content_version").notNull(),
  contentHash: text("content_hash").notNull(),
  revision: integer("revision").notNull(),
  snapshotJson: text("snapshot_json").notNull()
});

export const activeRun = sqliteTable("active_run", {
  profileId: text("profile_id").primaryKey(),
  id: text("id").notNull(),
  campaignId: text("campaign_id").notNull(),
  schemaVersion: integer("schema_version").notNull(),
  contentVersion: text("content_version").notNull(),
  contentHash: text("content_hash").notNull(),
  revision: integer("revision").notNull(),
  snapshotJson: text("snapshot_json").notNull()
});

export const acceptedCommand = sqliteTable("accepted_command", {
  profileId: text("profile_id").notNull(),
  commandId: text("command_id").notNull(),
  sequence: integer("sequence").notNull(),
  expectedRevision: integer("expected_revision").notNull(),
  resultingRevision: integer("resulting_revision").notNull(),
  commandJson: text("command_json").notNull(),
  resultJson: text("result_json").notNull(),
  factsJson: text("facts_json").notNull(),
  resolvedEventHash: text("resolved_event_hash").notNull()
}, (table) => [primaryKey({ columns: [table.profileId, table.commandId] })]);

export const runRecordTable = sqliteTable("run_record", {
  profileId: text("profile_id").notNull(),
  runId: text("run_id").notNull(),
  seed: integer("seed").notNull(),
  contentHash: text("content_hash").notNull(),
  result: text("result").notNull(),
  diagnosticsJson: text("diagnostics_json").notNull(),
  chronicleFactsJson: text("chronicle_facts_json")
}, (table) => [primaryKey({ columns: [table.profileId, table.runId] })]);

export const chronicleCache = sqliteTable("chronicle_cache", {
  cacheKey: text("cache_key").primaryKey(),
  runId: text("run_id").notNull(),
  promptVersion: text("prompt_version").notNull(),
  prose: text("prose").notNull()
});

export const migrationRecord = sqliteTable("migration_record", {
  version: integer("version").primaryKey(),
  name: text("name").notNull()
});
