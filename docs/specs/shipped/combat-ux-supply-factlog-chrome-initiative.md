# Change Spec: Combat UX polish (supply warning, fact log, chrome, initiative)

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-20  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Interaction Contract](../../ux/interaction-contract.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md)

## Summary

Finish remaining combat presentation gaps vs accepted contracts: replace blocking `window.confirm` for supply with an inline dismissible warning; keep a readable fact log visible during combat while the rail is collapsed; rename misleading “Enemy phase” chrome; show each combatant’s initiative value on the timeline; add brief condition tooltips (terms only).

## Authority

Interaction Contract:

> Only irreversible single-use supply consumption receives a brief, dismissible warning on first use, not a blocking modal.  
> Motion may decorate resolution but must not be the only evidence that a command succeeded; a readable fact log accompanies state change.  
> condition/tooltips … Tooltips can explain terms, not conceal rules.

Combat Simulation Contract:

> There is no hero phase, enemy phase…  
> The UI shows the complete ordered timeline … portrait/silhouette, **initiative value**, current condition markers, and enemy next intent.

## Classification rationale

**Bug** for supply confirm and missing fact-log visibility vs explicit contract text. **Enhancement**-leaning polish for chrome copy, initiative numerals, and condition tooltips that tighten presentation of already-accepted rules. Bundled as one client-only approved change.

## Package touch list

- `packages/client/` — `CombatView.tsx`, `App.tsx`, `InitiativeTracker.tsx`, `CombatStandee.tsx`, `combatUi.ts` (+ CSS), client Vitest where pure helpers change

## Acceptance criteria

- [x] Supply use never calls `window.confirm`; warning is inline and Cancel/Esc dismisses without consuming the item
- [x] While combat rail is collapsed, recent fact messages remain visible (compact strip or equivalent)
- [x] Playback chrome says “Enemy turn” (or actor-focused wording), not “Enemy phase”
- [x] Initiative tracker shows each combatant’s `initiative` value
- [x] Known conditions expose a short `title` tooltip explaining the term
- [x] `pnpm test` and `pnpm check:boundaries` pass; no `Math.random()` in gameplay

## Out of scope

- Haven/embark/party `confirm()` dialogs outside combat supply
- Sim rule changes; new conditions content
- Full glossary / encyclopedia UI

## Test plan

1. Unit/helper coverage for condition tooltip text and any supply-warning pure helpers if extracted.
2. Grep/assert CombatView has no `confirm(` for supply.
3. `pnpm test` / `pnpm check:boundaries`. Optional smoke: Use supply shows banner; collapsed rail still shows facts; tracker shows Init N.

kind: bug
