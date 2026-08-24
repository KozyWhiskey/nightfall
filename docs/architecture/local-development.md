# Local development and host operations

**Status:** Operational companion to the accepted architecture  
**Last updated:** 2026-08-24  
**Related:** [Build 1 Architecture](build-1-architecture.md), [PORTS.md](../../PORTS.md), [Spec queue](../specs/README.md), [Gear and Affixes](../systems/gear-and-affixes.md)

This is the developer runbook. [build-1-architecture.md](build-1-architecture.md) is the locked stack decision; this page records how the current code actually starts, talks HTTP, saves, and rolls loot.

## Package map

| Package | Role | Public surface |
|---|---|---|
| `@nightfall/contracts` | Serializable DTOs only | `COMMAND_TYPES`, `REASON_CODES`, `RNG_STREAM_NAMES`, `GameHost`, snapshot/item types |
| `@nightfall/content` | Zod-validated Build 1 pack | `build1Pack` (`contentVersion` `nightfall.vslice.1` + SHA-256 `contentHash`) |
| `@nightfall/sim` | Pure rules | `applyCommand`, `createInitialSnapshot`, combat/loot helpers. No React/DOM/Fastify/SQLite/`Math.random` |
| `@nightfall/persistence` | SQLite envelopes | `SQLiteGameStore`, `InMemoryGameStore` |
| `@nightfall/host` | Session + idempotence | `openDefaultLocalGameHost`, `LocalGameHost`, `replayAcceptedCommands` |
| `@nightfall/client` | React + Zustand | Snapshots in, `CommandEnvelope` out. No `@nightfall/sim`, `@nightfall/host`, `@nightfall/persistence`, or `@nightfall/content` |
| `@nightfall/fixtures` | Vitest harness | `startFixtureCombat`, `accept`, `command` |
| `@nightfall/local-host` | Fastify process | HTTP adapter around `GameHost` |

Allowed import direction is enforced by `pnpm check:boundaries` (`scripts/check-boundaries.mjs`).

## Host HTTP protocol

`apps/local-host/src/index.ts` is a thin Fastify wrapper. Body limit is 64 KiB.

| Method | Path | Success | Notes |
|---|---|---|---|
| `GET` | `/api/health` | 200 | `{ status, revision, schemaVersion, contentVersion, contentHash }` from the live snapshot |
| `GET` | `/api/snapshot` | 200 | Full `GameSnapshot`. `cache-control: no-store` |
| `POST` | `/api/commands` | 200 accepted / 409 rejected / 400 invalid body | Body must include `commandId` (string), `expectedRevision` (number), `type` (string), `payload` (object) |

The client (`packages/client/src/transport.ts`) calls relative `/api/*`. Zustand (`packages/client/src/store.ts`) stamps `commandId` and `expectedRevision` from the last snapshot.

Rejected commands do not mutate. Duplicate `commandId` returns the original stored result (idempotence). Host submits are serialized on an in-process queue.

`LocalGameHost.getSnapshot()` / accepted results **enrich** items and `hero.deckPreview` for display. SQLite stores the unenriched sim snapshot. Do not treat deck preview as authoritative sim state.

### Environment

| Variable | Default | Used for |
|---|---|---|
| `NIGHTFALL_PORT` | `3050` (`3051` under `pnpm dev`) | Listen port |
| `NIGHTFALL_HOST` | `127.0.0.1` | Bind address |
| `NIGHTFALL_SAVE_PATH` | `<cwd>/.nightfall/nightfall.sqlite` | SQLite file (WAL mode) |
| `NIGHTFALL_SEED` | unset (crypto seed) | **New save only** — ignored if a snapshot already exists at the save path |

`NIGHTFALL_SEED` must be a safe integer. Invalid values are dropped and a random seed is used.

## Run modes

```bash
pnpm install
pnpm dev            # Vite :3050 (0.0.0.0) + host :3051 (127.0.0.1)
pnpm test           # Vitest, including SIM-* / SIM-C*
pnpm check          # typecheck + lint (oxlint + boundaries) + test + build
pnpm start          # built host; defaults to :3050 and serves packages/client/dist if present
```

`pnpm dev` builds library packages first (`pnpm build:libs`), then runs host + Vite via `concurrently`. Vite proxies `/api` to `http://127.0.0.1:3051` and allows hosts `hermes.local` and `*.local`.

| Mode | UI | API | LAN |
|---|---|---|---|
| `pnpm dev` | `:3050` Vite | `:3051` loopback only | Browse `http://<lan-ip>:3050` or `http://hermes.local:3050`. Do not expose `:3051` |
| `pnpm start` | same origin as host | same process | Bind `NIGHTFALL_HOST=0.0.0.0` (and usually `NIGHTFALL_PORT=3050`). Run `pnpm build` first or `/` returns `client_not_built` |

Command IDs use `crypto.randomUUID()` when available, otherwise a UUID v4 built from `getRandomValues`. That fallback exists so `http://hermes.local` (not a secure context) still works.

Health check while `pnpm dev` is up:

```bash
curl -fsS http://127.0.0.1:3051/api/health
# or: .cursor/skills/test-combat/scripts/health-check.sh
```

## Persistence

SQLite is created on first open (`packages/persistence/src/store.ts`). Schema is applied as inline SQL (one migration row: `build_1_initial_envelopes`). `drizzle-kit` exists for schema inspection; runtime does not run a Drizzle migrator.

On each accepted command the host writes, in one transaction: campaign snapshot JSON, optional `active_run` row (replaced, not versioned), the accepted command record (facts + full result for idempotence), and a `run_record` if the run just became terminal.

