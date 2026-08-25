# Change Spec: Local identity, campaign resume, and founding UX

**Kind:** new_capability  
**Status:** shipped  
**Last updated:** 2026-08-24  
**Decision Register:** `identity.local_profiles` (new — this change)  
**Related:** [Current Scope](../../product/current-scope.md), [Vertical-Slice Handoff](../../product/vertical-slice-handoff.md), [Build 1 Architecture](../../architecture/build-1-architecture.md), [Local development](../../architecture/local-development.md), [Interaction Contract](../../ux/interaction-contract.md), [Screens and Flows](../../ux/screens-and-flows.md), [Expedition State Machine](../../systems/expedition-state-machine.md), [Player Fantasy](../../vision/player-fantasy.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md)

## Summary

The LAN host currently boots one implicit campaign, skips Haven founding (default name `"The Last Lantern"`, `view: "haven"`), and **exits the process** when `LocalGameHost.open` throws `content_mismatch` or `save_unmigratable`. That is a product failure, not a login system. Friends sharing a box cannot keep isolated Havens; refresh/restart resume only works if the single SQLite file matches the current pack; a pack change takes the host down.

This capability adds **local survivor profiles** (named identity + optional PIN + durable host session), **one isolated campaign per profile**, a real **founding** step that names the Haven before the Hub, **Continue** onto the exact saved snapshot (Haven, expedition, combat including `awaitingEngage`), and a **mismatch screen** that keeps the host up and preserves the file unless the player confirms a new campaign.

This is not cloud identity. No OAuth, email, public user database, co-op lobby, friends list, Need/Greed, or class/character creator.

## Authority

Vertical-slice handoff player flow step 1:

> Create/name a Haven with 10 lit pillars, a built Pillarhouse, and two playable core heroes: Vanguard and Aether Weaver.

Expedition state machine:

> Closing the game is never abandonment: the exact run state resumes.

Architecture persistence:

> An unmigratable save is preserved and reported rather than overwritten.

Architecture host protocol is snapshot + revisioned commands; UI never owns game truth.

Current scope (to be amended by this spec) deferred “player accounts.” That deferral means **cloud/OAuth/email accounts, friend lists, and lobby ownership**, not “one anonymous SQLite file and a process crash on pack change.” Player fantasy (“each account has a named Haven”) is the local LAN shape of that rule.

`scope.party` remains: fixed Vanguard + Aether Weaver. No class select.

## Classification rationale

**new_capability.** Current-scope and architecture currently exclude “accounts” and describe a single local save. Implementing profiles, sessions, founding-as-a-required view, and non-fatal mismatch reporting changes player-facing rules and Locked/Accepted docs. It stays out of the Build 1 executable path until this spec is approved. Craig authorized this capability in the implementing thread; the Decision Register / current-scope amendments below are part of the same change.

## Design

### Local profile (LAN credential)

A **profile** is a named survivor identity on this host machine.

| Field | Rule |
|---|---|
| `profileId` | Opaque id (UUID). Never a gameplay actor id. |
| `displayName` | 2–40 trimmed characters. Unique among profiles on this host (case-insensitive). |
| PIN | Optional. 4–8 digits if set. Stored as scrypt hash + salt in SQLite. Never returned to the client. Never sent to `sim`. |
| Session | Host-issued opaque token in an `HttpOnly` `SameSite=Lax` cookie `nightfall_session`. Token hash persisted. Survives refresh and host restart. 30-day sliding TTL. Not `Secure` (LAN HTTP). |

Selecting a PIN-protected profile without the PIN fails with a plain-language error. Profiles with no PIN select on click/Enter. Rate-limit PIN checks in-process (delay after repeated failures); do not invent account lockout email flows.

Destructive delete requires typing the profile display name. Deleting a profile deletes only that profile’s campaign envelopes (and archives nothing unless a mismatch archive already exists). Other profiles are untouched.

### One campaign per profile

Each profile owns at most one campaign. Isolation is by `profile_id` on persistence envelopes in the **same** SQLite file (not a second rules engine). `campaignId` inside the snapshot may remain `"campaign_1"`; the database primary key is the profile.

`NIGHTFALL_SEED` applies only when **that profile** has no snapshot yet.

### Founding

Player new-campaign path uses `createFoundingSnapshot`:

