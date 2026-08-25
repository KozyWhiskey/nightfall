import type {
  GameSnapshot,
  HostErrorBody,
  LocalProfileSummary,
  SaveCompatibilityReport,
  SessionResponse
} from "@nightfall/contracts";

const jsonHeaders = { accept: "application/json", "content-type": "application/json" } as const;
const fetchOptions: RequestInit = { credentials: "same-origin", cache: "no-store" };

async function readJson<T>(response: Response): Promise<T> {
  return await response.json() as T;
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const response = await fetch("/api/health", { ...fetchOptions, headers: { accept: "application/json" } });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchSession(): Promise<SessionResponse> {
  const response = await fetch("/api/session", { ...fetchOptions, headers: { accept: "application/json" } });
  if (!response.ok) return { authenticated: false };
  return readJson<SessionResponse>(response);
}

export async function fetchProfiles(): Promise<readonly LocalProfileSummary[]> {
  const response = await fetch("/api/profiles", { ...fetchOptions, headers: { accept: "application/json" } });
  if (!response.ok) return [];
  const body = await readJson<{ profiles: LocalProfileSummary[] }>(response);
  return body.profiles;
}

export type SnapshotLoad =
  | { kind: "snapshot"; snapshot: GameSnapshot }
  | { kind: "mismatch"; mismatch: SaveCompatibilityReport; profile: LocalProfileSummary }
  | { kind: "error"; message: string };

export async function fetchPlaySnapshot(): Promise<SnapshotLoad> {
  const response = await fetch("/api/snapshot", { ...fetchOptions, headers: { accept: "application/json" } });
  const body = await readJson<GameSnapshot | (HostErrorBody & { mismatch?: SaveCompatibilityReport; profile?: LocalProfileSummary })>(response);
  if (response.ok) return { kind: "snapshot", snapshot: body as GameSnapshot };
  if ("mismatch" in body && body.mismatch !== undefined && body.profile !== undefined) {
    return { kind: "mismatch", mismatch: body.mismatch, profile: body.profile };
  }
  return { kind: "error", message: "message" in body && typeof body.message === "string" ? body.message : "Could not read this Haven." };
}

async function send(path: string, method: string, payload?: Record<string, unknown>): Promise<{ ok: true; body: unknown } | { ok: false; message: string }> {
  const response = await fetch(path, {
    ...fetchOptions,
    method,
    headers: jsonHeaders,
    ...(payload === undefined ? {} : { body: JSON.stringify(payload) })
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (response.ok) return { ok: true, body };
  const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
    ? body.message
    : "The local host refused that request.";
  return { ok: false, message };
}

export async function createProfileRequest(displayName: string, pin?: string): Promise<{ ok: true; profile: LocalProfileSummary } | { ok: false; message: string }> {
  const result = await send("/api/profiles", "POST", { displayName, ...(pin === undefined || pin.length === 0 ? {} : { pin }) });
  if (!result.ok) return result;
  return { ok: true, profile: (result.body as { profile: LocalProfileSummary }).profile };
}

export async function selectProfileRequest(profileId: string, pin?: string): Promise<{ ok: true; profile: LocalProfileSummary } | { ok: false; message: string }> {
  const result = await send(`/api/profiles/${profileId}/select`, "POST", { ...(pin === undefined || pin.length === 0 ? {} : { pin }) });
  if (!result.ok) return result;
  return { ok: true, profile: (result.body as { profile: LocalProfileSummary }).profile };
}

export async function renameProfileRequest(profileId: string, displayName: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await send(`/api/profiles/${profileId}`, "PATCH", { displayName });
  return result.ok ? { ok: true } : result;
}

export async function deleteProfileRequest(profileId: string, confirmName: string, pin?: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const result = await send(`/api/profiles/${profileId}`, "DELETE", { confirmName, ...(pin === undefined || pin.length === 0 ? {} : { pin }) });
  return result.ok ? { ok: true } : result;
}

export async function logoutRequest(): Promise<void> {
  await send("/api/session/logout", "POST");
}

export async function newCampaignRequest(confirmReplace: boolean): Promise<{ ok: true; profile: LocalProfileSummary } | { ok: false; message: string }> {
  const result = await send("/api/campaigns/new", "POST", { confirmReplace });
  if (!result.ok) return result;
  return { ok: true, profile: (result.body as { profile: LocalProfileSummary }).profile };
}