Resume loads the latest `active_run` snapshot if present, otherwise `campaign_save`. Build 1 is snapshot + command log, not event sourcing.

`LocalGameHost.open` **throws** (process will not listen) when:

- `schemaVersion` ≠ `SNAPSHOT_SCHEMA_VERSION` (`save_unmigratable`)
- save `contentVersion`/`contentHash` ≠ current `build1Pack` (`content_mismatch`)

Changing authored content changes `contentHash`. Delete the save directory to start a new campaign after a pack change:

```bash
rm -rf .nightfall
```

WAL leaves `.nightfall/nightfall.sqlite-wal` and `-shm`; removing the directory is safer than deleting only the `.sqlite` file.

## Loot and affix pipeline

All procedural rolls consume the named `loot` stream (`drawUnit` / `drawInt` in `packages/sim/src/rng.ts`). Gameplay never calls `Math.random()`.

```text
rarityFromUnit (loot)
  → pick base definition
  → rollGearAffixIds(pack, definitionId, rarity, lootDraw)
  → createItemInstance (... affix ids → mechanicSnapshot)
  → combat / expedition read mechanicSnapshot.modifiers and deltas
```

| Stage | Code | Behavior |
|---|---|---|
| Reward / event gear | `expedition.generateItem` | Rarity from `loot`; Legendary bases restricted to curated templates |
| Boss offers | `expedition.bossOffers` | Fixed bases `kite_shield`, `aether_rod`, `gloomwood_spear`; 15% Legendary else Rare |
| Marked carrier | `combat.maybeCreateCarrier` | `pack.encounters[].carrierChance`, then enemy-specific base lists, always Imbued |
| Affix budget | `loot.rollGearAffixIds` | Salvaged: none. Imbued: 70% prefix else suffix. Rare/Legendary: prefix+suffix; curse 15%/25% if upside exists. Legendary also stamps a curated signature |
| Frozen mechanics | `items.createItemInstance` | Prefix/suffix/curse/signature IDs + numeric deltas + modifier tags |
| Combat | `combat.ts` | Equipped modifiers (initiative, draw, burn, Guard, Strain-adjacent passives, first-use flags on `run.flags`) |
| Display | `items.enrichItemDisplay` + host | Readout copy; host also fills `deckPreview` |

Legendary signatures (Build 1): `vigils_promise` (kite/way-lantern buckler), `cinder_scar` (aether rod / cinder scepter), `hounds_pursuit` (gloomwood spear).

Shipped specs that landed this pipeline: [procedural-affix-rolls](../specs/shipped/procedural-affix-rolls.md), [wire-affix-combat-modifiers](../specs/shipped/wire-affix-combat-modifiers.md), [wire-signature-expedition-affixes](../specs/shipped/wire-signature-expedition-affixes.md), [wire-remaining-first-use-affixes](../specs/shipped/wire-remaining-first-use-affixes.md), [vessel-passive-combat-effects](../specs/shipped/vessel-passive-combat-effects.md).

### Client-safe greed copy

Map tooltips (`packages/client/src/map/mapGreedUi.ts`) **mirror** `pack.tuning.encounterRewards` by hand. The client must not import `@nightfall/content` (Node/Zod pack). If you change `carrierChance` or `offerKinds` in `packages/content/src/pack.ts`, update both:

1. `pack.encounters[].carrierChance` (sim spawn)
2. `pack.tuning.encounterRewards[].carrierChance` / `offerKinds` (rewards)
3. `ENCOUNTER_GREED` in `mapGreedUi.ts` (map copy)

Those three are duplicated today with matching numbers. Drift makes the map lie.

## Testing

Combat correctness is Vitest, not the browser.

```bash
pnpm test
pnpm vitest run packages/fixtures/src/sim-combat.test.ts
pnpm vitest run packages/fixtures/src/sim-loot.test.ts
pnpm vitest run packages/fixtures/src/sim-affix.test.ts
pnpm vitest run packages/fixtures/src/sim-host.test.ts   # includes mid-combat SQLite resume
pnpm vitest run packages/fixtures/src/offline-smoke.test.ts
pnpm check:boundaries
```

Fixture helpers live in `packages/fixtures/src/index.ts`. Forced named streams are test-only and must not appear in production saves.

## Common pitfalls

| Symptom | Cause | Fix |
|---|---|---|
| Host exits on boot with `content_mismatch` | Save hash ≠ current pack | `rm -rf .nightfall` (destroys the campaign) |
| Host exits with `save_unmigratable` | Snapshot schema ≠ `1` | Preserve the file; do not overwrite. Build 1 has no auto-migrator |
| `NIGHTFALL_SEED` did not stick | Save already exists | Seed applies only when `loadSnapshot()` is empty |
| UI on LAN, `/api` fails | Hitting `:3051` from another machine during `pnpm dev` | Use Vite `:3050`; it proxies to loopback host |
| `crypto.randomUUID is not a function` | Insecure HTTP origin without the store fallback | Already handled in `store.ts`; do not reintroduce `randomUUID()`-only IDs |
| Client bundle pulls Node APIs | Importing `@nightfall/content` or sim | Copy the needed constants (see `mapGreedUi.ts`) |
| `pnpm start` JSON `{ client_not_built }` | Missing `packages/client/dist` | `pnpm build` then `pnpm start` |
| Boundary CI failure | `Math.random` / `Date` / `fetch` in sim, or client importing sim/host/persistence | Remove the import; put rules in sim, presentation in client |
| Item “occupies more than one location” | Sim bug — exclusive ownership assert in `applyCommand` | Do not persist; fix the command path and add a fixture |