- Starting slice state matches today’s founded snapshot: Pillarhouse built, other core buildings available/unavailable as now, 10 lit pillars, Gloom 0, fixed Rook/Mara pair, starter gear.
- `view: "founding"`.
- `haven.name` is empty. Hub, embark, buildings, and loadout commands stay illegal (`invalid_phase`) until the Haven is named.
- `nameHaven` on `founding` accepts a 2–40 character name, writes `haven.name`, sets `view: "haven"`, emits `haven_named`. That is the founding ceremony.
- `nameHaven` on `haven` remains a later rename (existing).
- Fixtures keep `createInitialSnapshot` (already named, `view: "haven"`) so existing `SIM-*` suites do not all grow a founding step. The player path must not call that skip.

Resume mid-founding lands on founding, not a new seed.

### Title / Continue / New

Boot is a **Title** surface, not an auto-load into Haven.

- Valid session + playable campaign → **Continue** (Haven name, view label, revision) resumes `GET /api/snapshot` as the exact stored snapshot. **New campaign** on that profile requires confirmation and replaces only after confirm (see mismatch/replace).
- Valid session + founding → founding screen (not Hub).
- Valid session + mismatch/unmigratable → mismatch screen (not a crash, not a silent wipe).
- No session → profile list: create, select (PIN if set), rename, delete-with-confirm.
- After create, if the new profile has no campaign, go to founding (do not invent a default Haven name).

Continue is not “roll a new seed and hope.” Host loads `active_run` else `campaign_save` for **that profile**, same as today’s `SQLiteGameStore.loadSnapshot` order.

### Mismatch / unmigratable

`apps/local-host` **must listen** even when a bound campaign cannot be opened. `LocalGameHost.open` throwing at process boot is the defect.

Compatibility check (schema version, content version, content hash) runs when binding a profile’s snapshot, not as a fatal top-level `await` before `app.listen`.

On mismatch or unmigratable:

1. Preserve the snapshot JSON (do not overwrite).
2. Report via health/session/profile DTOs and a dedicated UI: what is wrong in plain language (pack changed vs schema the host cannot migrate).
3. Offer **keep the file** (stay on this screen; host stays up; other profiles still playable).
4. Offer **new campaign** only after explicit confirm. Confirmed replace archives the old snapshot JSON in an `archived_save` row (profile id, reason, timestamps, payload) then writes a founding snapshot. Never `rm -rf .nightfall` as the product path.

Other profiles on the same host are unaffected.

### Save path (cwd fact)

`pnpm --filter @nightfall/local-host dev` runs with package cwd, so today’s default `join(process.cwd(), ".nightfall", "nightfall.sqlite")` is **`apps/local-host/.nightfall/nightfall.sqlite`**, not the repo-root folder documented in AGENTS.md. `pnpm start` from repo root would use a **different** file. That split-brain is a persistence bug.

Root-cause: resolve the default save path from `import.meta.url` (`apps/local-host/.nightfall/nightfall.sqlite` from both `src/` and `dist/`). If that file is missing and repo-root `.nightfall/nightfall.sqlite` exists, adopt it once (copy or open) so existing play is not orphaned. `NIGHTFALL_SAVE_PATH` still overrides.

### Process architecture

```text
apps/local-host  →  LocalSessionHost (always starts, owns SQLite + cookies)
                      ├─ profile / session catalog
                      └─ per bound profile: LocalGameHost | founding snapshot | mismatch report
packages/host    →  LocalGameHost unchanged as GameHost for a ready campaign
packages/sim     →  founding view + nameHaven phase only; no identity, cookies, or SQLite
packages/client  →  Title / profiles / founding / mismatch / existing views from snapshots
```

Profile CRUD and session are **host HTTP**, not `sim.applyCommand`. Gameplay commands stay the existing envelope on `POST /api/commands` and still require a bound playable (or founding) snapshot.

### HTTP

Keep `GET /api/health` always 200 while the process is up (`status: "ok"`), including pack versions from the loaded content pack even with no campaign. Add session/campaign summary fields; do not require `getSnapshot()`.

| Method | Path | Auth | Success |
|---|---|---|---|
| `GET` | `/api/health` | none | Process up + pack ids + optional session/campaign status |
| `GET` | `/api/session` | cookie | Current profile summary + campaign status, or `unauthenticated` |
| `GET` | `/api/profiles` | none | Profile list (no hashes). Campaign status per row. |
| `POST` | `/api/profiles` | none | `{ displayName, pin? }` → create + set session cookie |
| `POST` | `/api/profiles/:id/select` | none | `{ pin? }` → set session cookie |
| `PATCH` | `/api/profiles/:id` | session for that profile, or PIN body if switching | `{ displayName?, pin?, currentPin? }` rename / set / clear PIN |
| `DELETE` | `/api/profiles/:id` | session or PIN | `{ confirmName }` must match display name |
| `POST` | `/api/session/logout` | cookie | Clear session |
| `POST` | `/api/campaigns/new` | session | `{ confirmReplace?: true }` → founding snapshot; confirm required if a campaign already exists or is mismatched |
| `GET` | `/api/snapshot` | session | 200 snapshot; 401 no session; 409 with mismatch DTO (no process exit) |
| `POST` | `/api/commands` | session | Existing accept/reject; 401/409 as above |

