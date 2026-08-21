# Change Spec: Event disclosure polish (all Build 1 events)

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Interaction Contract](../../ux/interaction-contract.md), [Vertical-Slice Tuning](../../content/expeditions/vertical-slice-tuning.md), [Event decision UX clarity](event-decision-ux-clarity.md)

## Summary

Complete honest Event disclosure across all five Build 1 events on the shared Cost / Outcome / Odds screen: humanize flag and outcome labels into player-facing rules; show materials an option **grants** (not only spends) on the state strip; disclose Ember Pit **Toss a scroll** as Risky Overbind with the craft odds table; align Fallen Waystation **Salvage the lens** with tuning (25% Frayed on the Imbued relic).

## Authority

Interaction Contract — Event must show:

> Exact cost, consequence, target, and probability categories for each option; current relevant resources

Vertical-Slice Tuning:

> Salvage the lens — Gain one generated Imbued relic, add 5 Run Gloom; it has a 25% chance to carry `Frayed`.  
> Toss a scroll into the pit — … Resolve a free Risky Overbind using the [Risky Overbind] table … Display … before confirmation.

## Classification rationale

**Bug** vs Interaction Contract / tuning: Ember Pit toss and Salvage Frayed omit disclosed odds that accepted tuning already requires. Humanized labels and grant materials on the strip are presentation fixes so “exact consequence” and “relevant resources” are readable, bundled in one client/sim/content pass.

## Package touch list

- `packages/content/` — `salvage_lens` outcome table (75% clean / 25% Frayed)
- `packages/sim/` — flag/outcome humanization; `eventChoices` pack-aware; toss_scroll Risky Overbind bands; Frayed grant path
- `packages/client/` — `relevantMaterials` includes grant materials; tests
- `packages/fixtures/` — Salvage Frayed branches; toss_scroll presentation assertion

## Acceptance criteria

- [x] Event OUTCOME lines use player-facing wording for known expedition flags (Block amount, Rest modifier, reward-three, resin downside, vouchers, grants)
- [x] Outcome ODDS bands use readable labels (not raw ids alone) for Choir, Waystation, Ember Pit overbind
- [x] State strip includes materials referenced by costs **or** `grantMaterial` effects on any option
- [x] Toss a scroll is `risky`, shows Risky Overbind weight bands (55/25/15/5), requires gear target, no false Guaranteed
- [x] Salvage the lens: +5 Gloom always; 75% clean Imbued relic / 25% Imbued relic with Frayed; both disclosed before choose; forced `event` streams cover both
- [x] `pnpm test` / `pnpm check:boundaries` / `pnpm check` pass; no `Math.random()`

## Out of scope

- New events; Rest/Craft copy redesign beyond shared strip behavior
- Changing Risky Overbind weights
- Full glossary UI

## Test plan

1. Unit: humanized presentation for courier / resin / toss_scroll bands; `relevantMaterials` includes grant-only emberglass/salvage.
2. Fixture: enter `cache_ember_pit` — toss choice has riskTier + four outcome bands.
3. Fixture: `salvage_lens` with `event: [0.1]` vs `[0.9]` → clean vs Frayed relic (`curseId` / selfDamage).
4. Extend SIM-07 random branches; remove salvage from guaranteed-only list.
5. `pnpm check`.

kind: bug
