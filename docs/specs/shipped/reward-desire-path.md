# Reward desire path — compare, deck inject, carrier, leave gate

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — bug vs accepted contract` (`ux.interaction`)  
**Related:** [Build 1 Interaction Contract](../../ux/interaction-contract.md), [Vertical-Slice Rewards](../../content/expeditions/vertical-slice-rewards.md)

## Summary

The Reward view omits equip/deck impact, does not showcase the marked-carrier item as an identified card, and confirms leave when an offer is merely Imbued. Players cannot answer “is this better than what I wear?” or “what card do I gain?” at the dopamine peak. This change adds compare-to-equipped + deck-inject callouts per gear offer, renders the carrier item with ownership, and gates leave-confirm to Rare-or-better only (`rare` | `legendary`).

## Authority

Interaction contract Reward row: show automatic bundle; fully identified alternatives; **marked-carrier item**; **equip/deck impact**; current expedition holdings. Leaving confirms only if the offer includes a **Rare-or-better** item.

## Classification rationale

**bug** — accepted interaction/rewards contracts already require these surfaces; client under-implements them.

## Package touch list

- `packages/client/`
- `packages/fixtures/` (optional host/UI smoke only; no new combat correctness claims from browser)

## Acceptance criteria

- [x] Each gear offer shows the matching equipped item (or Empty) for at least one eligible hero slot, plus a one-line delta when numbers differ (HP / initiative / stamina / granted card name)
- [x] Each gear/scroll offer surfaces “Adds to deck” / “Learn …” from existing `displaySnapshot` (or dedicated callout), not buried only after Party open
- [x] When `carrierItemId` is set, the carrier item renders as a full identified card with Carried — at risk ownership (not a single prose note)
- [x] Leave confirmation triggers only for `rare` or `legendary` offers (not `imbued`)
- [x] Ownership strip echoes carried-at-risk framing consistent with Event decision strip (pack count / sealed count if cheap)
- [x] Manual or offline-smoke path still loads reward view; no sim purity regressions
- [x] `pnpm test` and `pnpm check:boundaries` pass

## Out of scope

- Procedural affix roll implementation (sibling spec)
- Full rarity art frames / VFX
- Side-by-side spreadsheet inventory compare in Party & packs (may reuse helpers lightly)

## Test plan

1. Client unit or shallow render test if present; otherwise code review + `pnpm test` green.
2. Optional UI smoke: `pnpm dev`, clear Roadside Trail, confirm compare lines + leave confirm only on rare+.
3. Fixture path that sets `carrierItemId` (or force carrier encounter) shows carrier card.

kind: bug
