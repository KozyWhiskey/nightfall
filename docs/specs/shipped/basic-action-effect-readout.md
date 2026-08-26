# Change Spec: Basic Attack and Block effect readout

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-25  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Build 1 Interaction Contract](../../ux/interaction-contract.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md), [Cards and Decks](../../systems/cards-and-decks.md)

## Summary

Combat dock Basics (`Staff Strike`, `Deflect`, Vanguard `Strike` / `Raise Shield`) show only name and AP. The player cannot see how much damage a Basic Attack deals or how much Block a Basic Block grants. Hand cards already print `presentation.summary`. `CombatSnapshot.basicActions` already carries the same sim-authored `summary` (`effectSummary`). The dock simply never renders it.

## Authority

Interaction Contract — combat must-show and accessibility:

> hand and all card costs; Basics  
> No critical numerical effect exists only in a tooltip. Tooltips can explain terms, not conceal rules.

Combat Simulation Contract — Basic Attack magnitudes are known at setup (Vanguard `1 + STR`, Weaver `1 + STR`). Those numbers must be readable before the player commits the 1 AP.

Combat UI rule: do not compute damage in the client. Render the snapshot `summary`.

## Classification rationale

**Bug.** Accepted interaction law already requires Basics in the combat view and forbids hiding critical magnitudes. No new combat rule. Snapshot already includes `BasicActionSnapshot.summary`.

## Package touch list

- `packages/client/src/combat/` — render attack/block `summary` on the Basic buttons; helper + Vitest
- `packages/sim/src/combat.ts` — include `basic_block_plus_1` in the Basic Block summary so the printed Block matches resolution
- `packages/fixtures/` — assert combat-start `basicActions` summaries for the fixed pair (`SIM-C16`)
- Do **not** edit Locked/Accepted design docs

## Acceptance criteria

- [x] Weaver Basic Attack button (and aria-label) includes the snapshot summary, e.g. `Deal 3 physical damage`, not only `Staff Strike · 1 AP`
- [x] Weaver Basic Block button includes `Gain 4 Block` (or the snapshot’s current Block total if `basic_block_plus_1` is equipped)
- [x] Vanguard Basics likewise show Strike damage and Raise Shield Block
- [x] Client does not compute STR/damage locally; it prints `basicActions[].attack.summary` / `block.summary`
- [x] `SIM-C16`: after `startFixtureCombat` for Roadside Trail, Weaver attack summary is `Deal 3 physical damage` and block summary is `Gain 4 Block`; Vanguard attack `Deal 5 physical damage`, block `Gain 6 Block`
- [x] Client Vitest covers the readout helper (name, AP, summary)
- [x] `pnpm test` and `pnpm check:boundaries` pass

## Out of scope

- Changing Basic Attack/Block formulas, AP cost, or always-available status
- Tooltips as the only carrier of the number
- Class creator or extra basics
- Reworking the full hand-card chrome

## Test plan

1. `SIM-C16`: `startFixtureCombat(pack, "roadside_trail")` (or current opening encounter id). Read `combat.basicActions` for `weaver_*` and `vanguard_*` hero ids. Assert `summary` strings above.
2. Client: `basicActionReadout({ name: "Staff Strike", apCost: 1, summary: "Deal 3 physical damage" })` exposes visible effect text.
3. Optional UX smoke: Roadside Trail, Mara’s turn, Staff Strike and Deflect show damage/Block on the dock.

kind: bug
