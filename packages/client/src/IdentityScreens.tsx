import { useState, type FormEvent } from "react";
import type { LocalProfileSummary, SaveCompatibilityReport } from "@nightfall/contracts";

function viewCopy(view: LocalProfileSummary["view"]): string {
  if (view === undefined) return "No Haven yet";
  if (view === "founding") return "Founding";
  if (view === "haven" || view === "postReturn") return "Haven";
  if (view === "map") return "On the road";
  if (view === "combat") return "In combat";
  if (view === "reward") return "Choosing spoils";
  if (view === "event") return "An event";
  if (view === "rest") return "Resting";
  if (view === "craft") return "Crafting";
  if (view === "growth") return "Growth";
  if (view === "waypoint" || view === "returnChoice") return "At the waypoint";
  if (view === "returnResults") return "Returned";
  if (view === "wipeResults") return "Wipe";
  if (view === "succession") return "Succession";
  return view;
}

function campaignCopy(profile: LocalProfileSummary): string {
  if (profile.campaignStatus === "content_mismatch") return "Pack mismatch — save kept";
  if (profile.campaignStatus === "save_unmigratable") return "Cannot migrate this save — file kept";
  if (profile.campaignStatus === "founding") return "Waiting to be named";
  if (profile.campaignStatus === "none") return "No Haven yet";
  const haven = profile.havenName ?? "Unnamed Haven";
  const revision = profile.revision === undefined ? "" : ` · revision ${profile.revision}`;
  return `${haven} · ${viewCopy(profile.view)}${revision}`;
}

export function TitleScreen(props: {
  profiles: readonly LocalProfileSummary[];
  sessionProfile?: LocalProfileSummary;
  busy: boolean;
  error?: string;
  onContinue: () => void;
  onNewCampaign: () => void;
  onCreate: (displayName: string, pin?: string) => Promise<boolean>;
  onSelect: (profileId: string, pin?: string) => Promise<boolean>;
  onRename: (profileId: string, displayName: string) => Promise<boolean>;
  onDelete: (profileId: string, confirmName: string, pin?: string) => Promise<boolean>;
  onLogout: () => void;
  onDismissError: () => void;
}) {
  const bound = props.sessionProfile;
  const canContinue = bound !== undefined && (bound.campaignStatus === "ok" || bound.campaignStatus === "founding");
  const canNew = bound !== undefined;
  return <div className="identity-shell">
    <header className="identity-brand">
      <img className="lantern-mark" src="/art/brand/nightfall-lantern-mark.webp" alt="" />
      <p><small>Vesper field ledger</small></p>
      <h1>Nightfall</h1>
      <p className="identity-lead">A named Haven on this host. Survivors here are local — no cloud, no account beyond this lantern.</p>
    </header>
    {bound !== undefined && <section className="identity-panel identity-continue" aria-label="Continue">
      <span>Bound survivor</span>
      <strong>{bound.displayName}</strong>
      <p>{campaignCopy(bound)}</p>
      <div className="identity-actions">
        {canContinue && <button type="button" className="primary" disabled={props.busy} onClick={props.onContinue} autoFocus={canContinue}>Continue</button>}
        {canNew && <button type="button" disabled={props.busy} onClick={props.onNewCampaign}>New campaign</button>}
        <button type="button" className="quiet" disabled={props.busy} onClick={props.onLogout}>Switch survivor</button>
      </div>
    </section>}
    <ProfileList
      profiles={props.profiles}
      boundId={bound?.profileId}
      busy={props.busy}
      onCreate={props.onCreate}
      onSelect={props.onSelect}
      onRename={props.onRename}
      onDelete={props.onDelete}
    />
    {props.error !== undefined && <p className="identity-error" role="alert">{props.error} <button type="button" className="quiet" onClick={props.onDismissError}>Dismiss</button></p>}
  </div>;
}

