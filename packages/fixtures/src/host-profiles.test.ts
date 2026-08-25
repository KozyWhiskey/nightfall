import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SNAPSHOT_SCHEMA_VERSION } from "@nightfall/contracts";
import { build1Pack } from "@nightfall/content";
import { LocalGameHost, LocalSessionHost } from "@nightfall/host";
import { NightfallSqlite, SQLiteGameStore } from "@nightfall/persistence";
import { createInitialSnapshot } from "@nightfall/sim";
import { command } from "./index.js";

function tempDb(): { path: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "nightfall-host-p-"));
  return { path: join(dir, "test.sqlite"), cleanup: () => { if (existsSync(dir)) rmSync(dir, { recursive: true, force: true }); } };
}

describe("HOST-P local profiles, session, and mismatch", () => {
  it("HOST-P01 opens an empty catalog without throwing", () => {
    const { path, cleanup } = tempDb();
    try {
      const host = LocalSessionHost.open(path, build1Pack, 11);
      const health = host.health();
      expect(health.status).toBe("ok");
      expect(health.contentHash).toBe(build1Pack.contentHash);
      expect(host.listProfiles()).toEqual([]);
      expect(host.session()).toEqual({ authenticated: false });
      void host.close();
    } finally {
      cleanup();
    }
  });

  it("HOST-P02 isolates two profiles' Haven state", async () => {
    const { path, cleanup } = tempDb();
    try {
      const host = LocalSessionHost.open(path, build1Pack, 12);
      const first = await host.createProfile("Ash");
      const second = await host.createProfile("Ember");
      if (!first.ok || !second.ok) throw new Error("create failed");
      const firstLoaded = await host.getSnapshot(first.value.token);
      if (!firstLoaded.ok || !("snapshot" in firstLoaded.value)) throw new Error("first snapshot missing");
      const namedFirst = await host.submit(first.value.token, command(firstLoaded.value.snapshot, "nameHaven", { name: "Ashwake" }));
      expect(namedFirst.ok).toBe(true);
      const firstSnap = await host.getSnapshot(first.value.token);
      const secondSnap = await host.getSnapshot(second.value.token);
      if (!firstSnap.ok || !("snapshot" in firstSnap.value) || !secondSnap.ok || !("snapshot" in secondSnap.value)) throw new Error("snapshots missing");
      expect(firstSnap.value.snapshot.haven.name).toBe("Ashwake");
      expect(host.listProfiles().find((profile) => profile.displayName === "Ash")?.havenName).toBe("Ashwake");
      expect(host.listProfiles().find((profile) => profile.displayName === "Ash")?.campaignStatus).toBe("ok");
      expect(secondSnap.value.snapshot.view).toBe("founding");
      expect(secondSnap.value.snapshot.haven.name).toBe("");
      expect(firstSnap.value.snapshot.revision).not.toBe(secondSnap.value.snapshot.revision);
      await host.close();
    } finally {
      cleanup();
    }
  });

  it("HOST-P03 session and snapshot survive LocalSessionHost reopen", async () => {
    const { path, cleanup } = tempDb();
    try {
      let host = LocalSessionHost.open(path, build1Pack, 13);
      const created = await host.createProfile("Rook");
      expect(created.ok).toBe(true);
      if (!created.ok) throw new Error("create failed");
      const loaded = await host.getSnapshot(created.value.token);
      if (!loaded.ok || !("snapshot" in loaded.value)) throw new Error("founding missing");
      const named = await host.submit(created.value.token, command(loaded.value.snapshot, "nameHaven", { name: "Rook's Rest" }));
      expect(named.ok).toBe(true);
      if (!named.ok) throw new Error("name failed");
      const revision = named.value.status === "accepted" ? named.value.snapshot.revision : -1;
      const token = created.value.token;
      await host.close();

      host = LocalSessionHost.open(path, build1Pack, 99);
      const session = host.session(token);
      expect(session.authenticated).toBe(true);
      expect(session.profile?.displayName).toBe("Rook");
      const resumed = await host.getSnapshot(token);
      expect(resumed.ok && "snapshot" in resumed.value).toBe(true);
      if (!resumed.ok || !("snapshot" in resumed.value)) throw new Error("resume missing");
      expect(resumed.value.snapshot.haven.name).toBe("Rook's Rest");
      expect(resumed.value.snapshot.view).toBe("haven");
      expect(resumed.value.snapshot.revision).toBe(revision);
      await host.close();
    } finally {
      cleanup();
    }
  });

  it("HOST-P04 content mismatch is reported and the file is preserved", async () => {
    const { path, cleanup } = tempDb();
    try {
      let host = LocalSessionHost.open(path, build1Pack, 14);
      const created = await host.createProfile("Mara");
      expect(created.ok).toBe(true);
      if (!created.ok) throw new Error("create failed");
      const loaded = await host.getSnapshot(created.value.token);
      if (!loaded.ok || !("snapshot" in loaded.value)) throw new Error("snapshot missing");
      const named = await host.submit(created.value.token, command(loaded.value.snapshot, "nameHaven", { name: "Mara's Wick" }));
      if (!named.ok || named.value.status !== "accepted") throw new Error("name failed");
      await host.close();

      const db = new NightfallSqlite(path);
      const snapshot = db.loadSnapshot(created.value.profile.profileId);
      if (snapshot === undefined) throw new Error("missing row");
      const mutated = { ...snapshot, contentHash: "deadbeef".repeat(8) };
      await db.store(created.value.profile.profileId).saveInitial(mutated);
      db.close();

      host = LocalSessionHost.open(path, build1Pack, 14);
      expect(host.health().status).toBe("ok");
      const mismatch = await host.getSnapshot(created.value.token);
      expect(mismatch.ok).toBe(true);
      if (!mismatch.ok || !("mismatch" in mismatch.value)) throw new Error("expected mismatch");
      expect(mismatch.value.mismatch.reasonCode).toBe("content_mismatch");
      const inspect = new NightfallSqlite(path);
      const still = inspect.loadSnapshot(created.value.profile.profileId);
      expect(still?.haven.name).toBe("Mara's Wick");
      expect(still?.contentHash).toBe("deadbeef".repeat(8));
      inspect.close();

      const blocked = await host.startNewCampaign(created.value.token, false);
      expect(blocked.ok).toBe(false);
      if (blocked.ok) throw new Error("replace should require confirm");
      expect(blocked.body.error).toBe("confirm_required");

      const replaced = await host.startNewCampaign(created.value.token, true);
      expect(replaced.ok).toBe(true);
      const founded = await host.getSnapshot(created.value.token);
      if (!founded.ok || !("snapshot" in founded.value)) throw new Error("founding after replace missing");
      expect(founded.value.snapshot.view).toBe("founding");
      expect(founded.value.snapshot.haven.name).toBe("");
      const archiveDb = new NightfallSqlite(path);
      const archives = archiveDb.listArchivedSaves(created.value.profile.profileId);
      expect(archives.length).toBeGreaterThanOrEqual(1);
      expect(archives.some((row) => row.snapshotJson.includes("Mara's Wick"))).toBe(true);
      archiveDb.close();
      await host.close();
    } finally {
      cleanup();
    }
  });

  it("HOST-P05 unmigratable saves do not throw and are preserved", async () => {
    const { path, cleanup } = tempDb();
    try {
      const store = new SQLiteGameStore(path);
      const initial = createInitialSnapshot(build1Pack, 15, "Schema Keep");
      await LocalGameHost.open(store, build1Pack, initial);
      await store.close();
      const db = new NightfallSqlite(path);
      const profiles = db.listProfiles();
      const profileId = profiles[0]?.id;
      if (profileId === undefined) throw new Error("expected migrated/default profile");
      const snapshot = db.loadSnapshot(profileId);
      if (snapshot === undefined) throw new Error("missing snapshot");
      await db.store(profileId).saveInitial({ ...snapshot, schemaVersion: 99 as typeof SNAPSHOT_SCHEMA_VERSION });
      db.close();

      const host = LocalSessionHost.open(path, build1Pack, 15);
      expect(host.health().status).toBe("ok");
      const created = await host.createProfile("Other");
      expect(created.ok).toBe(true);
      const broken = host.listProfiles().find((profile) => profile.profileId === profileId);
      expect(broken?.campaignStatus).toBe("save_unmigratable");
      const inspect = new NightfallSqlite(path);
      const still = inspect.loadSnapshot(profileId);
      expect(still?.schemaVersion).toBe(99);
      expect(still?.haven.name).toBe("Schema Keep");
      inspect.close();
      await host.close();
    } finally {
      cleanup();
    }
  });

  it("HOST-P06 delete requires the exact name and leaves other profiles", async () => {
    const { path, cleanup } = tempDb();
    try {
      const host = LocalSessionHost.open(path, build1Pack, 16);
      const keep = await host.createProfile("Keep");
      const drop = await host.createProfile("Drop");
      if (!keep.ok || !drop.ok) throw new Error("create failed");
      const refused = await host.deleteProfile(drop.value.profile.profileId, "wrong");
      expect(refused.ok).toBe(false);
      if (refused.ok) throw new Error("should refuse");
      expect(refused.body.error).toBe("confirm_mismatch");
      const deleted = await host.deleteProfile(drop.value.profile.profileId, "Drop", undefined, drop.value.token);
      expect(deleted.ok).toBe(true);
      const names = host.listProfiles().map((profile) => profile.displayName);
      expect(names).toEqual(["Keep"]);
      const kept = await host.getSnapshot(keep.value.token);
      expect(kept.ok && "snapshot" in kept.value).toBe(true);
      await host.close();
    } finally {
      cleanup();
    }
  });
});
