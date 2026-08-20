---
name: implement-spec
description: Implements an approved Nightfall change-spec in the named packages, then runs pnpm check. Use after write-spec for bugs and enhancements, or after a spec is moved to docs/specs/approved/.
---

# Implement an approved spec

## Preconditions

Read the spec at `docs/specs/approved/` (or a path the user gives). Refuse `docs/specs/proposed/` unless the user explicitly approved it.

## Steps

1. Stay inside the spec's package touch list.
2. Prefer the smallest change that satisfies acceptance criteria.
3. Add or tighten `SIM-*` / `SIM-C*` fixtures with forced named streams. Prefer `applyCommand` over mutating HP/zones.
4. Run `pnpm check:boundaries`, then `pnpm test`, then `pnpm check` if the test slice passes.
5. Move the spec to `docs/specs/shipped/` only after tests pass. Do not rewrite Decision Register entries for bugs vs accepted contracts.
6. Hand off to `/test-combat` / the combat-tester subagent.

If the spec needs a new player-facing rule, stop and send it back to `proposed/`.