Cookies: `@fastify/cookie`. Credentials `include` on client fetch (same-origin via Vite proxy).

### Client UX

Nightfall chrome (lantern mark, serif titles, ember/brass, way-lantern language). Not a generic login form.

- **Title:** Continue, New, manage profiles.
- **Profiles:** empty state, keyboard (tab/enter), errors in plain language, delete confirm.
- **Founding:** name the Haven; show that Rook and Mara are the expedition pair (not a class picker); submit founds.
- **Mismatch:** explain; keep file; new campaign behind confirm.
- In-game shell unchanged once a playable snapshot is bound. Haven rename line stays for later rename.

Zustand holds session/profile list as **host protocol view state**, not a second copy of HP/run truth. Snapshots remain the only gameplay state.

## Package touch list

- `packages/contracts/` — `ViewId` + `"founding"`; profile/session/health DTOs; keep `GameHost` as snapshot/command only
- `packages/sim/` — `createFoundingSnapshot`; `nameHaven` founds from `founding`; no identity
- `packages/persistence/` — `profile`, `session`, `archived_save`; `profile_id` on envelopes; scoped `SQLiteGameStore`; catalog APIs; migration `build_1_local_profiles`
- `packages/host/` — `LocalSessionHost`; bind/open without process crash; archive-on-confirm; PIN/session crypto
- `packages/fixtures/` — `SIM-17` founding; `HOST-P*` profile isolation, session resume, mismatch preserve; keep `SIM-16`
- `packages/client/` — Title, profiles, founding, mismatch; cookie session boot; existing views
- `apps/local-host/` — listen first; cookie plugin; new routes; save path from `import.meta.url`
- `docs/product/decision-register.md`, `current-scope.md`, `build-1-acceptance-plan.md` (accounts wording), `vertical-slice-handoff.md` (non-goals wording), `docs/architecture/build-1-architecture.md`, `local-development.md`, `docs/ux/interaction-contract.md`, `screens-and-flows.md`, `docs/product/future-compatibility-ledger.md`, `AGENTS.md` save-path line
- `apps/local-host/package.json` — `@fastify/cookie`

Do not add OAuth libraries, email, or a public user table.

## Decision Register / current-scope amendment (apply with implementation)

**New row `identity.local_profiles`:** Friends-hosted LAN play uses local survivor profiles (display name, optional PIN, durable host session cookie). Each profile has one isolated campaign and a named Haven founded before the Hub. Cloud/OAuth/email accounts, public identity, co-op lobby, friends lists, and Need/Greed remain deferred. Content/schema mismatch must not terminate the host process; the save is preserved and reported.

**current-scope.md**

- Build now: “One saveable Haven **per local profile** on the LAN host” (not one anonymous process-wide save).
- Deferred: “Co-op, **cloud/OAuth/email player accounts**, friend/async Haven lists, Need/Greed, and lobby ownership.” Local profiles are in scope.

**build-1-architecture.md**

- Persistence: unmigratable/mismatched save is preserved **and the host stays listening**.
- Non-goals: replace “accounts” with “cloud accounts / OAuth / public APIs.” Local session cookies on loopback/LAN Fastify are allowed. Still no WebSockets, co-op, Need/Greed, or public deployment.

**interaction-contract.md / screens-and-flows.md**

- Add Title, Profiles, Founding, Mismatch views. Primary flow: Boot → Title/Profiles → Founding → Haven Hub → …

**local-development.md / AGENTS.md**

- Canonical save path `apps/local-host/.nightfall/nightfall.sqlite`; env override; mismatch UI not `rm -rf`.

**acceptance-plan / vertical-slice-handoff / future-compatibility-ledger**

- “Accounts” in non-goals means cloud/co-op identity. Local profiles + founding naming are required for Build 1 completion of the named-Haven loop.

## Acceptance criteria

