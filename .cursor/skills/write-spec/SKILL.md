---
name: write-spec
description: Reviews Nightfall design docs against code and writes a change-spec for a bug, enhancement, or new capability. Use when asked to spec work, scout combat gaps, or start the spec-dev-test loop.
---

# Write a Nightfall change-spec

## Authority order

1. `docs/product/decision-register.md`
2. `docs/product/current-scope.md`
3. `docs/product/vertical-slice-handoff.md`
4. Accepted specs (`combat-simulation-contract.md`, `interaction-contract.md`, architecture)
5. Draft docs (context only)

Ignore `docs/product/open-questions.md` as implementation authority.

## Steps

1. Read the owning accepted spec and the matching code (`packages/sim`, `packages/client/src/combat`, fixtures).
2. Classify: `bug` (code misses an accepted rule), `enhancement` (tests/UX tighten without a new rule), `new_capability` (new player-facing rule, deferred content, or design-doc change).
3. Copy [docs/templates/change-spec.md](docs/templates/change-spec.md). Fill every section. Cite SIM/E2E ids to add or extend.
4. Path:
   - bug/enhancement → `docs/specs/approved/<slug>.md`
   - new_capability → `docs/specs/proposed/<slug>.md` and **stop**
5. For bugs, include a failing-fixture plan using `startFixtureCombat` and named streams. Do not use `Math.random()`.
6. End with the classification line `kind: bug|enhancement|new_capability` so the spec-scout handoff hook can fire.

Do not implement in this skill. Do not edit Locked/Accepted design docs unless the kind is `new_capability` and the human has already approved.
