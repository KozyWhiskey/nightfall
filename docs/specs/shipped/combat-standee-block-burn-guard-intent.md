# Change Spec: Combat standee readability (Block, Burn, Guard, intent target)

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-20  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md), [Interaction Contract](../../ux/interaction-contract.md), evidence `docs/specs/evidence/roadside-trail-post-playback-fix-2026-08-20.md`

## Summary

Combat UI omits snapshot facts the interaction contract requires to be visible without tooltips: hero Block, Burn stacks, active Guard links, and enemy intent target domain. Sim already publishes these; the client does not render them. Surface Block for all combatants, Burn from `combatant.burn`, Guard on guardian/protected standees, and include `targetLabel` in intent summaries.

## Authority

Interaction Contract — combat must-show and intent rule:

> Complete initiative timeline; active actor; AP/HP/Mana/Stamina; … visible enemy intents; … condition/tooltips  
> An enemy intent must identify target domain, exact magnitude when known, and timing; icons never stand alone.

Combat Simulation Contract — Guard / Block / Burn are Build 1 combat state (SIM-02 Guard; Block taught on Roadside; Burn from Ember Spark). Late Vanguard defensive timing must be readable, not inferred.

## Classification rationale

**Bug** against accepted presentation rules. No new player-facing rules; render existing snapshot fields.

## Package touch list

- `packages/client/` — `combatUi.ts`, `CombatStandee.tsx`, `CombatBattlefield.tsx` (and CSS chip classes if needed)
- Client Vitest for `intentSummary` / guard label helpers

## Acceptance criteria

- [x] Hero standees show Block when `blockLayers` sum > 0 (same chip language as enemies)
- [x] Standees show Burn when `combatant.burn.length > 0` (stack count visible)
- [x] Active `combat.guards` produce readable labels on guardian and protected standees
- [x] `intentSummary` includes `targetLabel` when non-empty (e.g. `Lunge 5 · lowest hp hero`)
- [x] Named client Vitest covers intent summary + guard label helpers
- [x] `pnpm test` and `pnpm check:boundaries` pass
- [x] Out of scope untouched

## Out of scope

- Supply `confirm()` replacement, fact-log rail default, “Enemy phase” copy, initiative numeric values
- Sim Guard/Block/Burn rules changes
- Browser-driven correctness

## Test plan

1. Unit: `intentSummary` with magnitude + targetLabel.
2. Unit: guard labels for guardian and protected ids from a GuardLink pair.
3. `pnpm test` / `pnpm check:boundaries`. Optional UX smoke: Flare Ward → Block on Mara; Ember Spark → Burn on hound; Hold the Line → Guard labels.

## Assumption

Burn display uses stack count (`burn.length`). Guard copy uses combatant names from the current snapshot.

kind: bug
