---
name: test-combat
description: Runs Nightfall combat verification: SIM fixtures, offline-smoke, host mid-combat resume, host health, and optional browser UX smoke. Use after implementing combat changes or when asked to test the combat experience.
---

# Test combat

Combat correctness is Vitest. Browser checks are readability smoke only.

## Automated (required)

From the repo root:

```bash
pnpm test
```

Narrow slices when iterating:

```bash
pnpm vitest run packages/fixtures/src/sim-combat.test.ts
pnpm vitest run packages/fixtures/src/sim-expedition.test.ts
pnpm vitest run packages/fixtures/src/sim-host.test.ts
pnpm vitest run packages/fixtures/src/offline-smoke.test.ts
pnpm check:boundaries
```

`sim-host.test.ts` must include mid-combat SQLite resume (SIM-16 combat boundary). `offline-smoke.test.ts` is the full-route bot gate.

## Host health

If `pnpm dev` is running:

```bash
.cursor/skills/test-combat/scripts/health-check.sh
```

Expect `{ "status": "ok", ... }` from `http://127.0.0.1:3051/api/health`.

## Browser UX smoke (optional, not merge-gating)

Follow [references/combat-smoke.md](references/combat-smoke.md). Open `http://127.0.0.1:3050`, reach Roadside Trail, screenshot. Store notes under `docs/specs/evidence/`.

## Report

- Which SIM ids passed/failed
- Host health result
- Whether UI smoke ran
- Gaps vs the spec's acceptance criteria (skeptical; do not trust claims)
