# Change Spec Template

**Kind:** bug | enhancement | new_capability  
**Status:** proposed | approved | shipped  
**Last updated:** YYYY-MM-DD  
**Decision Register:** `id` or `none — bug vs accepted contract`  
**Related:** (accepted specs only unless this is a new_capability)

## Summary

One paragraph: what is wrong or missing, and what player-facing or testable outcome changes.

## Authority

Quote the accepted rule (Decision Register, combat-simulation-contract, interaction-contract, current-scope). Do not treat Draft `combat.md` or open-questions as authority.

## Classification rationale

Why this is a bug, enhancement, or new capability. If new capability, it stays in `docs/specs/proposed/` until a human approves.

## Package touch list

- `packages/sim/`
- `packages/fixtures/`
- (others only if required)

## Acceptance criteria

- [ ] Named `SIM-*` or `SIM-C*` fixture with forced streams
- [ ] `pnpm test` covers the change
- [ ] `pnpm check:boundaries` still passes
- [ ] Out of scope listed below is untouched

## Out of scope

-

## Test plan

Commands, encounter ids, and forced streams. Browser UX smoke only if the change is client-visible; browser is not correctness authority.
