import {
  PIN_MAX_LENGTH,
  PIN_MIN_LENGTH,
  PROFILE_NAME_MAX,
  PROFILE_NAME_MIN,
  SESSION_TTL_MS,
  SNAPSHOT_SCHEMA_VERSION,
  type CampaignBindStatus,
  type CommandEnvelope,
  type CommandResult,
  type GameSnapshot,
  type HostErrorBody,
  type HostHealth,
  type LocalProfileSummary,
  type SaveCompatibilityReport,
  type SessionResponse
} from "@nightfall/contracts";
import type { ValidatedContentPack } from "@nightfall/content";
import { randomBytes } from "node:crypto";
import { NightfallSqlite, type ProfileRecord } from "@nightfall/persistence";
import { createFoundingSnapshot } from "@nightfall/sim";
import { createSessionToken, hashPin, hashToken, isValidPin, verifyPin } from "./credentials.js";
import { LocalGameHost } from "./host.js";

export type SessionResult<T> = { ok: true; value: T } | { ok: false; status: number; body: HostErrorBody };

function fail(status: number, error: HostErrorBody["error"], message: string): SessionResult<never> {
  return { ok: false, status, body: { error, message } };
}

function ok<T>(value: T): SessionResult<T> {
  return { ok: true, value };
}

function normalizeName(name: string): string {
  return name.trim().replaceAll(/\s+/g, " ");
}

function validateDisplayName(name: string): string | undefined {
  const displayName = normalizeName(name);
  if (displayName.length < PROFILE_NAME_MIN || displayName.length > PROFILE_NAME_MAX) return undefined;
  return displayName;
}

function compatibility(snapshot: GameSnapshot, pack: ValidatedContentPack): SaveCompatibilityReport | undefined {
  if (snapshot.schemaVersion !== SNAPSHOT_SCHEMA_VERSION) {
    return {
      reasonCode: "save_unmigratable",
      schemaVersion: snapshot.schemaVersion,
      contentVersion: snapshot.contentVersion,
      contentHash: snapshot.contentHash,
      packSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
      packContentVersion: pack.contentVersion,
      packContentHash: pack.contentHash
    };
  }
  if (snapshot.contentVersion !== pack.contentVersion || snapshot.contentHash !== pack.contentHash) {
    return {
      reasonCode: "content_mismatch",
      schemaVersion: snapshot.schemaVersion,
      contentVersion: snapshot.contentVersion,
      contentHash: snapshot.contentHash,
      packSchemaVersion: SNAPSHOT_SCHEMA_VERSION,
      packContentVersion: pack.contentVersion,
      packContentHash: pack.contentHash
    };
  }
  return undefined;
}

function campaignStatus(snapshot: GameSnapshot | undefined, pack: ValidatedContentPack): CampaignBindStatus {
  if (snapshot === undefined) return "none";
  const report = compatibility(snapshot, pack);
  if (report?.reasonCode === "save_unmigratable") return "save_unmigratable";
  if (report?.reasonCode === "content_mismatch") return "content_mismatch";
  if (snapshot.view === "founding") return "founding";
  return "ok";
}

function viewLabel(view: GameSnapshot["view"]): string {
  if (view === "founding") return "Founding";
  if (view === "haven" || view === "postReturn") return "Haven";
  if (view === "map") return "The road";
  if (view === "combat") return "Combat";
  if (view === "reward") return "Reward";
  if (view === "event") return "Event";
  if (view === "rest") return "Rest";
  if (view === "craft") return "Craft";
  if (view === "growth") return "Growth";
  if (view === "waypoint" || view === "returnChoice") return "Waypoint";
  if (view === "returnResults") return "Return";
  if (view === "wipeResults") return "Wipe";
  return "Succession";
}

export class LocalSessionHost {
  readonly #db: NightfallSqlite;
  readonly #pack: ValidatedContentPack;
  #pendingSeed: number | undefined;
  readonly #hosts = new Map<string, LocalGameHost>();
  readonly #pinFailures = new Map<string, number>();

