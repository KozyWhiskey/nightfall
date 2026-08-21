# Craft resolve forged-identity celebration

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — enhancement vs accepted contract` (`ux.interaction` readable facts)  
**Related:** [interaction-contract](../../ux/interaction-contract.md), [loot-fact-celebration](../shipped/loot-fact-celebration.md)

## Summary

Risky Overbind / imprint craft outcomes emit spreadsheet-style `craft_resolved` facts without `itemId`, so the fact log cannot celebrate forged identity. Emit `itemId` + a vessel-named message from sim, and treat `craft_resolved` in `lootFactUi` like other loot celebrations (rarity glyph + curse chrome).

## Classification rationale

**enhancement** — honesty of existing craft outcomes; Safe/Risky pre-confirm unchanged.

## Package touch list

- `packages/sim/`
- `packages/client/`
- `packages/fixtures/` (extend craft fixture if present)

## Acceptance criteria

- [x] Imprint/Overbind `craft_resolved` includes `data.itemId` for the forged gear
- [x] Fact message names the vessel (and curse/outcome in player language), not raw `outcomeId` alone
- [x] Way lantern applies rarity glyph/label for `craft_resolved` via existing loot celebration path
- [x] Cursed Overbind gets curse chrome
- [x] Pre-confirm Safe/Risky disclosure unchanged
- [x] Vitest covers presentation; craft fixture/sim asserts `itemId`; `pnpm test` + `pnpm check:boundaries`

## Out of scope

Craft odds UI rewrite, Safe Fuse card theater, new VFX, displaySnapshot schema.

kind: enhancement
