# Tech Decision

**Status:** Locked  
**Last updated:** 2026-07-16

## Purpose

Record the implementation stack for Nightfall v2 (post–design bible), and what — if anything — to steal from the throwaway ~30-minute prototype.

## Decision

**Greenfield** TypeScript monorepo shaped for friends-hosted authority on the N100. Do **not** extend or migrate the archived prototype under [`../_archive/prototype-src/`](../_archive/prototype-src/). Steal **ideas and kernels listed below**, not project structure.

### Stack (locked)

| Layer | Choice | Notes |
|-------|--------|-------|
| Repo shape | Workspaces: `client` / `sim` / `server` / `content` | Exact folder names may use `packages/*`; separation is mandatory |
| Language | TypeScript end-to-end | Shared rules for browser, host, and tests |
| Client shell | Vite + React 19 | UI-heavy screen inventory (Haven, craft, events, lobby, peek) |
| UI state | Zustand (or equivalent) over **sim snapshots** | View model only — never the rules engine |
| Game rules | Pure TS `sim` package | No React, DOM, fetch, or WebSocket imports |
| Combat presentation | React/DOM (+ SVG) first | Pixi (or similar) only as optional polish later |
| Server | Node (or Bun) + HTTP (Hono/Fastify) + WebSocket | Authoritative host on N100; REST for Haven/peek; WS for run intents |
| Persistence | **SQLite + Drizzle** (default) | Friends-scale; single-file backup on N100. Local Postgres/Supabase allowed if Studio/auth is wanted later |
| Content | Typed data + Zod in `content` | Cards, classes, events, buildings, regions |
| RNG | Seeded PRNG + **named streams** | Never `Math.random()` in gameplay |
| Tests | Vitest on `sim` | Combat, craft, Need/Greed, torch math without UI |

### Architecture rules (locked)

1. **Authoritative host** — host owns combat resolution, RNG streams, loot/Need-Greed, torch/Gloom. Clients send intents; host broadcasts state. Matches [multiplayer.md](../systems/multiplayer.md).
2. **Solo uses the host path** — local in-process host adapter is fine; do not build a second “client-only” ruleset that co-op must rewrite.
3. **Deterministic resolution** — ties, status ticks, and simultaneous effects have documented order in `sim`.
4. **Data-driven content** — balance and kits live in `content`, validated by schema.
5. **No game-engine-as-app** — Godot / Phaser-first shells are out of scope for must-ship (wrong fit for the screen inventory).

### Explicit non-choices

| Rejected | Why |
|----------|-----|
| Revive / adapt archived `src/` layout | Wrong shape (single-hero, loadout, shard shop); rewrite cost was ~nil |
| Pixi/Phaser as the whole app | Fights event/craft/Haven UI depth |
| Godot (or other engine) web export | Full rewrite for a weaker UI fit |
| P2P / rollback netcode | Wrong problem for turn intents + host-owned meta |
| Cloud SaaS backend as requirement | Fights friends-hosted horizon |
| Zustand (or UI store) as the rules engine | Breaks host authority and testability |

## Stolen ideas from the prototype

Full notes: [`../_archive/prototype-slice-notes.md`](../_archive/prototype-slice-notes.md). Code snapshot: [`../_archive/prototype-src/`](../_archive/prototype-src/).

| Steal | Source (archived) | How to use in v2 |
|-------|-------------------|------------------|
| Mulberry32 + helpers (`nextInt`, `pickOne`, `shuffle`, `chance`) | `rng/mulberry32.ts` | Reimplement in `sim` (or copy verbatim — small, stable) |
| Named RNG streams + cursor snapshot for save/replay | `rng/streams.ts` | Keep stream isolation (`map` / `loot` / `combat` / `craft` / `events`; extend as needed) |
| Enemy **intent pools** with telegraph labels | `data/enemies.ts` | Content pattern for readable combat puzzles |
| DEX-sorted turn order with deterministic tie-break | `combat/resolve.ts` `buildTurnOrder` | Replace formula with bible: `(DEX×2) + itemInitiative + seeded variance` |
| StS-style draw / discard / reshuffle | `combat/hand.ts` | Adapt to per-hero decks (not spell loadout) |
| Affix **budget by rarity** + combine/reroll gambling | `data/affixes.ts`, `systems/craft.ts` | Feed into gear + Safe/Risky/Dire craft ladders — retune numbers |
| Discrete combat **event bus** (presentation ≠ rules) | `combat/CombatEventBus.ts` | Keep the idea: `sim` emits facts; UI/VFX subscribe — even without Pixi |
| Twilight theme tokens (palette + serif direction) | `theme/tokens.css` | Starting visual language; refine under UX docs |
| Equipment slots skeleton | types / item gen | Align with [gear-and-affixes.md](../systems/gear-and-affixes.md) |
| Class name sparks (Vanguard, Aether Weaver, Shadowblade, …) | `data/classes.ts` | Already absorbed into content briefs where locked |

**Do not steal:** single-hero run model, spell-only loadout, Glimmering Shard hub shop, instant node resolution, Pixi-coupled combat as required architecture, UI store as source of truth.

## Scaffold expectation (next implementation step)

```text
nightfall/
├── docs/                 # Design bible (authority)
├── packages/             # or top-level workspaces — TBD at scaffold
│   ├── sim/
│   ├── server/
│   ├── client/
│   └── content/
├── docs/_archive/        # Prototype notes + frozen src
└── AGENTS.md
```

Solo vertical slice (Phase 2 in [milestones.md](milestones.md)) should already exercise `sim` + `server` + `client` + SQLite.

## Evaluation checklist (resolved)

| Concern | Resolution |
|---------|------------|
| State model | Pure `sim` snapshots; Zustand for UI only |
| Combat presentation | DOM first; optional canvas VFX later |
| Persistence | SQLite + Drizzle default; archived Supabase under `docs/_archive/prototype-supabase/` |
| Netcode | Node host + intent WebSocket; LAN 1–3 players |
| Content pipeline | Zod-validated data packages |
| Rewrite cost | Prototype archived; greenfield |

## Decision record

| Date | Decision |
|------|----------|
| 2026-07-16 | Lock greenfield stack above; archive prototype `src/` to `docs/_archive/prototype-src/`; steal kernels listed in this doc |
| 2026-07-16 | Stop local Supabase; archive `supabase/` → `docs/_archive/prototype-supabase/`; remove `node_modules`, `dist`, prototype env files |

_Do not reopen stack family without an explicit revisit. Scaffold and feature work follow this ADR._
