import { randomUUID } from "node:crypto";
import type Database from "better-sqlite3";

const v2SchemaSql = `
CREATE TABLE IF NOT EXISTS local_profile (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  pin_hash TEXT,
  created_at INTEGER NOT NULL,
  last_opened_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS local_profile_display_name_idx ON local_profile(display_name COLLATE NOCASE);
CREATE TABLE IF NOT EXISTS local_session (
  token_hash TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS archived_save (
  id TEXT PRIMARY KEY NOT NULL,
  profile_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  archived_at INTEGER NOT NULL,
  schema_version INTEGER NOT NULL,
  content_version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  snapshot_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS campaign_save (
  profile_id TEXT PRIMARY KEY NOT NULL,
  id TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  content_version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS active_run (
  profile_id TEXT PRIMARY KEY NOT NULL,
  id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  content_version TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  revision INTEGER NOT NULL,
  snapshot_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS accepted_command (
  profile_id TEXT NOT NULL,
  command_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  expected_revision INTEGER NOT NULL,
  resulting_revision INTEGER NOT NULL,
  command_json TEXT NOT NULL,
  result_json TEXT NOT NULL,
  facts_json TEXT NOT NULL,
  resolved_event_hash TEXT NOT NULL,
  PRIMARY KEY (profile_id, command_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS accepted_command_sequence_idx ON accepted_command(profile_id, sequence);
CREATE TABLE IF NOT EXISTS run_record (
  profile_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  seed INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  result TEXT NOT NULL,
  diagnostics_json TEXT NOT NULL,
  chronicle_facts_json TEXT,
  PRIMARY KEY (profile_id, run_id)
);
CREATE TABLE IF NOT EXISTS chronicle_cache (
  cache_key TEXT PRIMARY KEY NOT NULL,
  run_id TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  prose TEXT NOT NULL
);
`;

function tableExists(database: Database.Database, name: string): boolean {
  return database.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name) !== undefined;
}

function columnNames(database: Database.Database, table: string): readonly string[] {
  return (database.pragma(`table_info(${table})`) as Array<{ name: string }>).map((column) => column.name);
}

function havenNameFromSnapshotJson(snapshotJson: string): string {
  try {
    const parsed = JSON.parse(snapshotJson) as { haven?: { name?: unknown } };
    return typeof parsed.haven?.name === "string" && parsed.haven.name.trim().length >= 2 ? parsed.haven.name.trim() : "The Last Lantern";
  } catch {
    return "The Last Lantern";
  }
}

function migrateV1Envelopes(database: Database.Database): void {
  const now = Date.now();
  const campaign = database.prepare("SELECT id, schema_version, content_version, content_hash, revision, snapshot_json FROM campaign_save").get() as
    | { id: string; schema_version: number; content_version: string; content_hash: string; revision: number; snapshot_json: string }
    | undefined;
  const profileId = randomUUID();
  const displayName = campaign === undefined ? "Survivor" : havenNameFromSnapshotJson(campaign.snapshot_json);
  database.exec(`
    ALTER TABLE campaign_save RENAME TO campaign_save_v1;
    ALTER TABLE active_run RENAME TO active_run_v1;
    ALTER TABLE accepted_command RENAME TO accepted_command_v1;
    ALTER TABLE run_record RENAME TO run_record_v1;
  `);
  database.exec(v2SchemaSql);
  database.prepare("INSERT INTO local_profile (id, display_name, pin_hash, created_at, last_opened_at) VALUES (?, ?, NULL, ?, ?)").run(profileId, displayName, now, now);
  if (campaign !== undefined) {
    database.prepare("INSERT INTO campaign_save (profile_id, id, schema_version, content_version, content_hash, revision, snapshot_json) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      profileId,
      campaign.id,
      campaign.schema_version,
      campaign.content_version,
      campaign.content_hash,
      campaign.revision,
      campaign.snapshot_json
    );
  }
  if (tableExists(database, "active_run_v1")) {
    database.prepare(`INSERT INTO active_run (profile_id, id, campaign_id, schema_version, content_version, content_hash, revision, snapshot_json)
      SELECT ?, id, campaign_id, schema_version, content_version, content_hash, revision, snapshot_json FROM active_run_v1`).run(profileId);
  }
  if (tableExists(database, "accepted_command_v1")) {
    database.prepare(`INSERT INTO accepted_command (profile_id, command_id, sequence, expected_revision, resulting_revision, command_json, result_json, facts_json, resolved_event_hash)
      SELECT ?, command_id, sequence, expected_revision, resulting_revision, command_json, result_json, facts_json, resolved_event_hash FROM accepted_command_v1`).run(profileId);
  }
  if (tableExists(database, "run_record_v1")) {
    database.prepare(`INSERT INTO run_record (profile_id, run_id, seed, content_hash, result, diagnostics_json, chronicle_facts_json)
      SELECT ?, run_id, seed, content_hash, result, diagnostics_json, chronicle_facts_json FROM run_record_v1`).run(profileId);
  }
  database.exec(`
    DROP TABLE IF EXISTS campaign_save_v1;
    DROP TABLE IF EXISTS active_run_v1;
    DROP TABLE IF EXISTS accepted_command_v1;
    DROP TABLE IF EXISTS run_record_v1;
  `);
}

export function applyPersistenceSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS migration_record (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL
    );
  `);
  const campaignExists = tableExists(database, "campaign_save");
  const profileScoped = campaignExists && columnNames(database, "campaign_save").includes("profile_id");
  if (!campaignExists) database.exec(v2SchemaSql);
  else if (!profileScoped) migrateV1Envelopes(database);
  else database.exec(v2SchemaSql);
  database.prepare("INSERT INTO migration_record (version, name) VALUES (?, ?) ON CONFLICT(version) DO NOTHING").run(1, "build_1_initial_envelopes");
  database.prepare("INSERT INTO migration_record (version, name) VALUES (?, ?) ON CONFLICT(version) DO NOTHING").run(2, "build_1_local_profiles");
}
