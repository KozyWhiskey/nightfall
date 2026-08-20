# Stun skips the next complete turn

**Kind:** bug  
**Status:** shipped  
**Last updated:** 2026-08-20  
**Decision Register:** `none — bug vs accepted contract`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (`SIM-04` condition table; Stun row)

## Summary

Stun could be applied on a combatant but turn advance never skipped that combatant. The accepted contract says Stun skips the target's next complete turn and does not stack.

## Authority

Combat Simulation Contract: "Stun | Skips the target's next complete turn; cannot stack." Turn order step 1 checks Stun/downed after start-of-turn Block expiry.

## Classification rationale

`bug` — accepted rule, missing sim behavior. No new player-facing content (Build 1 has no stun card). Fixture applies Stun directly.

## Package touch list

- `packages/sim/src/combat.ts`
- `packages/fixtures/src/sim-combat.test.ts`

## Acceptance criteria

- [x] `SIM-C01` skips the stunned combatant and clears Stun
- [x] Duplicate Stun entries do not grant extra skipped turns
- [x] `pnpm test` covers the change
- [x] `pnpm check:boundaries` still passes

## Out of scope

- Adding a Build 1 stun card
- Poison
- Injury AP penalty

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Forced streams: `combatInitiative: [0.9, 0.9, 0, 0]`, `combatIntent: [0, 0]`. Timeline Vanguard → Weaver → Hounds. Stun Weaver, Vanguard `endTurn`. Weaver must not become the active commandable actor; Stun is gone.

kind: bug
