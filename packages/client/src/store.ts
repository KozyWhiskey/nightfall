import type { CommandType, GameSnapshot, LocalProfileSummary, ResolvedFact, SaveCompatibilityReport, SessionResponse } from "@nightfall/contracts";
import { create } from "zustand";
import {
  createProfileRequest,
  deleteProfileRequest,
  fetchHealth,
  fetchPlaySnapshot,
  fetchProfiles,
  fetchSession,
  logoutRequest,
  newCampaignRequest,
  renameProfileRequest,
  selectProfileRequest
} from "./identity.js";
import { HttpGameHost } from "./transport.js";

const host = new HttpGameHost();

export type BootStage = "loading" | "title" | "mismatch" | "play" | "host_down";

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
  boot: BootStage;
  snapshot?: GameSnapshot;
  loading: boolean;
  busy: boolean;
  error?: string;
  facts: readonly ResolvedFact[];
  profiles: readonly LocalProfileSummary[];
  session: SessionResponse;
  mismatch?: SaveCompatibilityReport;
  mismatchProfile?: LocalProfileSummary;
  load: () => Promise<void>;
  createProfile: (displayName: string, pin?: string) => Promise<boolean>;
  selectProfile: (profileId: string, pin?: string) => Promise<boolean>;
  renameProfile: (profileId: string, displayName: string) => Promise<boolean>;
  deleteProfile: (profileId: string, confirmName: string, pin?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  startNewCampaign: (confirmReplace: boolean) => Promise<boolean>;
  showTitle: () => Promise<void>;
  continuePlay: () => Promise<void>;
  submit: (type: CommandType, payload?: Record<string, unknown>, actorId?: string) => Promise<void>;
  clearError: () => void;
}

async function refreshCatalog(): Promise<{ session: SessionResponse; profiles: readonly LocalProfileSummary[] }> {
  const [session, profiles] = await Promise.all([fetchSession(), fetchProfiles()]);
  return { session, profiles };
}

async function hydratePlay(set: (partial: Partial<NightfallUiState>) => void): Promise<void> {
  const loaded = await fetchPlaySnapshot();
  if (loaded.kind === "snapshot") {
    set({ boot: "play", snapshot: loaded.snapshot, facts: loaded.snapshot.latestFacts, mismatch: undefined, mismatchProfile: undefined, loading: false, error: undefined });
    return;
  }
  if (loaded.kind === "mismatch") {
    set({ boot: "mismatch", snapshot: undefined, mismatch: loaded.mismatch, mismatchProfile: loaded.profile, loading: false, error: undefined });
    return;
  }
  set({ boot: "title", snapshot: undefined, loading: false, error: loaded.message });
}

export const useNightfall = create<NightfallUiState>((set, get) => ({
  boot: "loading",
  loading: true,
  busy: false,
  facts: [],
  profiles: [],
  session: { authenticated: false },
  load: async () => {
    set({ loading: true, error: undefined, boot: "loading" });
    try {
      if (!(await fetchHealth())) {
        set({ boot: "host_down", loading: false, snapshot: undefined, error: "Could not reach the local host." });
        return;
      }
      const [session, profiles] = await Promise.all([fetchSession(), fetchProfiles()]);
      set({ session, profiles });
      if (!session.authenticated || session.profile === undefined) {
        set({ boot: "title", loading: false, snapshot: undefined, mismatch: undefined, mismatchProfile: undefined });
        return;
      }
      if (session.profile.campaignStatus === "none") {
        const started = await newCampaignRequest(false);
        if (!started.ok) {
          set({ boot: "title", loading: false, error: started.message });
          return;
        }
      }
      await hydratePlay(set);
    } catch (error) {
      set({ boot: "host_down", loading: false, error: error instanceof Error ? error.message : "Could not reach the local host." });
    }
  },
  createProfile: async (displayName, pin) => {
    set({ busy: true, error: undefined });
    const result = await createProfileRequest(displayName, pin);
    if (!result.ok) {
      set({ busy: false, error: result.message });
      return false;
    }
    set({ busy: false, session: { authenticated: true, profile: result.profile } });
    await get().load();
    return true;
  },
  selectProfile: async (profileId, pin) => {
    set({ busy: true, error: undefined });
    const result = await selectProfileRequest(profileId, pin);
    if (!result.ok) {
      set({ busy: false, error: result.message });
      return false;
    }
    set({ busy: false, session: { authenticated: true, profile: result.profile } });
    await get().load();
    return true;
  },
  renameProfile: async (profileId, displayName) => {
    set({ busy: true, error: undefined });
    const result = await renameProfileRequest(profileId, displayName);
    if (!result.ok) {
      set({ busy: false, error: result.message });
      return false;
    }
    set({ profiles: await fetchProfiles(), session: await fetchSession(), busy: false });
    return true;
  },
  deleteProfile: async (profileId, confirmName, pin) => {
    set({ busy: true, error: undefined });
    const result = await deleteProfileRequest(profileId, confirmName, pin);
    if (!result.ok) {
      set({ busy: false, error: result.message });
      return false;
    }
    set({ busy: false });
    await get().load();
    return true;
  },
  logout: async () => {
    await logoutRequest();
    set({ session: { authenticated: false }, snapshot: undefined, mismatch: undefined, mismatchProfile: undefined, facts: [] });
    await get().load();
  },
  startNewCampaign: async (confirmReplace) => {
    set({ busy: true, error: undefined });
    const result = await newCampaignRequest(confirmReplace);
    if (!result.ok) {
      set({ busy: false, error: result.message });
      return false;
    }
    set({ session: { authenticated: true, profile: result.profile }, busy: false });
    await hydratePlay(set);
    return true;
  },
  showTitle: async () => {
    const catalog = await refreshCatalog();
    set({ boot: "title", error: undefined, ...catalog });
  },
  continuePlay: async () => {
    set({ loading: true, error: undefined });
    await hydratePlay(set);
  },
  submit: async (type, payload = {}, actorId) => {
    const snapshot = get().snapshot;
    if (snapshot === undefined || get().busy) return;
    set({ busy: true, error: undefined });
    try {
      const result = await host.submit({ commandId: createCommandId(), expectedRevision: snapshot.revision, type, ...(actorId === undefined ? {} : { actorId }), payload });
      if (result.status === "accepted") {
        const catalog = await refreshCatalog();
        set({ snapshot: result.snapshot, facts: result.facts, busy: false, ...catalog });
      }
      else set({ snapshot: result.snapshot ?? snapshot, error: result.reasonCode.replaceAll("_", " "), busy: false });
    } catch (error) { set({ error: error instanceof Error ? error.message : "The local host did not answer.", busy: false }); }
  },
  clearError: () => set({ error: undefined })
}));
