# Timeline Block / Guard coverage windows

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-23  
**Decision Register:** `ux.interaction`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (setup UI + Block/Guard timing), [Build 1 Interaction Contract](../../ux/interaction-contract.md) (combat hierarchy), [Build 1 Acceptance Plan](../../product/build-1-acceptance-plan.md) `SIM-02`

## Summary

The initiative tracker shows portrait, name, initiative, enemy intent, and Now/next, but not whether current Block or Guard still covers the enemy turns before a hero acts again. Standees already chip Block and Guard. A late Vanguard must still infer “these next hound turns are covered” from standee chips plus queue order. Accepted combat UI requires that late-acting defense is visible on the timeline, not guessed.

## Authority

Combat Simulation Contract — setup UI:

> The UI shows the complete ordered timeline before the first action: portrait/silhouette, initiative value, current condition markers, and enemy next intent. It also highlights the enemy turns that occur before each hero's next turn, so late-acting defense is never a blind guess.

Interaction Contract — Combat hierarchy:

> The action area prioritizes, in order: active turn/AP, next enemy turns and intents before this hero acts again, hero resources/conditions, then playable cards and Basics.  
> The timeline makes a late Vanguard's next-turn defensive timing visible rather than asking the player to infer it.

Acceptance Plan `SIM-02`:

> Timeline/intent snapshot identifies turns before Vanguard's next turn; Hold the Line Guard expires at Vanguard next-turn start and redirects only direct targeted damage.

Block / Guard timing (for the window, not new rules):

> Block | Clears at the start of its owner's next turn, except a Gloom-touched initial Block layer clears at the start of the owner's second turn.  
> Guard | … Expires at the start of the guarding hero's next turn.

Draft `combat.md` wording about “show which upcoming enemy turns are protected by current Block/Guard” is context only. The accepted sentences above are sufficient.

Roadside evidence already logged this as an enhancement, not a rules bug (`docs/specs/evidence/roadside-trail-2026-08-20.md`).

## Classification rationale

`enhancement` — tests and UX readability only. No new player rule. Sim already publishes `blockLayers`, `guards`, `timeline`, and intents. Standees already render Block/Guard chips (`combat-standee-block-burn-guard-intent` shipped). This leftover is timeline coverage windows so late defense is not inferred.

## Package touch list

- `packages/client/src/combat/combatUi.ts` — snapshot-derived helper (e.g. `defenseCoverageWindows`) listing, for each living hero, upcoming enemy ids that resolve before that hero's next turn start, plus whether current Block / an active Guard link still covers them
- `packages/client/src/combat/InitiativeTracker.tsx` — render those windows on the tracker (text, not color-only): Block amount and/or Guard label on the hero row and/or on the covered enemy rows
- `packages/client/src/combat/combatUi.test.ts` — named client Vitest for the helper

Do not change `packages/sim`. Do not recompute damage, initiative, or targeting legality in the client.

## Acceptance criteria

- [x] A pure helper derived from `CombatSnapshot` returns, for a late Vanguard with Block > 0 while another hero is active: the enemy ids that act before Vanguard's next turn start, and a flag/label that current Block still covers those turns
- [x] The same helper, when Vanguard is Guarding Weaver: Weaver's row (or the covered enemy rows) shows that Guard still covers those same upcoming enemy turns, until Vanguard's next turn start
- [x] `InitiativeTracker` shows the coverage window without requiring the player to hover a standee; color is not the only signal
- [x] Timeline still shows portrait/silhouette, initiative value, and enemy next intent (do not regress shipped tracker facts)
- [x] Client Vitest covers the helper with a constructed snapshot (no live host, no `Math.random()`)
- [x] `pnpm test` covers the change
- [x] `pnpm check:boundaries` still passes
- [x] Out of scope listed below is untouched

## Out of scope

- Changing Block / Guard sim timing
- Isolating SIM-04 Burn / Exposed / Guard party-wide fixtures (separate enhancement)
- Burn chip tooltip copy (open PR #4)
- Standee Block / Guard / Burn chips (already shipped)
- Poison, revival cards, injury −1 AP, E2E-02

## Test plan

`pnpm vitest run packages/client/src/combat/combatUi.test.ts`

Construct a snapshot (reuse the `combatant()` helper in `combatUi.test.ts`):

- Timeline `weaver`, `hound-1`, `hound-2`, `vanguard`; cursor on Weaver (`timelineCursor` 0)
- Vanguard `blockLayers` sum 6, `expiresAtOwnerTurnStart` = Vanguard `turnsStarted + 1`
- One Guard: Vanguard guarding Weaver, `expiresAtGuardTurnStart` = Vanguard `turnsStarted + 1`

Expect: Vanguard coverage lists `hound-1` and `hound-2` as Block-covered. Weaver coverage lists the same enemies as Guard-covered. After advancing the snapshot so Vanguard is the active combatant (Block already expired at turn start), the helper lists no remaining Block window for that Vanguard.

Browser UX smoke is optional and not correctness authority. Do not start `pnpm dev` or claim LAN combat was tested.

kind: enhancement
