# Isolate SIM-04 condition fixtures

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-23  
**Decision Register:** `build.acceptance`  
**Related:** [Build 1 Acceptance Plan](../../product/build-1-acceptance-plan.md) `SIM-04`, [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (condition timing, targeting, special cases)

## Summary

Acceptance Plan `SIM-04` is the Build 1 bar for condition and downing timing, but the fixture only asserts Gloom Block second-turn expiry, Shield Bash applying Weakened, and `reviveForFixture` flipping `downed`. Exposed, Burn, Guard party-wide non-redirect, Weakened expiry, Strain, Downed targeting, and revival *targeting* are unasserted. Sim already implements the missing rules; this change isolates them in named `SIM-C*` fixtures so a later regression cannot hide behind a passing `SIM-04`.

## Authority

Acceptance Plan `SIM-04`:

> Block layers (including Gloom Block surviving to the owner's second turn), Exposed, Weakened, Burn, Guard, Strain, Downed, and revival targeting resolve at their exact documented timing.

Combat Simulation Contract — Condition timing:

> Exposed | `+25%` damage received until the end of the target's next completed turn.  
> Weakened | `-25%` outgoing damage until the end of the target's next completed turn.  
> Burn | Each stack deals 2 damage at target end-of-turn, then loses one duration. Each stack lasts 2 target turns initially.  
> Guard | Redirects direct targeted damage from the guarded hero to the guarding hero; does not redirect party-wide or untargeted damage. Expires at the start of the guarding hero's next turn.

Special case:

> Burn is fixed 2 damage per stack at target end-of-turn. It does not scale from INT after application. Exposed affects Burn; Weakened does not.

Targeting:

> `allEnemies` | All living members of that side.  
> Downed heroes are invalid targets except for explicit revival effects.

`SIM-04` already covers Gloom Block. `SIM-02` covers targeted Guard redirect + expiry. `SIM-C03` covers Strain for the whole combat. Do not duplicate those assertions.

## Classification rationale

`enhancement` — no new player-facing rule. Code already applies Exposed `×1.25`, Weakened `×0.75`, Burn 2/stack at `finishTurn`, Exposed-on-Burn, and `resolveGuard` only when `directTargeted` (`enemy|ally|lowestHpHero|lowestBlockHero|randomLivingHero`). The gap is fixture isolation. Revival *targeting* stays out of scope until a `heal.revive` card exists (`reviveForFixture` bypasses `selectTargets` and is not a targeting test).

## Package touch list

- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C08`, `SIM-C09`, `SIM-C10`
- Optional tiny helper in `packages/fixtures/src/index.ts` only if the new cases need a shared `startCombat` + learned-card setup (do not change `packages/sim`)

## Acceptance criteria

- [x] `SIM-C08` Exposed apply / expire / party start:
  - Play `piercing_thrust` (equip `gloomwood_spear` or add it as a learned card) at an unblocked Hound; Hound has Exposed
  - Follow-up Vanguard Basic Attack (or Iron Cut) deals `floor(raw × 1.25)` vs the same unblocked Exposed Hound
  - After that Hound completes one turn, Exposed is gone and a later hit uses raw damage
  - Reapplication refreshes expiry (second `piercing_thrust` before expiry does not stack a second Exposed row)
  - `next_combat_exposed` before `startCombat` puts Exposed on **both** living heroes
- [x] `SIM-C08` Weakened expiry: Shield Bash applies Weakened; after the target completes one turn, Weakened is gone and outgoing damage is no longer `×0.75` (apply-only is already in `SIM-04`)
- [x] `SIM-C09` Burn timing / stacks / Exposed-on-Burn / party-wide:
  - Weaver Ember Spark at an unblocked Hound: after the Ember damage (4), the Hound has 1 Burn stack; at that Hound's first `endTurn` / `finishTurn` it loses 2 HP and keeps 1 stack; at the second it loses 2 HP and Burn is gone
  - Ember Spark does not add INT to the Burn tick
  - With Exposed on the burner, the tick is `floor(stacks × 2 × 1.25)` (1 stack → 2; 2 stacks → 5)
  - Learned `ashfall` applies 1 Burn stack to **every** living enemy
- [x] `SIM-C10` Guard does not redirect party-wide damage:
  - Whisperwood Threshold (`mist_chanter`); Vanguard `hold_the_line` on Weaver; force Chanter `lament` (`allEnemies` / 3 gloom)
  - Weaver **and** Vanguard both lose HP from Lament; Guard does not move Weaver's share onto Vanguard
  - Do not re-assert `SIM-02` targeted redirect / Guard expiry
- [x] Named streams only; never `Math.random()`
- [x] `pnpm test` covers the change
- [x] `pnpm check:boundaries` still passes
- [x] Out of scope listed below is untouched
- [x] Existing `SIM-04` may stay as the Gloom Block + Weakened-apply + fixture-revive smoke; do not weaken it

## Out of scope

- Changing `packages/sim` condition, Guard, or Burn rules (already implemented)
- Strain duration (`SIM-C03` shipped)
- Targeted Guard redirect / expiry (`SIM-02`)
- Crack Open Exposed +3 rider (`SIM-C07`, shipped)
- Burn chip tooltip copy (shipped)
- Poison (contract: no Build 1 content)
- Revival targeting / Downed-cannot-take-damage live path (latent until a `heal.revive` card; `reviveForFixture` is not targeting)
- Injury definitions, Quiet House, Keep Watch
- Timeline Block/Guard coverage windows (separate enhancement)
- Implementing these fixtures in this scout PR

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Forced streams unless noted: `combatInitiative: [0.9, 0.9, 0, 0]` (pad extras for Whisperwood), `combatIntent: [0, 0, …]`. Use `startFixtureCombat` / the existing vessel+learned helper pattern. Do not use `setActiveHero` when AP-after-refill matters.

- `SIM-C08`: `roadside_trail`. Clear Block on the target before damage asserts. For party Exposed, set `run.flags` to include `next_combat_exposed` **before** `startCombat`.
- `SIM-C09`: `roadside_trail`. Put `ember_spark` in hand; set Weaver mana ≥ 1. For Ashfall, add `ashfall` to Weaver `learnedCardIds` before combat (same pattern as `SIM-C04`). Cycle with `endTurn` until the burned Hound is the actor so `finishTurn` ticks Burn; do not call `directDamage` from the test.
- `SIM-C10`: `whisperwood_threshold`. Timeline so Vanguard can Guard Weaver, then the Chanter acts with `lament` (mirror `SIM-05`'s intent overwrite if the revealed intent is not Lament). Assert both hero HP dropped.

Named streams only; never `Math.random()`. Browser is not correctness authority.

kind: enhancement
