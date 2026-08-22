# Burn standee tooltip uses Poison timing

**Kind:** bug  
**Status:** approved  
**Last updated:** 2026-08-22  
**Decision Register:** `ux.interaction`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (Burn / Poison rows), [Interaction Contract](../../ux/interaction-contract.md)

## Summary

Sim ticks Burn at the target’s **end of turn** (`finishTurn`: 2 damage per stack × Exposed, then decrement duration). The Burn chip on `CombatStandee` hardcodes “Burn deals damage at the **start** of this combatant's turn” — Poison’s accepted timing, which Build 1 does not implement. `conditionTooltip()` already explains Exposed / Weakened / Stun / Strain, but Burn bypasses it. Players are told the wrong rule.

## Authority

Decision Register `architecture.determinism` → Combat Simulation Contract — Condition timing:

> Burn | Each stack deals 2 damage at target end-of-turn, then loses one duration. Each stack lasts 2 target turns initially.

> Poison | Future-ready: same stack structure as Burn, but damage at start-of-turn. No Build 1 content uses it.

Decision Register `ux.interaction` → Interaction Contract:

> No critical numerical effect exists only in a tooltip. Tooltips can explain terms, not conceal rules.

Combat must-show includes condition/tooltips. A tooltip that states Poison’s start-of-turn rule for Burn conceals the accepted timing.

## Classification rationale

`bug` — accepted Burn timing is misstated in the client. No new player-facing rule. Sim and `SIM-04` Ember Spark application already match the contract; only the chip title is wrong. Shipped `combat-standee-block-burn-guard-intent` required a visible stack count, not this copy. Shipped `combat-ux-supply-factlog-chrome-initiative` added `conditionTooltip` for other conditions; Burn was left on a hardcoded string.

## Package touch list

- `packages/client/src/combat/combatUi.ts` — add a Burn entry to `CONDITION_TOOLTIPS` that says end-of-turn (not start-of-turn)
- `packages/client/src/combat/CombatStandee.tsx` — Burn chip `title` must use `conditionTooltip("burn")` (or the same helper string); delete the hardcoded start-of-turn sentence
- `packages/client/src/combat/combatUi.test.ts` — extend `conditionTooltip` coverage

## Acceptance criteria

- [ ] `conditionTooltip("burn")` matches end-of-turn timing and does not mention start-of-turn
- [ ] `CombatStandee` Burn chip title uses that helper (no hardcoded Poison timing)
- [ ] Existing Exposed / Weakened / Stun / Strain tooltips stay accurate
- [ ] Client Vitest covers the Burn tooltip
- [ ] `pnpm test` covers the change
- [ ] `pnpm check:boundaries` still passes
- [ ] Out of scope listed below is untouched

## Out of scope

- Implementing Poison start-of-turn (new_capability; no Build 1 content)
- Isolated Burn / Exposed / Guard party-wide `SIM-04` expansion
- Timeline Block/Guard coverage windows
- Injury −1 AP, revival cards, E2E-02
- Changing Burn sim damage or duration
- Implementing the tooltip fix in this scout PR beyond the failing test

## Test plan

`pnpm vitest run packages/client/src/combat/combatUi.test.ts`

Assert `conditionTooltip("burn")` matches `/end of/i` and does not match `/start of/i`. Named streams are N/A (pure UI helper). Browser is not correctness authority.

kind: bug
