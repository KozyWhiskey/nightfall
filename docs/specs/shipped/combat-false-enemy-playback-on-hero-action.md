# Change Spec: False enemy turn playback on hero action

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-20  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md), [Interaction Contract](../../ux/interaction-contract.md)

## Summary

After a hero plays a card, Basic, or supply mid-turn, the client queues every later enemy for turn playback ("Enemy phase", intent callouts, ~920ms each, input lock) even though the sim never advanced the timeline. Root cause is `enemiesActedBetween` treating a new `timeline` array reference as turn advance. Fix the detector so mid-hero-turn snapshot revisions produce an empty playback queue; only real cursor/`activeCombatantId` advances (e.g. after `endTurn`) replay enemies.

## Authority

Combat Simulation Contract — turn loop:

> **Hero turn:** refill hand to three, resolve start-turn triggers, then allow actions until the player ends the turn or has no legal action.  
> **Enemy turn:** resolve its visible intent. Immediately roll and reveal its next intent.

There are no hero/enemy *phases*; each combatant acts only on their timeline slot. `playCard` / basics / supply do not advance the cursor.

Interaction Contract — combat surface:

> Complete initiative timeline; active actor; … visible enemy intents  
> Combat actions act immediately.

Playback is presentation of sim-resolved enemy slots, not an invented phase. Locking input during false enemy playback violates the accepted turn loop.

## Classification rationale

**Bug** against the accepted turn loop and combat UX contract. Sim already keeps the hero active until `endTurn` (`packages/sim/src/combat.ts`: only `endTurn` → `finishTurn` → `moveCursor`). The client invents enemy turns on every host snapshot with a new `timeline` array identity. No new design rule; presentation must match sim truth.

## Package touch list

- `packages/client/` — `enemiesActedBetween` (and any gate in `useTurnPlayback` if still needed)
- Client unit test for `enemiesActedBetween` (Vitest under `packages/client`)
- `packages/fixtures/` — `SIM-C02` asserting `playCard` does not change `timelineCursor` / `activeCombatantId`; `endTurn` advances past enemies

## Acceptance criteria

- [x] `enemiesActedBetween` returns `[]` when `timelineCursor` and `activeCombatantId` are unchanged between snapshots (even if `timeline` is a new array with the same order)
- [x] After a real advance past enemy slots (`endTurn` path), `enemiesActedBetween` returns exactly those enemy ids, in order
- [x] Named client Vitest covering both cases (forced snapshot pairs; no `Math.random()`)
- [x] `SIM-C02` proves `playCard` does not advance `timelineCursor` / `activeCombatantId`; `endTurn` does
- [x] Playing a card mid-hero-turn does not set playback `busy` / "Enemy phase" solely because revision bumped
- [x] `pnpm test` covers the change; `pnpm check:boundaries` still passes
- [x] Out of scope below untouched

## Out of scope

- Injury AP, poison, auto-end-turn on 0 AP, intent redesign, unrelated combat backlog
- Changing sim turn advance / `endTurn` semantics
- Browser-driven combat correctness

## Test plan

1. Unit: `enemiesActedBetween(prev, next)` with same cursor + active id, distinct `timeline` array refs → `[]`.
2. Unit: cursor advanced across one or more enemy ids before returning to a hero → those enemy ids only.
3. `SIM-C02`: start fixture combat, `playCard`, assert `timelineCursor` / `activeCombatantId` / `round` unchanged; `endTurn` advances past enemies to the next hero.
4. `pnpm test` (client + SIM fixtures). Browser UX smoke optional only after fixtures are green: play a card mid-turn and confirm no false Enemy phase.

## Assumption

Observed “enemies act after a card” is false client playback / input lock, not mid-hero-turn enemy HP/intent resolution from the sim. End Turn remains the player command that advances past enemy slots.

kind: bug
