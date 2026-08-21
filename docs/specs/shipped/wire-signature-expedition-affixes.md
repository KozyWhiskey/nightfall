# Wire remaining signature and expedition affix modifiers

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — bug vs accepted contract` (`content.pack` Exact first-pool / Legendary signatures)  
**Related:** [Build 1 Content Registry](../../content/vertical-slice-content-registry.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md)

## Summary

Legendary signatures and several remaining registry modifiers (`ashen_names`, `waystation`, `deepdrawn` mana path, `first_burn_plus_1` / burn damage, `hound` / `long_vigil` discounts) are still text-only or incomplete after the first affix-wiring pass. Wire the highest-value remaining combat and expedition hooks so Legendary chase pieces and common suffixes are honest.

## Authority

Content registry Exact first-pool effects + Legendary templates; no text-only mechanics.

## Classification rationale

**bug** — accepted effects undeclared in sim behavior.

## Package touch list

- `packages/sim/`
- `packages/fixtures/`

## Acceptance criteria

- [x] `vigils_promise` — Guard grants protected ally 2 Block
- [x] `cinder_scar` — enemies with Burn deal 1 less calculated damage
- [x] `hounds_pursuit` — first time each combat an enemy becomes Exposed, draw 1 (owner of equipped signature)
- [x] `ashen_names` — when an ally becomes Downed, equipping hero gains 4 Block
- [x] `deepdrawn` — spell vessels gain maxMana +1; physical/universal gain maxStamina +1 (fix mechanicsFor)
- [x] `waystation` — first Event Run Gloom increase each expedition reduced by 5 (min 0)
- [x] Fixtures `SIM-AFFIX-SIG-*` / extensions cover signatures + deepdrawn + ashen_names at minimum
- [x] `pnpm test` and `pnpm check:boundaries` pass

## Out of scope

- `hound` / `long_vigil` first-use resource discounts (optional if time)
- `cinders` burn damage +1 per stack (optional if time)
- UI polish

## Honest simplifications

- `hounds_pursuit` one-shot tracking uses run flags `hounds_pursuit_used:<heroId>` (cleared on `startCombat`) instead of a new `CombatSnapshot` field — no contracts change.
- `waystation` only reduces positive Event `changeRunGloom` via `addGloom(..., { fromEvent: true })`; edge/combat gloom paths are unchanged.
- `ashen_names` fixture asserts the `item_passive` fact (Block amount) because `advanceUntilHero` may open the owner's next turn and expire `ownerNextTurn` Block before the assertion.

## Implementation notes

- Signatures resolve via equipped `mechanicSnapshot.modifiers` (`guard_ally_block`, `burned_enemy_damage_minus_1`, `exposed_draw`, `ally_downed_block`, `gloom_increase_reduction`).
- `deepdrawn` / `max_secondary_plus_1`: spell-granting vessels → `maxManaDelta`; else `maxStaminaDelta` (armor / physical / no granted card).
- Fixtures: `SIM-AFFIX-SIG-01`…`06` in `packages/fixtures/src/sim-affix.test.ts`.

## Test plan

Equip signature items via fixture mutation; trigger Guard / Burn enemy attack / apply Exposed / ally Downed; assert Block/damage/draw. Event gloom with waystation flag/counter.

kind: bug
