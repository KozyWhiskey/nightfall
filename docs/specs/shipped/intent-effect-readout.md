# Change Spec: Enemy intent effect readout and next-hit chip

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-25  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Build 1 Interaction Contract](../../ux/interaction-contract.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md), [Band 1 Frontier roster](../../content/enemies/band-1-frontier.md)

## Summary

Hostile standees print `Buff · Borrowed Fury · enemy side` with no magnitude. The player cannot tell whether to interrupt the Chanter. Accepted copy is: the next damaging intent of each living ally gains +2. `intentMagnitude` only sums `dealDamage` / `dealDirectDamage`, so the snapshot publishes `0` and the dock drops the number. After the buff lands, `CombatantSnapshot.nextDamageBonus` is already set and never drawn. Circle’s +2 is applied in `executeEnemyTurn` instead of the intent effect list, so it cannot be summarized from data.

Print a sim-authored intent `summary` (not a tooltip, not Strength). After the bonus exists, print a standee chip `Next hit +N`.

## Authority

Interaction Contract:

> An enemy intent must identify target domain, exact magnitude when known, and timing; icons never stand alone.  
> No critical numerical effect exists only in a tooltip. Tooltips can explain terms, not conceal rules.

Frontier roster — Mist Chanter `borrowed_fury`:

> The next damaging intent of each living ally gains +2 damage.

Encounter role: support priority is a visible tactical problem without inventing a large buff/status system.

Combat UI rule: client prints snapshot fields; it does not compute STR or intent math.

## Classification rationale

**Bug.** The +2 and the applied `nextDamageBonus` already exist in content/sim. The UI conceals them. Moving Circle’s +2 onto the intent effect list matches the accepted Hound sheet; it does not add a new player rule.

## Package touch list

- `packages/contracts/` — `EnemyIntentSnapshot.summary`
- `packages/sim/src/combat.ts` — author `summary` from intent effects; remove Circle’s hardcoded `nextDamageBonus`
- `packages/content/src/pack.ts` — Circle includes `grantNextDamageBonus` 2 on self
- `packages/client/src/combat/` — `intentSummary` prints `summary`; standee chip from `nextDamageBonus`; Vitest
- `packages/fixtures/` — `SIM-C17`
- Do **not** edit Locked/Accepted design docs

## Acceptance criteria

- [x] Revealed `borrowed_fury` snapshot `summary` is `living enemies +2 next hit` (magnitude stays `0` so kind remains Buff, not Attack)
- [x] Standee/timeline line includes that summary, e.g. `Borrowed Fury · living enemies +2 next hit`, not only `Borrowed Fury · enemy side`
- [x] After Borrowed Fury resolves, each living same-side combatant has `nextDamageBonus === 2` and the standee shows `Next hit +2` from that field
- [x] Circle telegraph includes `Gain 4 Block; next hit +2`; resolving Circle still grants 4 Block and +2 next hit once (no double apply)
- [x] Client does not compute the +2 locally
- [x] `SIM-C17` covers reveal summary + post-resolve `nextDamageBonus`
- [x] Client Vitest covers `intentSummary` with a non-damage `summary` and the next-hit chip helper
- [x] `pnpm test` and `pnpm check:boundaries` pass

## Out of scope

- Tooltip-only magnitudes
- A general buff-icon system or Strength labels
- Rewriting attack telegraphs that already show damage + target (fallback when `summary` is empty)
- New intent ids or AI

## Test plan

1. `SIM-C17`: `startFixtureCombat` Whisperwood Threshold (or Houndpack). Force/reveal Chanter `borrowed_fury` via named `combatIntent` streams or the existing SIM-05 lament→fury reveal path. Assert `summary`. Advance so the Chanter resolves it; assert living enemies’ `nextDamageBonus === 2`.
2. Circle: roadside hound resolves `circle` once; Block 4 and `nextDamageBonus === 2`.
3. Client: `intentSummary({ label: "Borrowed Fury", magnitude: 0, summary: "living enemies +2 next hit", targetLabel: "enemy side" })` includes the +2 and does not rely on targetLabel alone. `nextHitBonusLabel(2)` is `Next hit +2`.

kind: bug
