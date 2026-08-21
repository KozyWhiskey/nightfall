# Loot fact-log celebration

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — enhancement vs accepted contract` (`ux.interaction` readable fact log; color never sole rarity cue)  
**Related:** [Build 1 Interaction Contract](../../ux/interaction-contract.md), [reward-desire-path](../shipped/reward-desire-path.md)

## Summary

Taking or equipping Imbued/Rare/Legendary (or cursed) loot collapses to muted plain fact-log prose. Celebrate `reward_chosen` and `item_equipped` by resolving `data.itemId` against holdings and rendering rarity glyph + tier (+ cursed) with non-color-only chrome and a brief CSS beat, while keeping the textual message as the success evidence.

## Authority

Interaction contract: fact log accompanies success; motion may decorate but must not be the sole evidence; color is never the only rarity carrier.

## Classification rationale

**enhancement** — presentation of existing facts/snapshot; no new sim rules.

## Package touch list

- `packages/client/`

## Acceptance criteria

- [x] For `reward_chosen` / `item_equipped`, when holdings resolve `itemId`, the Way lantern row shows glyph + rarity label (and cursed when `curseId` set)
- [x] Notable rows (`imbued` | `rare` | `legendary` | cursed) get a distinct class (weight/border/glyph); Salvaged stays quiet
- [x] Celebration CSS may flash once; success remains readable as text (`aria-live` preserved)
- [x] Pure helper(s) unit-tested (resolve + notable); missing item falls back to raw `message`
- [x] `pnpm test` and `pnpm check:boundaries` pass; no sim/contracts schema change

## Out of scope

- New sim emit payloads
- Reward-enter drop theater / Party equip flash
- Combat-dock fact parity (optional follow-up)
- Browser as correctness authority

## Test plan

1. Vitest: mock ResolvedFact + ItemInstance → notable vs salvaged formatting/classes; missing item → raw message.
2. Optional UI smoke: Take / Take & equip Rare+ and confirm celebrated fact-log row.
3. No new `SIM-*`.

kind: enhancement
