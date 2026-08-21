# Marked-carrier chase presentation

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — enhancement vs accepted contract` (visibly marked carriers; Reward shows marked-carrier item)  
**Related:** [Gear and Affixes](../../systems/gear-and-affixes.md) carried drops, [reward-desire-path](../shipped/reward-desire-path.md)

## Summary

Marked carriers already exist in sim (`carriedItemId`, `carrierItemId`) and reward shows a full carrier card, but combat only has a quiet standee chip. Harden the in-fight chase mark (status strip + initiative badge, non-color-only) and add a reward-enter fanfare for the recovered carrier item — client-only, without spoiling item identity mid-fight.

## Authority

Carried-drop design: enemies carrying exceptional items are visibly marked; exact effects remain hidden until drop. Interaction contract Reward row requires the marked-carrier item.

## Classification rationale

**enhancement** — presentation of existing snapshot fields.

## Package touch list

- `packages/client/`

## Acceptance criteria

- [x] When any living enemy has `carriedItemId`, combat chrome shows a non-color-only “Marked carrier on the field” status (text + border weight, not color alone)
- [x] That enemy’s initiative row includes a “Carrier” badge; standee keeps “Marked carrier” + rarity chip without revealing name/affixes
- [x] When Reward mounts with a resolvable `carrierItemId`, the carrier card gets an enter fanfare class + `aria-live` line naming the recovered item; readable text remains the evidence
- [x] Pure helpers unit-tested for detecting field carriers / building labels
- [x] `pnpm test` + `pnpm check:boundaries`; no sim/contracts schema change

## Out of scope

- Spoiling affixes mid-fight
- New sim facts / carrier rarity changes
- Map greed tooltips

## Test plan

Vitest helpers; optional UI smoke on stalking_choir with forced carrier.

kind: enhancement
