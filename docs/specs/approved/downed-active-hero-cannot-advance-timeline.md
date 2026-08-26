# Downed active hero cannot advance the timeline

**Kind:** bug  
**Status:** approved  
**Last updated:** 2026-08-26  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (timeline skip, Downed, commands), [Build 1 Acceptance Plan](../../product/build-1-acceptance-plan.md) `SIM-04`

## Summary

A hero who becomes Downed on their own turn stays `activeCombatantId`. `playCard` / `useSupply` do not skip the remaining turn. `endTurn` then fails `invalid_actor` because `activeHero` requires `isAlive`. Ash Tonic self-use at 1 HP (and Frayed `selfDamage`) hang combat while the other hero is still up. The client imminent-enemy window also treats a Downed hero as the next actor and cuts off later enemy turns.

## Authority

Combat Simulation Contract — Timeline rules:

> A Downed combatant remains in the timeline for deterministic ordering but its turn is skipped.  
> A Downed hero cannot act or be normally targeted; only explicit revival effects can target them.

Turn order step 1: start turn checks Stun/downed state. Skip already exists when the cursor **lands on** a Downed combatant (`beginCurrentTurn` → `"skipped"`). It does not run when the **current** actor is Downed mid-turn.

Setup UI:

> It also highlights the enemy turns that occur before each hero's next turn, so late-acting defense is never a blind guess.

`SIM-04` requires Downed timing to match the contract. Isolate-sim-04 parked already-Downed damage and revival *targeting* as latent; it did not cover mid-turn skip.

## Classification rationale

`bug` — accepted skip rule is missing for the active actor. No new player-facing content. Ash Tonic is Build 1 supply; Frayed is a registry curse. The client helper miss is the same skip rule, not a new UX feature.

`dealDamage` / `directDamage` still lack an inner already-Downed guard. That remains latent (no living caller after `selectTargets` / `isAlive` filters). Do not treat it as this bug.

Draft injury −1 AP / Quiet House `treatInjury` are not this bug.

## Package touch list

- `packages/sim/src/combat.ts` — after a command Downs the active hero and combat stays `active`, skip the remaining turn the same way a Downed combatant is skipped when the cursor lands on them (`finishTurn` + `moveCursor` + `advanceUntilHero`). Do not require a follow-up `endTurn` as the Downed actor. `activeHero` may keep rejecting other commands from a Downed actor.
- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C18`
- `packages/client/src/combat/combatUi.ts` — `enemyIdsBeforeNextHero` must walk past Downed heroes (they remain on the tracker) and stop at the next living hero, matching `livingHeroes` used by coverage windows
- `packages/client/src/combat/combatUi.test.ts` — Downed hero between two enemies

## Acceptance criteria

- [ ] `SIM-C18` Ash Tonic self-down: `roadside_trail`, named streams `combatInitiative: [0.9, 0.9, 0, 0]`, `combatIntent` padded with `0`. Timeline Weaver → Hound A → Vanguard → Hound B. Weaver HP 1, `useSupply` Ash Tonic targeting Weaver. Combat stays `active`. Weaver is Downed. `activeCombatantId` is **not** Weaver. The next living hero (Vanguard) is active with AP. Hound A has completed a turn (skipped remaining Weaver actions, then advanced). A follow-up `endTurn` as Weaver is not required.
- [ ] `SIM-C02` still holds for a **living** actor: `playCard` / `useSupply` must not advance the cursor unless that command Downs the active hero (or ends combat).
- [ ] Wipe path unchanged: if the Ash Tonic Downs the last living hero, outcome is wipe; do not skip into empty turns.
- [ ] `enemyIdsBeforeNextHero`: timeline `[enemy-1, downed-hero, enemy-2, living-hero]`, cursor on `enemy-1`, returns both enemy ids. A living hero still ends the window.
- [ ] Named streams only; never `Math.random()`
- [ ] `pnpm test` covers the change
- [ ] `pnpm check:boundaries` still passes
- [ ] Out of scope listed below is untouched

## Out of scope

- Inner `dealDamage` / `directDamage` guard for an already-Downed target (latent; isolate-sim-04)
- Revival targeting / `heal.revive` content
- Draft injury combat penalties (`injured` −1 AP)
- Quiet House `treatInjury`
- Poison, E2E-02
- Implementing the fix in this scout PR beyond the failing fixtures

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts packages/client/src/combat/combatUi.test.ts`

Named streams only; never `Math.random()`. Browser is not correctness authority.

- Add Ash Tonic with `createItemInstance` (`held_by_expedition`). Set Weaver combatant HP to 1. Use `setActiveHero` only to place the cursor before the tonic; do not use it to assert post-command AP (it overwrites AP).
- Force timeline Weaver → Hound A → Vanguard → Hound B so skip is visible: Hound A must act before Vanguard's turn begins.
- Client test uses snapshot combatants; no sim.

CI red on `SIM-C18` and the Downed imminent-enemy case is intentional until the implementer lands.

kind: bug
