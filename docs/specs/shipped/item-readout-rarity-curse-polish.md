# Item readout — rarity, curse, and sectioned effects

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — enhancement vs accepted contract` (`ux.interaction` a11y: color is never the only rarity carrier)  
**Related:** [Build 1 Interaction Contract](../../ux/interaction-contract.md), [Vertical-slice Affix Pool](../../content/items/vertical-slice-affix-pool.md)

## Summary

Loot desire needs readable power and dread: rarity must read without color alone, curses need full effect sentences plus distinct chrome, and effect lines should parse into Granted / Affixes / Curse / Passive. This enhancement structures `buildDisplayDescription` and upgrades reward + Party inventory presentation with tier glyphs, affix-count cues, and curse chrome — copy + CSS, no new subsystems.

## Authority

Interaction contract accessibility: color is never the only carrier of critical state including rarity. Affix-pool curse wording defines Frayed / Overdrawn / Hollow effects players must see before committing.

## Classification rationale

**enhancement** — tightens presentation of already-accepted mechanics without new player-facing rules.

## Package touch list

- `packages/sim/`
- `packages/client/`
- `packages/fixtures/` (or client/sim unit tests)

## Acceptance criteria

- [x] Cursed gear descriptions include full effect sentences for Frayed / Overdrawn / Hollow (affix-pool wording), not name-only
- [x] Reward cards and Party inventory inspector render Granted / Affixes / Curse / Passive sections when those lines exist; deck-inject callout still works
- [x] Salvaged→Legendary readable without color: tier glyph/shape + weight and/or affix-count on reward cards and inventory cells
- [x] Curse chrome is visually distinct from ordinary warning text and is not `titleCase(id)` alone
- [x] Vitest covers description grammar and/or client section parsers; `pnpm check:boundaries` passes

## Out of scope

- New `displaySnapshot` schema fields
- Full rarity art frames / VFX
- Combat modifier wiring (already shipped)
- New curse rules

## Test plan

Unit tests on `buildDisplayDescription` / parsers; optional UI smoke on reward + Party inspector.

kind: enhancement
