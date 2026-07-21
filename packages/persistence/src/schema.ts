import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const campaignSave = sqliteTable("campaign_save", {
  id: text("id").primaryKey(),
  schemaVersion: integer("schema_version").notNull(),
  contentVersion: text("content_version").notNull(),
  contentHash: text("content_hash").notNull(),
  revision: integer("revision").notNull(),
  snapshotJson: text("snapshot_json").notNull()
});

export const activeRun = sqliteTable("active_run", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  schemaVersion: integer("schema_version").notNull(),
  contentVersion: text("content_version").notNull(),
  contentHash: text("content_hash").notNull(),
  revision: integer("revision").notNull(),
  snapshotJson: text("snapshot_json").notNull()
});

export const acceptedCommand = sqliteTable("accepted_command", {
  commandId: text("command_id").primaryKey(),
  sequence: integer("sequence").notNull(),
  expectedRevision: integer("expected_revision").notNull(),
  resultingRevision: integer("resulting_revision").notNull(),
  commandJson: text("command_json").notNull(),
  resultJson: text("result_json").notNull(),
  factsJson: text("facts_json").notNull(),
  resolvedEventHash: text("resolved_event_hash").notNull()
});

export const runRecordTable = sqliteTable("run_record", {
  runId: text("run_id").primaryKey(),
  seed: integer("seed").notNull(),
  contentHash: text("content_hash").notNull(),
  result: text("result").notNull(),
  diagnosticsJson: text("diagnostics_json").notNull(),
  chronicleFactsJson: text("chronicle_facts_json")
});

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