  private constructor(db: NightfallSqlite, pack: ValidatedContentPack, rootSeed: number) {
    this.#db = db;
    this.#pack = pack;
    this.#pendingSeed = rootSeed;
  }

  public static open(savePath: string, pack: ValidatedContentPack, rootSeed: number): LocalSessionHost {
    return new LocalSessionHost(new NightfallSqlite(savePath), pack, rootSeed);
  }

  public health(token?: string): HostHealth {
    const base = {
      status: "ok" as const,
      schemaVersion: SNAPSHOT_SCHEMA_VERSION,
      contentVersion: this.#pack.contentVersion,
      contentHash: this.#pack.contentHash
    };
    if (token === undefined) return base;
    const profile = this.#profileForToken(token);
    if (profile === undefined) return base;
    const summary = this.#summarize(profile);
    return {
      ...base,
      profileId: summary.profileId,
      displayName: summary.displayName,
      campaignStatus: summary.campaignStatus,
      ...(summary.revision === undefined ? {} : { revision: summary.revision }),
      ...(summary.havenName === undefined ? {} : { havenName: summary.havenName }),
      ...(summary.view === undefined ? {} : { view: summary.view })
    };
  }

  public session(token?: string): SessionResponse {
    if (token === undefined) return { authenticated: false };
    const profile = this.#profileForToken(token);
    if (profile === undefined) return { authenticated: false };
    return { authenticated: true, profile: this.#summarize(profile) };
  }

  public listProfiles(): readonly LocalProfileSummary[] {
    return this.#db.listProfiles().map((profile) => this.#summarize(profile));
  }

  public async createProfile(displayName: string, pin?: string): Promise<SessionResult<{ token: string; profile: LocalProfileSummary }>> {
    const name = validateDisplayName(displayName);
    if (name === undefined) return fail(400, "display_name_invalid", "A profile name must be between 2 and 40 characters.");
    if (pin !== undefined && pin.length > 0 && !isValidPin(pin)) return fail(400, "pin_invalid", `A PIN must be ${PIN_MIN_LENGTH}–${PIN_MAX_LENGTH} digits, or left empty.`);
    try {
      const now = Date.now();
      const created = this.#db.createProfile({
        displayName: name,
        pinHash: pin !== undefined && pin.length > 0 ? await hashPin(pin) : null,
        now
      });
      await this.#ensureFounding(created.id);
      const token = this.#issueSession(created.id, now);
      return ok({ token, profile: this.#summarize(this.#db.getProfile(created.id)!) });
    } catch (error) {
      if (error instanceof Error && error.message === "display_name_taken") return fail(409, "display_name_taken", "Another survivor on this host already uses that name.");
      throw error;
    }
  }

  public async selectProfile(profileId: string, pin?: string): Promise<SessionResult<{ token: string; profile: LocalProfileSummary }>> {
    const profile = this.#db.getProfile(profileId);
    if (profile === undefined) return fail(404, "profile_not_found", "That survivor is not on this host.");
    const gated = await this.#checkPin(profile, pin);
    if (gated !== undefined) return gated;
    const now = Date.now();
    this.#db.updateProfile(profileId, { lastOpenedAt: now });
    const token = this.#issueSession(profileId, now);
    return ok({ token, profile: this.#summarize(this.#db.getProfile(profileId)!) });
  }

  public async renameProfile(token: string, profileId: string, displayName: string): Promise<SessionResult<LocalProfileSummary>> {
    const acting = this.#profileForToken(token);
    if (acting === undefined) return fail(401, "unauthenticated", "No survivor is bound to this lantern.");
    if (acting.id !== profileId) return fail(401, "unauthenticated", "That profile is not the bound survivor.");
    const name = validateDisplayName(displayName);
    if (name === undefined) return fail(400, "display_name_invalid", "A profile name must be between 2 and 40 characters.");
    try {
      const updated = this.#db.updateProfile(profileId, { displayName: name });
      return ok(this.#summarize(updated));
    } catch (error) {
      if (error instanceof Error && error.message === "display_name_taken") return fail(409, "display_name_taken", "Another survivor on this host already uses that name.");
      throw error;
    }
  }

  public async setPin(token: string, profileId: string, currentPin: string | undefined, nextPin: string | undefined): Promise<SessionResult<LocalProfileSummary>> {
    const acting = this.#profileForToken(token);
    if (acting === undefined) return fail(401, "unauthenticated", "No survivor is bound to this lantern.");
    if (acting.id !== profileId) return fail(401, "unauthenticated", "That profile is not the bound survivor.");
    const gated = await this.#checkPin(acting, currentPin);
    if (gated !== undefined) return gated;
    if (nextPin !== undefined && nextPin.length > 0 && !isValidPin(nextPin)) return fail(400, "pin_invalid", `A PIN must be ${PIN_MIN_LENGTH}–${PIN_MAX_LENGTH} digits, or left empty.`);
    const pinHash = nextPin !== undefined && nextPin.length > 0 ? await hashPin(nextPin) : null;
    return ok(this.#summarize(this.#db.updateProfile(profileId, { pinHash })));
  }

  public async deleteProfile(profileId: string, confirmName: string, pin?: string, token?: string): Promise<SessionResult<{ deleted: true }>> {
    const profile = this.#db.getProfile(profileId);
    if (profile === undefined) return fail(404, "profile_not_found", "That survivor is not on this host.");
    if (normalizeName(confirmName) !== profile.displayName) return fail(400, "confirm_mismatch", "Type the profile name exactly to confirm deletion.");
    const acting = token === undefined ? undefined : this.#profileForToken(token);
    if (acting?.id !== profileId) {
      const gated = await this.#checkPin(profile, pin);
      if (gated !== undefined) return gated;
    }
    this.#hosts.delete(profileId);
    this.#db.deleteProfile(profileId);
    return ok({ deleted: true });
  }

  public logout(token?: string): void {
    if (token === undefined) return;
    this.#db.deleteSession(hashToken(token));
  }

  public async startNewCampaign(token: string, confirmReplace: boolean): Promise<SessionResult<{ profile: LocalProfileSummary }>> {
    const profile = this.#profileForToken(token);
    if (profile === undefined) return fail(401, "unauthenticated", "No survivor is bound to this lantern.");
    const snapshot = this.#db.loadSnapshot(profile.id);
    const status = campaignStatus(snapshot, this.#pack);
    if (status !== "none" && status !== "founding" && !confirmReplace) {
      return fail(409, "confirm_required", "This survivor already has a Haven. Confirm to leave it and found a new one.");
    }
    if (status === "founding" && !confirmReplace) return ok({ profile: this.#summarize(profile) });
    if (snapshot !== undefined && (status !== "founding" || confirmReplace)) {
      this.#db.archiveSnapshot(profile.id, status === "ok" || status === "founding" ? "replaced" : status, snapshot, Date.now());
      this.#db.clearCampaign(profile.id);
    }
    this.#hosts.delete(profile.id);
    await this.#ensureFounding(profile.id);
    return ok({ profile: this.#summarize(this.#db.getProfile(profile.id)!) });
  }

  public async getSnapshot(token?: string): Promise<SessionResult<{ snapshot: GameSnapshot } | { mismatch: SaveCompatibilityReport; profile: LocalProfileSummary }>> {
    const profile = token === undefined ? undefined : this.#profileForToken(token);
    if (profile === undefined) return fail(401, "unauthenticated", "No survivor is bound to this lantern.");
    const loaded = this.#db.loadSnapshot(profile.id);
    if (loaded === undefined) return fail(409, "campaign_unavailable", "This survivor has not founded a Haven yet.");
    const report = compatibility(loaded, this.#pack);
    if (report !== undefined) return ok({ mismatch: report, profile: this.#summarize(profile) });
    const host = await this.#readyHost(profile.id, loaded);
    return ok({ snapshot: await host.getSnapshot() });
  }

  public async submit(token: string | undefined, command: CommandEnvelope): Promise<SessionResult<CommandResult>> {
    const profile = token === undefined ? undefined : this.#profileForToken(token);
    if (profile === undefined) return fail(401, "unauthenticated", "No survivor is bound to this lantern.");
    const loaded = this.#db.loadSnapshot(profile.id);
    if (loaded === undefined) return fail(409, "campaign_unavailable", "This survivor has not founded a Haven yet.");
    const report = compatibility(loaded, this.#pack);
    if (report !== undefined) return fail(409, report.reasonCode, report.reasonCode === "content_mismatch"
      ? "This Haven was saved with a different content pack. The file is still on this host."
      : "This Haven's save schema cannot be opened. The file is still on this host.");
    const host = await this.#readyHost(profile.id, loaded);
    return ok(await host.submit(command));
  }

  public viewLabel(view: GameSnapshot["view"]): string {
    return viewLabel(view);
  }

  public async close(): Promise<void> {
    this.#hosts.clear();
    this.#db.close();
  }

  async #ensureFounding(profileId: string): Promise<void> {
    if (this.#db.loadSnapshot(profileId) !== undefined) return;
    const snapshot = createFoundingSnapshot(this.#pack, this.#consumeSeed());
    const store = this.#db.store(profileId);
    await store.saveInitial(snapshot);
    this.#hosts.set(profileId, LocalGameHost.bind(store, this.#pack, snapshot));
  }

  async #readyHost(profileId: string, snapshot: GameSnapshot): Promise<LocalGameHost> {
    const existing = this.#hosts.get(profileId);
    if (existing !== undefined) return existing;
    const store = this.#db.store(profileId);
    const opened = await LocalGameHost.tryOpen(store, this.#pack);
    if (opened.status === "ready") {
      this.#hosts.set(profileId, opened.host);
      return opened.host;
    }
    const host = LocalGameHost.bind(store, this.#pack, snapshot);
    this.#hosts.set(profileId, host);
    return host;
  }

  #consumeSeed(): number {
    if (this.#pendingSeed !== undefined) {
      const seed = this.#pendingSeed;
      this.#pendingSeed = undefined;
      return seed;
    }
    return randomBytes(4).readUInt32LE(0);
  }

  #summarize(profile: ProfileRecord): LocalProfileSummary {
    const snapshot = this.#db.loadSnapshot(profile.id);
    const status = campaignStatus(snapshot, this.#pack);
    return {
      profileId: profile.id,
      displayName: profile.displayName,
      hasPin: profile.pinHash !== null,
      createdAt: profile.createdAt,
      lastOpenedAt: profile.lastOpenedAt,
      campaignStatus: status,
      ...(snapshot === undefined || snapshot.haven.name.length === 0 ? {} : { havenName: snapshot.haven.name }),
      ...(snapshot === undefined ? {} : { view: snapshot.view, revision: snapshot.revision })
    };
  }

  #profileForToken(token: string): ProfileRecord | undefined {
    const session = this.#db.getSession(hashToken(token));
    if (session === undefined) return undefined;
    const now = Date.now();
    if (session.expiresAt < now) {
      this.#db.deleteSession(session.tokenHash);
      return undefined;
    }
    this.#db.touchSession(session.tokenHash, now, now + SESSION_TTL_MS);
    return this.#db.getProfile(session.profileId);
  }

  #issueSession(profileId: string, now: number): string {
    const token = createSessionToken();
    this.#db.createSession({ tokenHash: hashToken(token), profileId, now, expiresAt: now + SESSION_TTL_MS });
    return token;
  }

  async #checkPin(profile: ProfileRecord, pin?: string): Promise<SessionResult<never> | undefined> {
    if (profile.pinHash === null) return undefined;
    if (pin === undefined || pin.length === 0) return fail(401, "pin_required", "This survivor is PIN-gated. Enter the PIN to continue.");
    const failures = this.#pinFailures.get(profile.id) ?? 0;
    if (failures > 0) await new Promise((resolve) => setTimeout(resolve, Math.min(1000, 150 * failures)));
    if (!(await verifyPin(pin, profile.pinHash))) {
      this.#pinFailures.set(profile.id, failures + 1);
      return fail(401, "pin_incorrect", "That PIN does not match this survivor.");
    }
    this.#pinFailures.delete(profile.id);
    return undefined;
  }
}
