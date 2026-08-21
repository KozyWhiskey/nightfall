# Party inspector stash-vs-worn compare

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — enhancement vs accepted contract`  
**Related:** [reward-desire-path](../shipped/reward-desire-path.md), Party & packs inventory

## Summary

Party & packs inspector shows bag gear effects but not what the matching slot currently holds. Reuse `equipCompareRows` so selecting bag equipment shows Empty/worn name + delta for the active hero — same honesty as the reward screen.

## Package touch list

- `packages/client/`

## Acceptance criteria

- [x] Selecting bag equipment for the active hero shows compare vs matching slot (Empty or worn name + delta)
- [x] Uses `equipCompareRows` (no parallel delta math)
- [x] Ineligible / scroll / non-gear unchanged
- [x] Client Vitest covers compare wiring; `pnpm test` + `pnpm check:boundaries`

## Out of scope

Full dual-pane layout redesign; multi-hero Party compare; sim changes.

kind: enhancement
