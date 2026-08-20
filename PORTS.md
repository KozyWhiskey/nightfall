# Nightfall — port registry (N100)

Do **not** use scrapyard Supabase ports `54321`–`54324`.

Default persistence is **SQLite** ([docs/product/tech-decision.md](docs/product/tech-decision.md)).

Former local Supabase port map is preserved under [`docs/_archive/prototype-supabase/config.toml`](docs/_archive/prototype-supabase/config.toml) if you ever opt into Postgres again:

| Port | Former role (archived stack) |
|------|------------------------------|
| **54421** | Supabase API (Kong) |
| **54422** | Postgres |
| **54423** | Studio |
| **54424** | Inbucket |
| **54427** | Analytics |

| Port | Role (Build 1) |
|------|----------------|
| **3050** | Vite client UI — `http://192.168.68.71:3050` / `http://127.0.0.1:3050` |
| **3051** | Local host HTTP API during `pnpm dev` (`/api/health`, `/api/snapshot`, `/api/commands`) |

`pnpm start` after `pnpm build` serves the built client from `@nightfall/local-host` and defaults `NIGHTFALL_PORT` to **3050**. Override with `NIGHTFALL_PORT` / `NIGHTFALL_HOST`.
