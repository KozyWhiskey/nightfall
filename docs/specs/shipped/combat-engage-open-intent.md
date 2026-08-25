# Change Spec: Combat Engage beat + battlefield intent

**Kind:** enhancement  
**Status:** shipped  
**Last updated:** 2026-08-21  
**Decision Register:** `none — closes accepted combat open / intent presentation gap`  
**Related:** [Combat Simulation Contract](../../systems/combat-simulation-contract.md), [Interaction Contract](../../ux/interaction-contract.md), [Build 1 Acceptance Plan](../../product/build-1-acceptance-plan.md) (`SIM-01`)

## Summary

When enemies win initiative, `startCombat` currently calls `advanceUntilHero` inside the same command that enters combat, so opening bites resolve before the client mounts the combat view. Players see HP already missing and never get a readable open. Pause after combat setup, require an explicit **Engage** acknowledgement, then advance (reusing existing turn playback for leading enemies). While the field is visible—before and after Engage—enemy **next intents** must also appear on hostile standees (not only in the initiative rail or during playback), with kind + magnitude + target domain readable without relying on color alone.

## Authority

Combat Simulation Contract — setup and UI-before-action:

> 6. Create the fixed combat timeline … then reveal every living enemy's first intent.  
> 7. Apply start-of-combat effects…  
> 8. Give the first timeline combatant its turn.  
> The UI shows the complete ordered timeline before the first action: portrait/silhouette, initiative value, current condition markers, and enemy next intent. It also highlights the enemy turns that occur before each hero's next turn…

Interaction Contract — combat must-show and intent hierarchy:

> Complete initiative timeline; … visible enemy intents…  
> An enemy intent must identify target domain, exact magnitude when known, and timing; icons never stand alone.  
> The action area prioritizes, in order: active turn/AP, next enemy turns and intents before this hero acts again…

Build 1 Acceptance Plan `SIM-01`: full initiative timeline appears before action.

Initiative formula and individual timeline remain unchanged (heroes are not forced first).

## Classification rationale

**Enhancement.** Authority already requires timeline + intents before the first resolved action and readable enemy intents on the field. This adds an explicit Engage acknowledgement and standee-level intent presentation so those rules are playable, without changing who wins initiative, damage math, or prep/potion systems.

## Package touch list

- `packages/contracts/` — `engageCombat` command; `CombatSnapshot.awaitingEngage` (or equivalent boolean)
- `packages/sim/` — stop after setup; `engageCombat` → `advanceUntilHero`; reject other combat commands while awaiting
- `packages/fixtures/` — fixture helper auto-Engage for existing SIM suites; new `SIM-C*` for pause / Engage / enemy-first open
- `packages/client/` — Engage control; lock dock until Engage; persistent enemy standee intent callouts; optional highlight of enemies acting before the next hero turn
- `.cursor/rules/combat-ui.mdc` — allow `engageCombat` in the legal combat command list
- Do **not** edit Locked/Accepted design docs in this change; cite them only. Interaction Contract Combat “May submit” gains `engageCombat` when this ships (follow-up doc sync or same PR if the implementer updates that one table row—prefer same PR for truthfulness).

## Acceptance criteria

- [x] After `startCombat` / node entry into combat, snapshot has combat with first intents revealed, start-of-combat effects applied, `awaitingEngage: true`, and **no** opening enemy (or hero) turn resolutions yet
- [x] Legal combat actions (`playCard`, basics, supply, `endTurn`) reject while `awaitingEngage`; only `engageCombat` advances
- [x] `engageCombat` clears the gate, runs `advanceUntilHero`, and existing client playback can present any leading enemy turns before the first hero dock unlocks
- [x] Combat UI shows a primary **Engage** control while awaiting; dock actions stay locked; timeline + intents are fully visible
- [x] Each living hostile standee shows its **current next intent** as readable text (reuse `intentSummary`: label, magnitude when known, targetLabel) plus kind glyph/label—not color-only; idle standees included, not only playback
- [x] Enemies that act before the next hero turn are visually distinct on the field and/or timeline during the Engage beat and on hero turns (timing cue required by contract)
- [x] `SIM-C13` enemy-first open: forced streams so hostiles lead; assert HP unchanged and intents present before Engage; after Engage, damage/facts match prior behavior
- [x] `SIM-C14` hero-first open: Engage still required; first hero turn begins only after Engage
- [x] Existing SIM combat fixtures keep passing via fixture helper auto-Engage (or explicit Engage) so suites stay focused
- [x] Client Vitest covers intent standee helper / “acts before next hero” selection if extracted
- [x] `pnpm test` and `pnpm check:boundaries` pass
- [x] Out of scope untouched

## Out of scope

- Forcing party-first initiative or ambush surprise rules
- Pre-combat potion / free ability phase
- Changing Band-1 damage tuning or opening HP floors
- Reworking mid-fight playback timing beyond wiring Engage → existing queue
- New intent content ids or enemy AI
- Browser-driven combat correctness

## Test plan

1. **SIM-C* (enemy-first pause):** `startFixtureCombat` / enter combat with `combatInitiative` forcing hounds above heroes (invert the usual `[0.9, 0.9, 0, 0]` hero bias). Assert `awaitingEngage`, hero HP unchanged vs pre-combat, intents length ≥ enemy count, `playCard` rejected. `engageCombat` then advances; assert damage facts / HP after advance match previous auto-advance behavior.
2. **SIM-C* (hero-first Engage):** existing hero-first streams; assert still awaiting until Engage; after Engage, `activeCombatantId` is the lead hero with AP granted.
3. Fixture helper: default auto-Engage so `SIM-01` / `SIM-C02` / affix suites need no mass rewrite.
4. Client unit: `intentSummary` unchanged contract; helper for “enemy ids before next hero on timeline from cursor”; optional render helper test.
5. `pnpm test` + `pnpm check:boundaries`. Optional UX smoke: Roadside Trail → see Engage + standee intents → Engage → playback if enemies led → Mara/Rook turn.

## Assumption

- `awaitingEngage` lives on `CombatSnapshot` (not a separate view) so save/resume mid-open remains coherent.
- Engage is acknowledgement only—not a confirmation modal for irreversible spend (Interaction Contract confirmation policy unchanged).
- Named streams only; no `Math.random()`.

kind: enhancement
