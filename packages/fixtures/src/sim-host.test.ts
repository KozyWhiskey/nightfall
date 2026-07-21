import { existsSync, rmSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { build1Pack } from "@nightfall/content";
import { LocalGameHost, replayAcceptedCommands } from "@nightfall/host";
import { InMemoryGameStore, SQLiteGameStore } from "@nightfall/persistence";
import { createInitialSnapshot } from "@nightfall/sim";
import { command } from "./index.js";

describe("SIM-16 reload, replay, and idempotence", () => {
  it("returns the original accepted result for duplicate commandId and rejects stale mutation", async () => {
    const initial = createInitialSnapshot(build1Pack, 777);
    const store = new InMemoryGameStore();
    const host = await LocalGameHost.open(store, build1Pack, initial);
    const embark = command(initial, "commitEmbark", {}, undefined, "accepted-once");
    const first = await host.submit(embark);
    expect(first.status).toBe("accepted");
    const duplicate = await host.submit(embark);
    expect(duplicate).toEqual(first);
    const stale = await host.submit({ ...embark, commandId: "stale-command" });
    expect(stale.status).toBe("rejected");
    if (stale.status === "rejected") expect(stale.reasonCode).toBe("stale_revision");
    expect((await host.getSnapshot()).revision).toBe(1);

    const resumed = await LocalGameHost.open(store, build1Pack, initial);
    expect(await resumed.getSnapshot()).toEqual(first.status === "accepted" ? first.snapshot : undefined);
    expect(await resumed.submit(embark)).toEqual(first);
  });

  it("replays accepted commands and records one local terminal diagnostic", async () => {
    const initial = createInitialSnapshot(build1Pack, 778);
    const store = new InMemoryGameStore();
    const host = await LocalGameHost.open(store, build1Pack, initial);
    const embark = await host.submit(command(initial, "commitEmbark", {}, undefined, "embark"));
    if (embark.status !== "accepted") throw new Error("Embark failed");
    const wipe = await host.submit(command(embark.snapshot, "abandonExpedition", {}, undefined, "abandon"));
    expect(wipe.status).toBe("accepted");
    const records = await store.listAcceptedCommands();
    const replayed = replayAcceptedCommands(initial, records, build1Pack);
    expect(replayed).toEqual(wipe.status === "accepted" ? wipe.snapshot : undefined);
    const runs = await store.listRunRecords();
    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({ result: "wipe", contentHash: build1Pack.contentHash });
  });

  it("persists and resumes the exact SQLite snapshot at successive autosave boundaries", async () => {
    const path = `C:/tmp/nightfall-sim16-${process.pid}.sqlite`;
    const cleanup = () => { for (const candidate of [path, `${path}-wal`, `${path}-shm`]) if (existsSync(candidate)) rmSync(candidate); };
    cleanup();
    try {
      const initial = createInitialSnapshot(build1Pack, 779);
      let store = new SQLiteGameStore(path);
      let host = await LocalGameHost.open(store, build1Pack, initial);
      const named = await host.submit(command(initial, "nameHaven", { name: "Lantern's Rest" }, undefined, "name"));
      if (named.status !== "accepted") throw new Error("Name command failed");
      await host.close();

      store = new SQLiteGameStore(path); host = await LocalGameHost.open(store, build1Pack, initial);
      expect(await host.getSnapshot()).toEqual(named.snapshot);
      const embarked = await host.submit(command(named.snapshot, "commitEmbark", {}, undefined, "embark"));
      if (embarked.status !== "accepted") throw new Error("Embark failed");
      await host.close();

      store = new SQLiteGameStore(path); host = await LocalGameHost.open(store, build1Pack, initial);
      expect(await host.getSnapshot()).toEqual(embarked.snapshot);
      const entered = await host.submit(command(embarked.snapshot, "chooseMapEdge", { edgeId: "edge_01" }, undefined, "travel"));
      if (entered.status !== "accepted") throw new Error("Travel failed");
      await host.close();

      store = new SQLiteGameStore(path); host = await LocalGameHost.open(store, build1Pack, initial);
      expect(await host.getSnapshot()).toEqual(entered.snapshot);
      expect(await host.submit(command(embarked.snapshot, "chooseMapEdge", { edgeId: "edge_01" }, undefined, "travel"))).toEqual(entered);
      await host.close();
    } finally {
      cleanup();
    }
  });
});