function ProfileList(props: {
  profiles: readonly LocalProfileSummary[];
  boundId?: string;
  busy: boolean;
  onCreate: (displayName: string, pin?: string) => Promise<boolean>;
  onSelect: (profileId: string, pin?: string) => Promise<boolean>;
  onRename: (profileId: string, displayName: string) => Promise<boolean>;
  onDelete: (profileId: string, confirmName: string, pin?: string) => Promise<boolean>;
}) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [selectPins, setSelectPins] = useState<Record<string, string>>({});
  const [renames, setRenames] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState<string | undefined>();
  const [confirmText, setConfirmText] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await props.onCreate(name, pin.length === 0 ? undefined : pin);
    if (ok) { setName(""); setPin(""); }
  };

  return <section className="identity-panel" aria-label="Local survivors">
    <h2>Survivors on this host</h2>
    {props.profiles.length === 0 ? <p className="empty">No one has claimed a lantern here yet. Name a survivor to found a Haven.</p> : <ul className="identity-profiles">
      {props.profiles.map((profile) => {
        const selected = profile.profileId === props.boundId;
        return <li key={profile.profileId} className={selected ? "is-bound" : undefined}>
          <div>
            <div className="identity-profile-head">
              <strong>{profile.displayName}</strong>
              {profile.hasPin && <span className="identity-pin-tag">PIN</span>}
              {selected && <span className="identity-pin-tag">Bound</span>}
            </div>
            <p>{campaignCopy(profile)}</p>
          </div>
          <div className="identity-profile-actions">
            {profile.hasPin && <label>PIN<input type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={selectPins[profile.profileId] ?? ""} onChange={(event) => setSelectPins((current) => ({ ...current, [profile.profileId]: event.target.value }))} /></label>}
            <button type="button" className={selected ? "primary" : undefined} disabled={props.busy} onClick={() => void props.onSelect(profile.profileId, selectPins[profile.profileId])}>{selected ? "Open" : "Select"}</button>
            {confirming !== profile.profileId && <button type="button" className="quiet" disabled={props.busy} onClick={() => { setConfirming(profile.profileId); setConfirmText(""); setConfirmPin(""); }}>Delete</button>}
          </div>
          {selected && <div className="identity-rename-row">
            <label className="identity-rename">Rename survivor<input value={renames[profile.profileId] ?? profile.displayName} maxLength={40} onChange={(event) => setRenames((current) => ({ ...current, [profile.profileId]: event.target.value }))} /></label>
            <button type="button" className="quiet" disabled={props.busy} onClick={() => void props.onRename(profile.profileId, renames[profile.profileId] ?? profile.displayName)}>Save name</button>
          </div>}
          {confirming === profile.profileId && <div className="identity-confirm">
            <p>Type <strong>{profile.displayName}</strong> to delete this survivor and their Haven. This cannot be undone.</p>
            <label>Confirm name<input value={confirmText} maxLength={40} onChange={(event) => setConfirmText(event.target.value)} autoComplete="off" /></label>
            {profile.hasPin && <label>PIN<input type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={confirmPin} onChange={(event) => setConfirmPin(event.target.value)} /></label>}
            <div className="identity-actions">
              <button type="button" disabled={props.busy || confirmText !== profile.displayName} onClick={() => void props.onDelete(profile.profileId, confirmText, confirmPin.length === 0 ? undefined : confirmPin)}>Delete forever</button>
              <button type="button" className="quiet" onClick={() => { setConfirming(undefined); setConfirmText(""); setConfirmPin(""); }}>Cancel</button>
            </div>
          </div>}
        </li>;
      })}
    </ul>}
    <form className="identity-create" onSubmit={(event) => void onCreate(event)}>
      <h3>New survivor</h3>
      <label>Name<input value={name} maxLength={40} required minLength={2} onChange={(event) => setName(event.target.value)} autoComplete="nickname" /></label>
      <label>Optional PIN<input type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={pin} onChange={(event) => setPin(event.target.value)} /></label>
      <p className="identity-hint">Only if others share this host. 4–8 digits, or leave empty.</p>
      <div className="identity-actions">
        <button type="submit" className="primary" disabled={props.busy || name.trim().length < 2}>Create</button>
      </div>
    </form>
  </section>;
}

