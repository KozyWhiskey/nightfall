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

INSERT OR IGNORE INTO migration_record(version, name)
VALUES (1, 'build_1_initial_envelopes');
