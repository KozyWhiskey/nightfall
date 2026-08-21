# Map greed hint tooltips

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — enhancement vs accepted contract` (Leg Map risk/reward readability)  
**Related:** [interaction-contract](../../ux/interaction-contract.md) Leg Map, Unlit Road reward focus

## Summary

Combat nodes on the route map lack greed temptation language. Add banded tooltip/aria hints from encounter reward tuning (`carrierChance`, `offerKinds`) — qualitative “scarce chase” / “marked prey more likely” / gear-or-scroll table lean — without printing percentages or spoiling rolls.

## Classification rationale

**enhancement** — presentation of existing content tuning; no new rules.

## Package touch list

- `packages/client/` (may depend on `@nightfall/content` for Build 1 pack tuning)

## Acceptance criteria

- [x] Revealed combat nodes with known `contentId` append greed hint to title/aria from pack tuning
- [x] Carrier bands: omit at 0; scarce / uncommon / marked-prey bands; never print `%`
- [x] Table band from `offerKinds` in qualitative words (scroll-/gear-leaning / mixed)
- [x] Fogged events stay unsullied; black-lantern danger copy remains additive
- [x] Unit-test band→copy helper; `pnpm test` + `pnpm check:boundaries`

## Out of scope

Sim schema, revealing whether a carrier already rolled, Elite rules.

kind: enhancement