export function FoundingScreen(props: {
  busy: boolean;
  error?: string;
  onFound: (name: string) => void;
  onSwitch: () => void;
}) {
  const [name, setName] = useState("");
  return <div className="identity-shell">
    <header className="identity-brand">
      <img className="lantern-mark" src="/art/brand/nightfall-lantern-mark.webp" alt="" />
      <p><small>Founding</small></p>
      <h1>Name this Haven</h1>
      <p className="identity-lead">Pillarhouse stands with ten lights. Rook the Vanguard and Mara the Aether Weaver will hold it. There is no class to pick — only a name the settlement can keep.</p>
    </header>
    <form className="identity-panel identity-found" onSubmit={(event) => { event.preventDefault(); if (name.trim().length >= 2) props.onFound(name); }}>
      <ul className="identity-roster" aria-label="Starting expedition pair">
        <li><strong>Rook</strong><span>Vanguard</span></li>
        <li><strong>Mara</strong><span>Aether Weaver</span></li>
      </ul>
      <label>Haven name<input value={name} maxLength={40} minLength={2} required autoFocus onChange={(event) => setName(event.target.value)} /></label>
      <div className="identity-actions">
        <button type="submit" className="primary" disabled={props.busy || name.trim().length < 2}>Found this Haven</button>
        <button type="button" className="quiet" disabled={props.busy} onClick={props.onSwitch}>Switch survivor</button>
      </div>
    </form>
    {props.error !== undefined && <p className="identity-error" role="alert">{props.error}</p>}
  </div>;
}

export function MismatchScreen(props: {
  mismatch: SaveCompatibilityReport;
  profile: LocalProfileSummary;
  busy: boolean;
  error?: string;
  onKeep: () => void;
  onReplace: () => void;
  onSwitch: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const packChanged = props.mismatch.reasonCode === "content_mismatch";
  return <div className="identity-shell">
    <header className="identity-brand">
      <img className="lantern-mark" src="/art/brand/nightfall-lantern-mark.webp" alt="" />
      <p><small>{props.profile.displayName}</small></p>
      <h1>{packChanged ? "This pack cannot open that Haven" : "This save cannot be migrated"}</h1>
      <p className="identity-lead">The file is still on this host. Nothing has been deleted. Other survivors are untouched.</p>
    </header>
    <section className="identity-panel">
      <p>{packChanged
        ? `Saved pack ${props.mismatch.contentVersion} (${props.mismatch.contentHash.slice(0, 8)}…) does not match the host pack ${props.mismatch.packContentVersion} (${props.mismatch.packContentHash.slice(0, 8)}…).`
        : `Saved schema ${props.mismatch.schemaVersion} cannot be opened as schema ${props.mismatch.packSchemaVersion}.`}</p>
      <div className="identity-actions">
        <button type="button" className="primary" onClick={props.onKeep}>Keep the file</button>
        <button type="button" className="quiet" onClick={props.onSwitch}>Switch survivor</button>
      </div>
      <label className="identity-confirm-check">
        <input type="checkbox" checked={confirm} onChange={(event) => setConfirm(event.target.checked)} />
        Archive this save and found a new Haven for {props.profile.displayName}
      </label>
      <button type="button" disabled={props.busy || !confirm} onClick={props.onReplace}>Found a new Haven</button>
    </section>
    {props.error !== undefined && <p className="identity-error" role="alert">{props.error}</p>}
  </div>;
}

export function NewCampaignConfirm(props: {
  profile: LocalProfileSummary;
  busy: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return <div className="identity-shell">
    <header className="identity-brand">
      <img className="lantern-mark" src="/art/brand/nightfall-lantern-mark.webp" alt="" />
      <p><small>{props.profile.displayName}</small></p>
      <h1>Leave this Haven?</h1>
      <p className="identity-lead">{props.profile.havenName ?? "The current campaign"} will be archived on this host. You will name a new Haven. This does not delete other survivors.</p>
    </header>
    <section className="identity-panel">
      <label className="identity-confirm-check">
        <input type="checkbox" checked={confirm} onChange={(event) => setConfirm(event.target.checked)} />
        Archive the current campaign and found a new Haven
      </label>
      <div className="identity-actions">
        <button type="button" className="primary" disabled={props.busy || !confirm} onClick={props.onConfirm}>Found a new Haven</button>
        <button type="button" className="quiet" disabled={props.busy} onClick={props.onCancel}>Cancel</button>
      </div>
    </section>
    {props.error !== undefined && <p className="identity-error" role="alert">{props.error}</p>}
  </div>;
}
