# Nightfall — Project context for agents

## Design bible

Game design lives in **[`docs/`](docs/README.md)** — north star, loops, systems, content, UX, and product horizon.

- Start at [`docs/README.md`](docs/README.md)
- Vision: [`docs/vision/north-star.md`](docs/vision/north-star.md)
- Product horizon: [`docs/product/horizon.md`](docs/product/horizon.md)
- Open questions: [`docs/product/open-questions.md`](docs/product/open-questions.md)
- **Tech stack (locked):** [`docs/product/tech-decision.md`](docs/product/tech-decision.md)

Design authority is `docs/`. The old Vite one-shot lives under [`docs/_archive/prototype-src/`](docs/_archive/prototype-src/) — reference only; do not extend it.

## Project Overview
- **Name**: Nightfall
- **Type**: browser-based turn-based roguelite RPG (party expedition + Haven meta)
- **Status**: design bible in progress; tech decision locked; greenfield monorepo scaffold pending
- **Setting**: Vesper after the Nightfall cataclysm; antagonist is The Gloom
- **Horizon**: friends-hosted on N100/LAN (not commercial); solo first; async Havens + co-op PvE later; authoritative host

## Tech Stack (locked)

See [`docs/product/tech-decision.md`](docs/product/tech-decision.md). Summary:

- **Language**: TypeScript (workspaces: `client` / `sim` / `server` / `content`)
- **Client**: Vite + React 19; Zustand over sim snapshots only
- **Rules**: Pure `sim` package (no React/DOM/network)
- **Combat UI**: DOM/React first; optional canvas VFX later
- **Host**: Node (or Bun) + HTTP + WebSocket — authoritative on N100
- **DB**: SQLite + Drizzle (default); local Postgres/Supabase optional
- **RNG**: Seeded PRNG + named streams — never `Math.random()` in gameplay
- **Testing**: Vitest on `sim`

## Ports (N100)
| Port | Role |
|------|------|
| 3050 | Vite UI (LAN `http://192.168.68.71:3050`) — after client scaffold |

Former Supabase `5442x` ports: see [`docs/_archive/prototype-supabase/`](docs/_archive/prototype-supabase/) and [`PORTS.md`](PORTS.md). Do not use scrapyard ports `54321`–`54324`.

## Directory Structure
```
nightfall/
├── docs/                    # Design bible (source of truth)
│   ├── product/tech-decision.md
│   └── _archive/
│       ├── prototype-slice-notes.md
│       ├── prototype-src/   # Frozen one-shot (do not extend)
│       ├── prototype-app/   # Old Vite entry (index.html, vite.config)
│       └── prototype-supabase/  # Old local Supabase config + migrations
├── packages/                # Greenfield workspaces (scaffold pending)
│   ├── sim/
│   ├── server/
│   ├── client/
│   └── content/
└── AGENTS.md
```

## Development Workflow
1. Design: edit `docs/` first.
2. Implementation: scaffold workspaces per tech decision (not yet present).
3. Until scaffold exists, `npm run dev` / `npm test` will fail — expected.
4. Persistence default is SQLite; archived Supabase is reference only (see `_archive/prototype-supabase/`).

## Notes for Agents
- **Design authority:** `docs/`
- **Stack authority:** `docs/product/tech-decision.md`
- **Archived prototype:** steal kernels listed in the tech decision / prototype-slice-notes only
- Theme motifs: named Haven, Gloom, pillar/failure stakes
- Solo play must go through the host/sim path so co-op is not a rewrite

1. Ask, don't assume. If something is unclear, ask before writing a single line. Never make silent assumptions about intent, architecture, or requirements. When running unattended, pick the most reasonable interpretation, proceed, and record the assumption rather than blocking.

2. Implement the simplest solution for simple problems, better solutions for harder problems. Do not over-engineer or add flexibility that isn't needed yet.

3. Don't touch unrelated code but please do surface bad code or design smells you discover with me so we can address them as a separate issue.

4. Flag uncertainty explicitly. If you're unsure about something, see point 1 above. If it makes sense to do so, conduct a small, localised and low-risk experiment and bring the hypothesis and results to me to discuss. Confidence without certainty causes more damage than admitting a gap.

5. I'm always open to ideas on better ways to do things. Please don't hesitate to suggest a better way, or one that has long lasting impact over a tactical change.
