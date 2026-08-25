# Nightfall — Project context for agents

## Design bible

Game design lives in **[`docs/`](docs/README.md)** — north star, loops, systems, content, UX, and product horizon.

- Start at [`docs/README.md`](docs/README.md)
- Vision: [`docs/vision/north-star.md`](docs/vision/north-star.md)
- Product horizon: [`docs/product/horizon.md`](docs/product/horizon.md)
- Current scope: [`docs/product/current-scope.md`](docs/product/current-scope.md)
- Decision Register: [`docs/product/decision-register.md`](docs/product/decision-register.md)
- **Build 1 architecture (locked):** [`docs/architecture/build-1-architecture.md`](docs/architecture/build-1-architecture.md)

When sources conflict: Decision Register → current-scope → vertical-slice-handoff → accepted specs → Draft docs. Open-questions is historical only.

Design authority is `docs/`. The old Vite one-shot lives under [`docs/_archive/prototype-src/`](docs/_archive/prototype-src/) — reference only; do not extend it.

## Project Overview

- **Name**: Nightfall
- **Type**: browser-based turn-based roguelite RPG (party expedition + Haven meta)
- **Status**: Build 1 vertical slice is playable locally; design bible remains source of truth
- **Setting**: Vesper after the Nightfall cataclysm; antagonist is The Gloom
- **Horizon**: friends-hosted on N100/LAN (not commercial); solo first; async Havens + co-op PvE later; authoritative host
- **Repo**: https://github.com/KozyWhiskey/nightfall
- **Host**: Intel N100 on the LAN, VoxMox hypervisor, development VM **hermes**. This repo lives at `/home/hermes/projects/nightfall` — one of several projects under `/home/hermes/projects`. Do not treat hermes or the N100 as Nightfall-only; keep ports, SQLite files, and processes inside this tree.

## Tech Stack (locked)

See [`docs/architecture/build-1-architecture.md`](docs/architecture/build-1-architecture.md). Summary:

- **Runtime / language**: Node 22 LTS + TypeScript strict; pnpm workspaces (`pnpm@11.9.0`)
- **Client**: Vite + React 19; Zustand over sim snapshots only
- **Rules**: Pure `sim` package (no React/DOM/network)
- **Combat UI**: DOM/React first; optional canvas VFX later
- **Host**: Node + Fastify HTTP on loopback — authoritative local host
- **DB**: SQLite + Drizzle (default)
- **RNG**: Seeded PRNG + named streams — never `Math.random()` in gameplay
- **Testing**: Vitest fixtures (`SIM-*` / `SIM-C*`); no browser-driven combat correctness

## Ports (N100)

| Port | Role |
|------|------|
| 3050 | Vite UI — `http://192.168.68.71:3050` or `http://127.0.0.1:3050` |
| 3051 | Local host API in `pnpm dev` (`/api/health`, `/api/snapshot`, `/api/commands`) |

`pnpm start` (built client) defaults the host to **3050**. Do not use scrapyard ports `54321`–`54324`. See [`PORTS.md`](PORTS.md).

## Directory Structure

```
nightfall/
├── docs/                 # Design bible + specs/ queue
├── packages/
│   ├── contracts/
│   ├── content/
│   ├── sim/
│   ├── persistence/
│   ├── host/
│   ├── fixtures/
│   └── client/
├── apps/local-host/
├── .cursor/              # rules, skills, subagents, hooks, cloud environment
└── AGENTS.md
```

## Development Workflow

```bash
pnpm install
pnpm test                 # Vitest, including SIM-* and offline-smoke
pnpm dev                  # host :3051 + Vite :3050
pnpm check                # typecheck + lint + test + build
```

Persistence is SQLite at `apps/local-host/.nightfall/nightfall.sqlite` (not the repo-root folder; `NIGHTFALL_SAVE_PATH` overrides). Optional `NIGHTFALL_SEED` for a deterministic **new** save on a profile that has none. Host protocol, env vars, content-mismatch reporting, and loot pipeline: [`docs/architecture/local-development.md`](docs/architecture/local-development.md).

## Agent loop

1. `/write-spec` or spec-scout — compare accepted docs to code; write `docs/specs/`.
2. Bugs and enhancements — implementer; new capabilities wait in `docs/specs/proposed/`.
3. `/test-combat` or combat-tester — fixtures first, then optional UI smoke.

See [`.cursor/skills/`](.cursor/skills/) and [`docs/specs/README.md`](docs/specs/README.md).

### Cursor Cloud specific instructions

Cloud agents should use [`.cursor/environment.json`](.cursor/environment.json). After install, run `pnpm test` to verify. `pnpm dev` exposes Vite on 3050 and the host on 3051. Combat correctness is Vitest, not the browser. Bugbot is optional and currently off — do not enable or assume it is on.

## Notes for Agents

- **Design authority:** `docs/` plus the Decision Register order above
- **Stack authority:** `docs/architecture/build-1-architecture.md`
- **Archived prototype:** steal kernels listed in the tech decision / prototype-slice-notes only
- Theme motifs: named Haven, Gloom, pillar/failure stakes
- Solo play must go through the host/sim path so co-op is not a rewrite

### Coding agent principles

Also in `.cursor/rules/agent-stance.mdc` (always apply). If these conflict with being agreeable, these win.

1. **Correct first.** Treat user claims as hypotheses. If they are factually or technically wrong, say so in the first sentence with evidence (code, docs, or a failing test). Do not agree to be agreeable. Do not rewrite what happened. Skip praise and hedging. Direct is required; snark is not.

2. **Root cause, not band-aids.** Never ship symptomatic workarounds, arbitrary safety buffers, or execution-order hacks to hide a logic failure (client-side HP/stamina clamps, extra Zustand copies of sim state, `setTimeout`/phase-skip to paper over `invalid_phase`, duplicate command paths). Trace to the state-machine, validation, or contract and fix that. Diagnostics and failing fixtures while investigating are fine; leaving the band-aid as the fix is not.

3. **Keep it simple.** Smallest change that meets the need. No speculative features, extra abstractions, or flexibility that is not required yet.

4. **Surgical fixes, not refactors.** Touch only files and code the task needs. Do not drive-by refactor. Surface bad code as a separate issue.

5. **Follow existing patterns** in the touched package unless that pattern is the bug.

6. **Stop when blocked.** Never silently invent intent, architecture, or requirements. If the next step requires inventing those, or a workaround for an unknown root cause: stop, state the block, and ask. Do not guess and proceed.

7. **Verify.** State acceptance criteria (or use the change-spec's) before implementing. Run the relevant checks (`pnpm check:boundaries`, `pnpm test`, or full `pnpm check` for broader work). Do not claim done until those pass. Prefer Vitest `SIM-*` / `SIM-C*` over browser for combat correctness.
