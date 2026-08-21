# Strain −1 AP lasts the whole combat

**Kind:** bug  
**Status:** approved  
**Last updated:** 2026-08-21  
**Decision Register:** `run.gloom`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (Strain row), [Gloom, Light, and Rest](../../systems/gloom-and-stress.md), [Build 1 Acceptance Plan](../../product/build-1-acceptance-plan.md) `SIM-04`

## Summary

Strain is applied at combat start, but `beginCurrentTurn` consumes it after the first AP refill. Later turns in that same fight restore 3 AP. The accepted rule is −1 AP for the whole affected combat; Strain clears only when that combat ends (or Rest removes it before the fight).

## Authority

Combat Simulation Contract — Condition timing:

> Strain | Hero starts the affected next combat with `-1 AP`; clears when that combat ends.

Gloom spec (Decision Register `run.gloom`):

> Strain is a light, temporary state: the affected hero has `-1 AP` for that next combat only. It clears after that combat, or may be removed by Rest.

Acceptance Plan `SIM-04` requires Strain to resolve at that documented timing. Draft injury-table penalties (Injured −1 AP as a persistent expedition label) are not this bug.

## Classification rationale

`bug` — accepted Strain duration is missing in sim. No new player-facing rule. Code already applies Strain at Gloom 70/90 and `next_combat_one_strain`, and `finishTurn` already preserves Strain through duration expiry; only the first-turn consume is wrong.

## Package touch list

- `packages/sim/src/combat.ts` — stop removing Strain in `beginCurrentTurn`; keep `heroAp - 1` on every strained hero turn until combat ends
- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C03` (failing until the fix)

## Acceptance criteria

- [ ] `SIM-C03`: Overrun (`runGloom` 90) both heroes begin Strained; first hero turn has 2 AP; after a full timeline loop that same hero still has 2 AP and still has Strain
- [ ] Strain is not consumed on the first refill; `finishTurn` continues to keep Strain while other conditions expire
- [ ] A new combat after victory does not inherit Strain (combatants are rebuilt; no hero-snapshot Strain field)
- [ ] `pnpm test` covers the change
- [ ] `pnpm check:boundaries` still passes
- [ ] Out of scope listed below is untouched

## Out of scope

- Injury labels (`injured` / `wounded` / `drained`) and Quiet House `treatInjury` (Draft table; new_capability)
- Keep Watch removing Strain between combats (expedition Rest, not this combat consume)
- Burn / Exposed / Weakened / Guard AoE isolation fixtures
- Poison, Stun cards, revival cards
- Implementing the Strain fix in this scout PR beyond the failing fixture

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Forced streams: `combatInitiative: [0.9, 0.9, 0, 0]`, `combatIntent: [0, 0, 0, 0, 0, 0, 0, 0]`. Encounter `roadside_trail`, `runGloom: 90`. Do not use `setActiveHero` (it overwrites AP to 3). Weaver is first in timeline. `endTurn` Weaver, then `endTurn` Vanguard after auto-resolved hounds; Weaver's second turn must still be 2 AP.

Named streams only; never `Math.random()`. Browser is not correctness authority.

kind: bug
