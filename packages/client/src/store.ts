import type { CommandType, GameSnapshot, ResolvedFact } from "@nightfall/contracts";
import { create } from "zustand";
import { HttpGameHost } from "./transport.js";

const host = new HttpGameHost();

/** commandId only — not gameplay RNG. randomUUID is secure-context-only; LAN http://hermes.local needs a fallback. */
function createCommandId(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();
  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

interface NightfallUiState {
  snapshot?: GameSnapshot;
  loading: boolean;
  busy: boolean;
  error?: string;
  facts: readonly ResolvedFact[];
  load: () => Promise<void>;
  submit: (type: CommandType, payload?: Record<string, unknown>, actorId?: string) => Promise<void>;
  clearError: () => void;
}

export const useNightfall = create<NightfallUiState>((set, get) => ({
  loading: true,
  busy: false,
  facts: [],
  load: async () => {
    set({ loading: true, error: undefined });
    try { const snapshot = await host.getSnapshot(); set({ snapshot, facts: snapshot.latestFacts, loading: false }); }
    catch (error) { set({ loading: false, error: error instanceof Error ? error.message : "Could not reach the local host." }); }
  },
  submit: async (type, payload = {}, actorId) => {
    const snapshot = get().snapshot;
    if (snapshot === undefined || get().busy) return;
    set({ busy: true, error: undefined });
    try {
      const result = await host.submit({ commandId: createCommandId(), expectedRevision: snapshot.revision, type, ...(actorId === undefined ? {} : { actorId }), payload });
      if (result.status === "accepted") set({ snapshot: result.snapshot, facts: result.facts, busy: false });
      else set({ snapshot: result.snapshot ?? snapshot, error: result.reasonCode.replaceAll("_", " "), busy: false });
    } catch (error) { set({ error: error instanceof Error ? error.message : "The local host did not answer.", busy: false }); }
  },
  clearError: () => set({ error: undefined })
}));
