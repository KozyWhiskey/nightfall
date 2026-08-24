# Equipped max HP and max Stamina never reach combat

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-24  
**Decision Register:** `content.pack`  
**Related:** [Build 1 Content Registry](../../content/vertical-slice-content-registry.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (setup step 2; equipment maxima special case)

## Summary

Wayfarer's Coat (`maxHp:+3`) and Pilgrim's Knot (`maxStamina:+1`) write `maxHpDelta` / `maxStaminaDelta` on the item snapshot, and `deriveHeroPools` knows how to add them. `equipItem` / `unequipItem` never recompute the hero sheet, and `startCombat` copies `hero.maxHp` / `hero.maxStamina` as-is. Equipping those vessels at Reward, Rest, or Haven leaves pools unchanged. Combat HP and Stamina caps stay at the unequipped class totals. Increasing a maximum must not refill current HP/Stamina; lowering a maximum must clamp immediately.

## Authority

Decision Register `content.pack` — Build 1 loads the accepted finite registry. Content Registry vessels:

> `pilgrims_knot` … relic … passive: `maxStamina:+1`  
> `wayfarers_coat` … body … passive: `maxHp:+3`

Combat Simulation Contract, setup order step 2:

> Apply equipped-item stats, affixes, and injected cards; derive every combatant's current DEX and `itemInitiative`.

Special case:

> If an equipment/stat change lowers a maximum below current Mana or Stamina, clamp the current value down immediately. Increasing a maximum does not refill it.

`itemInitiative` already sums at combat start (Emberglass Cowl works). The same setup step must apply pool deltas. A prior scout/spec assumed `max_hp` / `max_stamina` already applied because the formula exists; the live equip and `startCombat` copy paths do not call it.

## Classification rationale

`bug` — accepted registry passives and combat setup stats. No new player-facing rule. Not Draft injury −1 AP. `deepdrawn` affix `max_secondary_plus_1` uses the same mechanic snapshot fields and should ride the same recompute.

## Package touch list

- `packages/sim/src/expedition.ts` — `equipItem` / `unequipItem` must recompute pools from the active holdings list (run or Haven)
- `packages/sim/src/combat.ts` — only if combat setup must apply deltas without waiting for the hero sheet (do not double-count if expedition already recomputed)
- `packages/sim/src/state.ts` — optional: `recomputeHero` should take holdings, not assume `run.holdings`, so Haven equip works
- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C12`

## Acceptance criteria

- [x] `SIM-C12`: Vanguard with `wayfarers_coat` equipped has `maxHp === 37` on the hero sheet and the combatant; current HP stays 34
- [x] `SIM-C12`: Weaver with `pilgrims_knot` equipped has `maxStamina === 5` on the hero sheet; current Stamina stays 4
- [x] Live `equipItem` (map/reward/Haven holdings, not a fixture mutate) updates those maxima before the next `startCombat`
- [x] Unequip clamps current HP/Mana/Stamina down when a maximum falls
- [x] Named streams only; never `Math.random()`
- [x] `pnpm test` covers the change
- [x] `pnpm check:boundaries` still passes
- [x] Out of scope listed below is untouched

## Out of scope

- Injury −1 AP / Quiet House `treatInjury` / Keep Watch Strain removal
- Still Wall Weakened duration (separate spec)
- Emberglass Cowl `itemInitiative` (already applied at combat start)
- Double-counting Coat/Knot if both expedition recompute and `startCombat` add the same delta
- PRs #3–#6

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Helper already used by `SIM-C04`–`C06`: embark, equip the vessel onto the matching empty slot, `startCombat` with `combatInitiative: [0.9, 0.9, 0, 0]`.

- Coat on Vanguard `body`: assert hero and combatant `maxHp` 37, `hp` 34.
- Knot on Weaver `relic1`: assert hero `maxStamina` 5.
- Separate live path: `createItemInstance` as `held_by_expedition`, `equipItem` command, assert the hero sheet before combat.

Browser is not correctness authority.

kind: bug
