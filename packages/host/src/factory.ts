import { randomBytes } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { build1Pack } from "@nightfall/content";
import { SQLiteGameStore } from "@nightfall/persistence";
import { createInitialSnapshot } from "@nightfall/sim";
import { LocalGameHost } from "./host.js";

export interface DefaultHostOptions {
  readonly savePath: string;
  readonly rootSeed?: number;
}

export async function openDefaultLocalGameHost(options: DefaultHostOptions): Promise<LocalGameHost> {
  mkdirSync(dirname(options.savePath), { recursive: true });
  const seed = options.rootSeed ?? randomBytes(4).readUInt32LE(0);
  const store = new SQLiteGameStore(options.savePath);
  return LocalGameHost.open(store, build1Pack, createInitialSnapshot(build1Pack, seed));
}
