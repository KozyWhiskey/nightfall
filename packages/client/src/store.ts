import type { CommandType, GameSnapshot, ResolvedFact } from "@nightfall/contracts";
import { create } from "zustand";
import { HttpGameHost } from "./transport.js";

const host = new HttpGameHost();

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
      const result = await host.submit({ commandId: globalThis.crypto.randomUUID(), expectedRevision: snapshot.revision, type, ...(actorId === undefined ? {} : { actorId }), payload });
      if (result.status === "accepted") set({ snapshot: result.snapshot, facts: result.facts, busy: false });
      else set({ snapshot: result.snapshot ?? snapshot, error: result.reasonCode.replaceAll("_", " "), busy: false });
    } catch (error) { set({ error: error instanceof Error ? error.message : "The local host did not answer.", busy: false }); }
  },
  clearError: () => set({ error: undefined })
}));