- [x] Host process listens with empty catalog, mismatched save, or unmigratable save (`GET /api/health` → `status: "ok"`)
- [x] Create profile → name Haven → Hub; restart host and refresh client → Continue is the same `revision` and `view` (not a new seed)
- [x] Two profiles do not share Haven name, revision, holdings, or run state
- [x] Resume mid-Haven, mid-map, mid-combat (`awaitingEngage` true and false) equals the stored snapshot (`SIM-16` still green)
- [x] Founding is required on the player new-campaign path; `commitEmbark` from `founding` is `invalid_phase` (`SIM-17`)
- [x] Mismatch/unmigratable: file preserved, UI explains, new campaign only after confirm (`HOST-P04` / `HOST-P05`)
- [x] Delete profile requires confirm name; other profiles intact
- [x] Session cookie survives refresh and `LocalSessionHost` reopen on the same SQLite file
- [x] Optional PIN gates select; hash never in list/snapshot
- [x] No class/character creator; party remains Vanguard + Aether Weaver
- [x] `pnpm check:boundaries` and `pnpm check` pass
- [x] Browser hostile pass: create → found → leave/reopen Continue; two profiles; refresh mid-run; mismatch without delete; Haven/embark/Engage regressions

## Out of scope

- Co-op lobby, friends list, async Haven peek, Need/Greed, mixed-Haven expeditions
- OAuth, email, password-reset, cloud sync, public user database
- Class/character creator, Shadowblade, recruits, extra playable classes
- Auto-migrating mismatched content into a new pack (archive + new campaign only)
- WebSockets, Secure-only cookies, HTTPS termination
- Changing combat rules, loot, or embark party composition

## Test plan

Correctness authority is Vitest (persistence/host/sim), not the browser.

1. **SIM-17 founding:** `createFoundingSnapshot`; `commitEmbark` rejected `invalid_phase`; `nameHaven` → `view: "haven"` and name set; second `nameHaven` renames; `createInitialSnapshot` still starts at haven for existing suites.
2. **SIM-16:** existing SQLite resume at name/embark/travel/combat/`awaitingEngage` boundaries — still exact snapshot equality. Use founded snapshots as today.
3. **HOST-P01:** Session host opens empty DB; health ok; listen would succeed (no throw).
4. **HOST-P02:** Two profiles, two `nameHaven` values, isolated `loadSnapshot`.
5. **HOST-P03:** Session token survives new `LocalSessionHost` on the same file; snapshot revision unchanged.
6. **HOST-P04:** Write a snapshot with a fake `contentHash`; bind profile; status `content_mismatch`; JSON still on disk; other profile still playable; replace only after confirm then founding.
7. **HOST-P05:** Fake `schemaVersion`; `save_unmigratable`; preserve.
8. **HOST-P06:** Delete with wrong `confirmName` fails; correct name removes only that profile.
9. **offline-smoke:** still runs on `LocalGameHost` + in-memory/founded snapshot (no identity required for the expedition bot).
10. **Browser (hostile, after player-visible phases):** `pnpm dev`; create profile; found Haven; reload Continue same revision; second profile other Haven; refresh mid-map or mid-Engage; force mismatch (test hook or temp pack hash in a fixture DB — do not delete the player’s real save); walk Haven, embark, Engage. Screenshot is not the test.

## Implementation phases

| Phase | Slice | Verify |
|---|---|---|
| 1 | Persistence catalog + `profile_id` + save-path resolve + `LocalGameHost` compatibility result (no boot throw) | `pnpm check:boundaries`; persistence/host unit tests HOST-P01/P04 shape |
| 2 | `LocalSessionHost` + HTTP session/profile routes + health without snapshot | Vitest host HTTP or session tests; health curl |
| 3 | Sim founding view + `nameHaven`; host new-campaign writes founding snapshot | SIM-17; existing SIM-* |
| 4 | Client Title / profiles / founding / mismatch / Continue | Client still compiles; then **required UX subagent** |
| 5 | Isolation + resume + replace-confirm tests HOST-P02–P06; SIM-16 combat resume | Vitest |
| 6 | Hostile browser subagent (happy + ugly paths); fix root causes | Subagent report |
| 7 | Visual/UX polish pass + second UX subagent (desktop + narrow) | Subagent report |
| 8 | `pnpm check`; commit and push | CI |

## Assumption

- One campaign per profile is enough for Build 1; a profile is not a cloud account.
- Founding is a sim `view` so mid-founding resume is the same snapshot mechanism as mid-combat.
- PIN is optional so a trusted solo box is not a login wall; isolation still holds via separate profiles.

kind: new_capability
