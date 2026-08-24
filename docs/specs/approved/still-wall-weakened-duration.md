# Still Wall Weakened expires on the absorbing turn

**Kind:** bug  
**Status:** approved  
**Last updated:** 2026-08-24  
**Decision Register:** `content.pack`  
**Related:** [Build 1 Content Registry](../../content/vertical-slice-content-registry.md), [First Scroll Pool](../../content/spells/first-scroll-pool.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (Weakened timing; condition application)

## Summary

`still_wall` grants 9 Block and is supposed to Weakened the **first** enemy whose damaging intent is fully absorbed by that Block, for that enemy's next completed turn. Sim tags the Block layer with `sourceId === "still_wall"` and applies Weakened on a full absorb, but it uses `addCondition(..., duration: 1)` with no active-combatant bump. The absorb happens during the attacker's turn, so `finishTurn` immediately expires Weakened (`expiresAfterCompletedTurn === turnsCompleted`). The attacker never makes a later attack at `-25%` outgoing. The ward is also not one-shot: every later full absorb on a remaining `still_wall` layer re-applies.

## Authority

Decision Register `content.pack` — Build 1 loads the accepted finite registry. Content Registry:

> `still_wall` creates a one-combat reactive `still_wall_ward` condition that weakens the **first** enemy whose direct damage is fully absorbed by the owner's Block.

First Scroll Pool (Accepted via that registry):

> Gain 9 Block. The first enemy whose next damaging intent is fully absorbed by this Block becomes Weakened for 1 turn.

Combat Simulation Contract, Weakened:

> `-25%` outgoing damage until the end of the target's next completed turn.

Condition application:

> Exposed / Weakened | Do not stack; reapplication refreshes expiry to the target's next completed turn.

Card `applyCondition` already adds `+1` duration when the target is the active combatant so Shield Bash Weakened survives that enemy's current `finishTurn`. Still Wall's reactive path must use the same law. "For 1 turn" is that next completed turn, not the absorbing turn that is already in progress.

## Classification rationale

`bug` — accepted scroll + Weakened timing already in the loadable pack. No new player-facing rule. The trigger exists; the duration and first-enemy one-shot do not. Not a Draft injury/Poison/revival issue.

## Package touch list

- `packages/sim/src/combat.ts` — Still Wall absorb in `dealDamage`; Weakened duration (active-combatant bump or equivalent); consume the ward after the first full absorb
- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C11`

## Acceptance criteria

- [ ] `SIM-C11`: Vanguard plays `still_wall`, the next Hound Lunge (5) against that Vanguard is fully absorbed, and that Hound's **following** Lunge deals `floor(5 × 0.75) = 3` HP, not 5
- [ ] The absorbing Hound still has Weakened after its absorbing turn completes (the current `finishTurn` must not strip it)
- [ ] Only the first fully absorbed enemy per Still Wall Block layer is Weakened; a later full absorb on leftover Block does not Weakened a second enemy
- [ ] Named streams only; never `Math.random()`
- [ ] `pnpm test` covers the change
- [ ] `pnpm check:boundaries` still passes
- [ ] Out of scope listed below is untouched

## Out of scope

- Naming a visible `still_wall_ward` condition in the snapshot if `sourceId` tagging already implements the ward
- Shield Bash / Piercing Thrust `applyCondition` paths (already bumped)
- Injury −1 AP, Poison, revival cards, Keep Watch, Quiet House
- PRs #3–#6 (Crack Open, Burn tooltip, timeline windows, isolate SIM-04)

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Forced streams: `combatInitiative: [0.9, 0.9, 0, 0]`, `combatIntent` padded with `0` (Lunge). Inject `still_wall` onto Vanguard `learnedCardIds` before `startCombat`. Override timeline to Vanguard → Hound 1 → Weaver → Hound 2. Lower Vanguard HP so `lowestHpHero` is the wall owner. Play `still_wall`, `endTurn` through Hound 1, park Hound 2 on Circle so it does not chip the owner, `endTurn` through Vanguard's next turn, then assert Hound 1's second Lunge deals 3.

Browser is not correctness authority. CI red on `SIM-C11` is intentional until the implementer lands.

kind: bug
