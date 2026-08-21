# Wire remaining first-use resource and burn affixes

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Build 1 Content Registry](../../content/vertical-slice-content-registry.md)

## Summary

Three registry modifiers remain text-only after prior wiring: `first_burn_plus_1` (of Cinders), `exposed_resource_discount` (of the Hound), `retained_resource_discount` (of the Long Vigil). Also align `first_block_plus_2` / Lumenforged display with the honest always-on Block simplification OR implement first-Block-only tracking. Close the yellow-text trust gap for these common suffixes.

## Package touch list

- `packages/sim/`
- `packages/fixtures/`

## Acceptance criteria

- [x] `first_burn_plus_1` — first Burn applied by the vessel's granted card each combat gains +1 stack
- [x] `exposed_resource_discount` — first vessel-granted attack against Exposed each combat costs 1 less secondary (min 0)
- [x] `retained_resource_discount` — first retained vessel-granted card play each combat costs 1 less secondary (min 0)
- [x] Lumenforged / `first_block_plus_2` either tracks first Block only OR display copy says always +2 Block on granted card (no false “first” claim)
- [x] Fixtures cover the three modifiers; `pnpm test` + `pnpm check:boundaries` pass

## Out of scope

- UI chrome
- New affix IDs

## Honest simplifications / alignment

- `first_block_plus_2` / Lumenforged continues as always-on `blockDelta: +2` on the granted card (same path as `card_block_plus_2`). Display copy and `modifierLabels` now say “+2 Block on the granted card” so yellow text matches behavior; true first-Block-only tracking was not added.
- First-use combat tracking for the three wired modifiers uses run flags (`first_burn_plus_1_used:<itemId>`, `exposed_resource_discount_used:<itemId>`, `retained_resource_discount_used:<itemId>`), cleared on `startCombat` alongside `hounds_pursuit_used:`.
- `retained_resource_discount` interprets registry “first retained vessel-granted card” as the first play each combat of a vessel-granted card with `retain=true` (fixtures may set retain without pairing `anchored`, which is incompatible with `long_vigil` in the affix pool).

## Implementation notes

- Burn: `applyBurnFromVessel` wraps `card_burn` and `applyCondition` burn paths; +1 stack only on the first claim per item instance per combat.
- Cost discounts resolve in `playDefinition` via `vesselPlayCostDelta` (min 0 secondary).
- Fixtures: `SIM-AFFIX-09`…`12` (plus tightened `SIM-AFFIX-08` display assert) in `packages/fixtures/src/sim-affix.test.ts`.

## Test plan

Equip Cinders / Hound / Long Vigil vessels; assert burn stack counts and stamina spent on first vs second plays; assert Lumenforged description has no “first Block” claim.

kind: bug
