# Wire registry affix modifiers into combat

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — bug vs accepted contract` (`content.pack` / content registry Exact first-pool effects)  
**Related:** [Build 1 Content Registry](../../content/vertical-slice-content-registry.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md)

## Summary

Most affix modifiers are stored and displayed but never applied in combat beyond initiative/cost/retain/exhaust/self-damage/block/damage deltas. Yellow text that does nothing destroys loot trust. This change wires the highest-frequency Build 1 registry modifiers so equipped affixes change combat outcomes as documented.

## Authority

Content registry Exact first-pool effects and acceptance: “no text-only mechanics.” Combat simulation contract: equipped affixes apply through mechanic snapshots.

## Classification rationale

**bug** — accepted content effects already declared; sim under-implements them.

## Package touch list

- `packages/sim/`
- `packages/fixtures/`

## Acceptance criteria

- [x] `card_burn` — granted damaging card applies 1 Burn
- [x] `basic_block_plus_1` — owner Basic Block +1 Block
- [x] `combat_start_draw` — draw +1 at combat start while equipped (also honors passive id)
- [x] `guard_self_block` — when this hero creates Guard, gain 2 Block
- [x] `exposed_damage_plus_2` — +2 damage vs Exposed on granted attack
- [x] `first_block_plus_2` / `card_block_plus_2` — already partially via blockDelta; verify first-block / card-block semantics match registry or document honest simplification
- [x] `spell_damage_plus_1` — already via damageDelta on spells; verify
- [x] Curses `frayed`/`hollow`/`overdrawn` already via selfDamage/exhaust/secondaryCostDelta — fixtures confirm
- [x] Named fixtures `SIM-AFFIX-*` cover at least burn, basic block, combat-start draw, and guard-self-block
- [x] `pnpm test` and `pnpm check:boundaries` pass

## Honest simplifications

- `first_block_plus_2` continues to apply as a permanent `blockDelta: +2` on the granted card (same path as `card_block_plus_2`). True “first Block each combat” tracking was not added; registry wording is stronger than the sim behavior.

## Implementation notes

- Card-scoped mods (`card_burn`, `exposed_damage_plus_2`) resolve via `card.sourceId` → `run.holdings` item modifiers.
- Hero-scoped mods scan equipped `mechanicSnapshot.modifiers` (passives already merged in `createItemInstance` / `enrichItemDisplay`).
- `combat_start_draw` raises first-turn `refillHand` target by equipped count when `turnsCompleted === 0` and `turnsStarted === 1`.

## Out of scope

- Full legendary signature suite (`vigils_promise`, `cinder_scar`, `hounds_pursuit`) unless cheap to add in same PR
- Expedition-only mods (`gloom_increase_reduction`, `waystation`) — separate if needed
- Reward UI / rarity chrome

## Test plan

Forced equip + `startFixtureCombat` / playCard / useBasicBlock with named streams. Assert Burn stacks, Block amounts, hand size at combat start, Guard self Block.

Fixtures: `SIM-AFFIX-01`…`SIM-AFFIX-08` in `packages/fixtures/src/sim-affix.test.ts`.

kind: bug
