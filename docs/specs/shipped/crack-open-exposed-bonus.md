# Crack Open Exposed +3 rider is missing

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-22  
**Decision Register:** `content.pack`  
**Related:** [First Scroll Pool](../../content/spells/first-scroll-pool.md), [Build 1 Content Registry](../../content/vertical-slice-content-registry.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (modifier order)

## Summary

`crack_open` is accepted as “Deal 8 physical damage. If the target is Exposed, deal 3 additional damage.” The loadable pack only emits `dealDamage(4, strength)` (8 at Vanguard STR 4). `resolveEffects` never reads the unused `effect.condition` gate, so the Exposed rider never fires. Playing Crack Open at an Exposed target deals `floor(8 × 1.25) = 10` instead of `floor((8 + 3) × 1.25) = 13`. The hand summary also hides the rider.

## Authority

Decision Register `content.pack` — Build 1 loads the accepted finite registry. Content Registry:

> The eight learnable and two held-only scroll definitions use their existing IDs and values from First Scroll Pool.

First Scroll Pool:

> `crack_open` — Crack Open | Rare | 1 AP + 2 Stamina | Deal 8 physical damage. If the target is Exposed, deal 3 additional damage.

Combat Simulation Contract — modifier order: add flat bonuses, then Weakened, then Exposed `×1.25`, then floor once. The +3 is a card-text flat bonus, not a new Exposed multiplier.

## Classification rationale

`bug` — accepted scroll text is missing in content/sim. No new player-facing rule. Do not invent a generic Exposed-damage keyword beyond this card (vessel `exposed_damage_plus_2` is a different +2 affix and must stay unused here).

## Package touch list

- `packages/content/src/pack.ts` — declare the Exposed +3 on `crack_open` (prefer the existing optional `effect.condition` on a second `dealDamage(3, none)` or an equivalent data rider)
- `packages/sim/src/combat.ts` — honor `effect.condition` in `resolveEffects`; `effectSummary` must mention the Exposed +3 so the hand does not conceal it
- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C07`

## Acceptance criteria

- [x] `SIM-C07`: Vanguard plays learned `crack_open` at an unblocked Gloomfang Hound with no Exposed: HP loss is 8
- [x] `SIM-C07`: same card at an unblocked Exposed Hound: HP loss is 13 (`floor((8 + 3) × 1.25)`), not 10
- [x] Clean-target damage stays 8 (the +3 must not apply without Exposed)
- [x] Card hand `summary` mentions the Exposed +3 rider
- [x] Named streams only; never `Math.random()`
- [x] `pnpm test` covers the change
- [x] `pnpm check:boundaries` still passes
- [x] Out of scope listed below is untouched

## Out of scope

- Vessel / affix `exposed_damage_plus_2` (different +2 modifier)
- Still Wall reactive Weakened (already special-cased via `sourceId === "still_wall"`)
- Poison, revival cards, injury −1 AP, E2E-02
- Isolated Burn / Exposed / Guard party-wide `SIM-04` expansion
- Implementing the fix in this scout PR beyond the failing fixture

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Helper: embark, add `crack_open` to Vanguard `learnedCardIds`, `startCombat` `roadside_trail` with `combatInitiative: [0.9, 0.9, 0, 0]`. Put Crack Open in hand, clear target Block, `setActiveHero`, set stamina ≥ 2.

- Clean: no Exposed on the Hound; expect 8 HP damage.
- Exposed: `{ id: "exposed", expiresAfterCompletedTurn: 99 }` on the Hound; expect 13 HP damage.

Named streams only; never `Math.random()`. Browser is not correctness authority.

kind: bug
