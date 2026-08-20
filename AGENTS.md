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

Persistence is SQLite at `.nightfall/nightfall.sqlite`. Optional `NIGHTFALL_SEED` for a deterministic new game.

## Agent loop

1. `/write-spec` or spec-scout — compare accepted docs to code; write `docs/specs/`.
2. Bugs and enhancements — implementer; new capabilities wait in `docs/specs/proposed/`.
3. `/test-combat` or combat-tester — fixtures first, then optional UI smoke.

See [`.cursor/skills/`](.cursor/skills/) and [`docs/specs/README.md`](docs/specs/README.md).

### Cursor Cloud specific instructions

Cloud agents should use [`.cursor/environment.json`](.cursor/environment.json). After install, run `pnpm test` to verify. `pnpm dev` exposes Vite on 3050 and the host on 3051. Combat correctness is Vitest, not the browser. Enable Bugbot on this GitHub repo from Cursor Automations if it is not already on.

## Notes for Agents

- **Design authority:** `docs/` plus the Decision Register order above
- **Stack authority:** `docs/architecture/build-1-architecture.md`
- **Archived prototype:** steal kernels listed in the tech decision / prototype-slice-notes only
- Theme motifs: named Haven, Gloom, pillar/failure stakes
- Solo play must go through the host/sim path so co-op is not a rewrite

1. Ask, don't assume. If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements. When running unattended, pick the most reasonable interpretation, proceed, and record the assumption rather than blocking.

2. Implement the simplest solution for simple problems, better solutions for harder problems. Do not over-engineer or add flexibility that isn't needed yet.

3. Don't touch unrelated code but please do surface bad code or design smells you discover with me so we can address them as a separate issue.

4. Flag uncertainty explicitly. If you're unsure about something, see point 1 above. If it makes sense to do so, conduct a small, localised and low-risk experiment and bring the hypothesis and results to me to discuss. Confidence without certainty causes more damage than admitting a gap.

5. I'm always open to ideas on better ways to do things. Please don't hesitate to suggest a better way, or one that has long lasting impact over a tactical change.
