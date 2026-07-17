# Nightfall — port registry (N100)

Do **not** use scrapyard Supabase ports `54321`–`54324`.

Default persistence for v2 is **SQLite** ([docs/product/tech-decision.md](docs/product/tech-decision.md)).

Former local Supabase port map is preserved under [`docs/_archive/prototype-supabase/config.toml`](docs/_archive/prototype-supabase/config.toml) if you ever opt into Postgres again:

| Port | Former role (archived stack) |
|------|------------------------------|
| **54421** | Supabase API (Kong) |
| **54422** | Postgres |
| **54423** | Studio |
| **54424** | Inbucket |
| **54427** | Analytics |

| Port | Role (v2) |
|------|-----------|
| **3050** | Vite client UI (after scaffold) — `http://192.168.68.71:3050` |

Server WebSocket/HTTP port for the authoritative host: choose at scaffold time (document here when picked).
