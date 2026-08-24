# Nightfall

Turn-based roguelite RPG set on Vesper after the Nightfall. Lead a small party into the Gloom, craft unique card kits, and grow a named Haven — knowing the town can fall.

**Design bible:** [`docs/README.md`](docs/README.md)  
**Architecture:** [`docs/architecture/build-1-architecture.md`](docs/architecture/build-1-architecture.md)  
**Repo:** [github.com/KozyWhiskey/nightfall](https://github.com/KozyWhiskey/nightfall)

The early Vite one-shot is archived under [`docs/_archive/`](docs/_archive/). The greenfield monorepo (`packages/*` + `apps/local-host`) is the playable Build 1 slice.

**Developer runbook:** [`docs/architecture/local-development.md`](docs/architecture/local-development.md) (host protocol, env vars, save reset, loot pipeline, pitfalls).

## Local development (N100)

Requires Node 22 and pnpm 11.9.0.

```bash
pnpm install
pnpm test          # Vitest, including SIM-* fixtures
pnpm dev           # Vite UI :3050, local host API :3051
pnpm check         # typecheck + lint + test + build
```

- UI: [http://192.168.68.71:3050](http://192.168.68.71:3050) or [http://127.0.0.1:3050](http://127.0.0.1:3050)
- Host health: [http://127.0.0.1:3051/api/health](http://127.0.0.1:3051/api/health)
- Persistence: SQLite at `.nightfall/nightfall.sqlite` (WAL). After a content-pack change the host refuses to open a mismatched save — `rm -rf .nightfall` starts a new campaign.
- Optional: `NIGHTFALL_SEED` for a **new** save only. Existing `.nightfall` files ignore it.
- LAN: open Vite on `:3050` (`hermes.local` is allowed). During `pnpm dev` the host stays on loopback `:3051`; the Vite proxy forwards `/api`.

Never point this app at scrapyard’s Supabase (`54321`–`54324`). Ports: [`PORTS.md`](PORTS.md).

## Agent workflow

Change specs live in [`docs/specs/`](docs/specs/README.md). Cursor skills: `/write-spec`, `/implement-spec`, `/test-combat`.
