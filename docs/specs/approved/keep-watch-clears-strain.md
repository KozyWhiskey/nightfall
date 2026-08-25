# Keep Watch must remove Strain before the next combat

**Kind:** bug  
**Status:** approved  
**Last updated:** 2026-08-25  
**Decision Register:** `run.rest`  
**Related:** [Gloom, Light, and Rest](../../systems/gloom-and-stress.md), [Combat Simulation Contract](../../systems/combat-simulation-contract.md) (Strain row), [Interaction Contract](../../ux/interaction-contract.md) (Rest / `chooseRestOption`)

## Summary

Keep Watch already grants both heroes 3 Block at the next combat and slices one injury off the targeted hero. It never removes Strain. `chooseRest` does not clear `next_combat_one_strain` and does not exempt the targeted hero from Gloom-band Strain at combat start. Choir-in-the-Bark's pending Strain and Pressing/Overrun Strain therefore still apply after the player spent Rest on Keep Watch. Pending Rest copy already promises Strain removal.

## Authority

Decision Register `run.rest` — Rest then offers Tend Wounds, Resupply, or Keep Watch. Owning spec [Gloom, Light, and Rest](../../systems/gloom-and-stress.md):

> **Keep Watch** | Remove Strain or one temporary expedition injury from one hero; both heroes begin their next combat with 3 Block.

> Strain is a light, temporary state: the affected hero has `-1 AP` for that next combat only. It clears after that combat, **or may be removed by Rest**.

Combat Simulation Contract Strain row: the affected hero starts that next combat with `-1 AP` and Strain clears when that combat ends. Rest removal is the other accepted clear path; shipped `strain-ap-lasts-whole-combat` parked it as out of scope.

Interaction Contract Rest row: the Rest view must expose Keep Watch's effects via `chooseRestOption`.

## Classification rationale

`bug` — accepted Rest effect is missing. No new player-facing rule. Injury slice and next-combat 3 Block already exist. Draft injury-table −1 AP / Quiet House `treatInjury` are not this bug.

Keep Watch's Strain removal is distinct from Rest's base `-12` Run Gloom. If Gloom remains Pressing (≥70) after that reduction, the targeted hero must still be exempt from that next combat's Gloom Strain.

## Package touch list

- `packages/sim/src/expedition.ts` — `chooseRest` Keep Watch branch: clear pending Strain for the targeted hero (and/or consume `next_combat_one_strain`) in addition to the existing injury slice and `next_block_*` flags
- `packages/sim/src/combat.ts` — `startCombat` must honor that exemption so Gloom 70/90 and `next_combat_one_strain` do not apply Strain to a Keep-Watched hero
- `packages/fixtures/src/sim-combat.test.ts` — `SIM-C15`
- Client Rest copy already matches the contract; no client change if pendingDecision text stays

## Acceptance criteria

- [ ] `SIM-C15` Choir flag: `runGloom: 0`, `next_combat_one_strain` set, no injuries, `chooseRestOption` `keep_watch` targeting Weaver, then `startCombat` `roadside_trail`. No hero has Strain. Both heroes still have 3 Keep Watch Block.
- [ ] `SIM-C15` Gloom exemption: `runGloom: 82` (Rest → 70, still Pressing), Keep Watch targeting Weaver, `combatTarget` forced to Weaver. Weaver has no Strain at combat start. Keep Watch Block still applies.
- [ ] Injury slice on the targeted hero is unchanged. Resupply / Tend Wounds do not clear Strain.
- [ ] `pnpm test` covers the change
- [ ] `pnpm check:boundaries` still passes
- [ ] Out of scope listed below is untouched

## Out of scope

- Draft injury combat penalties (`injured` −1 AP / `wounded` / `drained`)
- Quiet House `treatInjury` (Haven; new_capability)
- Player-facing Strain-vs-injury picker when a hero has both; Keep Watch still takes one hero target
- Poison, revival cards, E2E-02
- Implementing the fix in this scout PR beyond the failing fixture

## Test plan

`pnpm vitest run packages/fixtures/src/sim-combat.test.ts`

Named streams only; never `Math.random()`. Browser is not correctness authority.

- Enter Rest via the `rest` node + `chooseRestOption` (do not skip `chooseRest`). Then `startCombat` `roadside_trail`.
- Forced streams: `combatInitiative: [0.9, 0.9, 0, 0]`, `combatIntent` padded with `0`, `combatTarget: [0]` so Pressing Strain would land on timeline-first Weaver without the exemption.
- Do not use `setActiveHero` for the Strain assertion (it overwrites AP). Assert conditions on combatants after Engage.

kind: bug
