# Nightfall

Turn-based roguelite RPG set on Vesper after the Nightfall. Lead a small party into the Gloom, craft unique card kits, and grow a named Haven — knowing the town can fall.

**Design bible:** [`docs/README.md`](docs/README.md)  
**Tech stack (locked):** [`docs/product/tech-decision.md`](docs/product/tech-decision.md)

The early Vite one-shot (and its local Supabase config) is archived under [`docs/_archive/`](docs/_archive/). Greenfield monorepo scaffold (`sim` / `server` / `client` / `content`) is the next implementation step — `npm run dev` will not work until then.

## Local development (N100)

After the greenfield scaffold:

```bash
npm install
npm run dev        # client UI :3050 (planned)
npm test           # Vitest on sim
```

- UI (planned): [http://192.168.68.71:3050](http://192.168.68.71:3050)
- Persistence: SQLite by default (see tech decision)

Never point this app at scrapyard’s Supabase (`54321`–`54324`).
