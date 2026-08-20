# Nightfall Bugbot rules

Combat correctness lives in `@nightfall/sim` Vitest fixtures, never in the React client.

## Invariants

- Client code must not import `@nightfall/sim`, `@nightfall/host`, or `@nightfall/persistence`.
- `packages/sim` must not import React, DOM, Fastify, SQLite, `fetch`, `window`, `document`, `Date.`, `performance.`, or `Math.random(`.
- Gameplay RNG uses named streams only (`combatInitiative`, `combatIntent`, `combatTarget`, `combatDeck`, `loot`, `injury`, and the other streams in the simulation contract).
- Every combat command uses `{ commandId, expectedRevision, type, actorId?, payload }`. Invalid commands must not mutate state.
- Initiative timeline is created once per combat. Do not silently reorder it in Build 1.
- Every living enemy must have a revealed next intent before that intent resolves. Revealed intents must not reroll.
- Guard redirects only direct targeted damage; it expires at the start of the guarding hero's next turn.
- Block clears at the start of the owner's next turn, except Gloom-touched opening Block which lasts until the owner's second turn start.
- Stun skips the target's next complete turn and does not stack.
- Downed heroes cannot act, are not normally targeted, and take no further Build 1 damage.
- Victory restores `ceil(max * 0.5)` Mana and Stamina; HP does not auto-recover.

## Review focus

When a PR touches `packages/sim/**` or `packages/fixtures/**`, require a `SIM-*` or `SIM-C*` fixture (or an explicit reason the change is untestable). When a PR touches `packages/client/src/combat/**`, check the interaction contract: timeline, intents, AP/HP/Mana/Stamina, card costs, and Basics stay visible. Do not ask for Playwright combat-solver tests.
