# Build 1 Acceptance Plan and Cutline

**Status:** Accepted final pre-architecture plan
**Last updated:** 2026-07-19
**Authority:** This plan defines verification and completion. Product behavior remains owned by the Decision Register and accepted specifications.
**Related:** [Current Scope](current-scope.md), [Combat Simulation Contract](../systems/combat-simulation-contract.md), [Expedition State Machine](../systems/expedition-state-machine.md), [Interaction Contract](../ux/interaction-contract.md), [Content Registry](../content/vertical-slice-content-registry.md), [Vertical-Slice Tuning](../content/expeditions/vertical-slice-tuning.md)

## Purpose

Build 1 is complete when a player can repeatedly play the approved solo loop, save at every boundary, experience both success and failure honestly, and inspect every resolved result. A visually attractive partial combat prototype is not a completion substitute; neither is a rules engine with no readable player flow.

## Release cutline

### Required

- One local saveable Haven, fixed Vanguard/Aether Weaver pair, and The Unlit Road through boss, waypoint, Return, and Haven results.
- All accepted Build 1 content registry definitions load and validate from data.
- Deterministic command/revision/RNG/save behavior and the full wipe/succession path.
- All required screens and information from the Interaction Contract.
- Local run-history facts sufficient to evaluate the accepted tuning targets.

### Explicitly not required

- Co-op, accounts, cloud sync, networking, player party selection, or recruits.
- Shadowblade, subclasses, Umbra learning, summons, Blood magic, Shops, Elites, other regions, or a second boss.
- Full inventory UI, armor for Legs/Feet, storage constraints, reclaim expeditions, or advanced building tiers.
- Live OpenRouter generation. A local deterministic Chronicle is required; the optional network enhancement is not.
- Final art, controller support, localization production, achievement systems, analytics service, or a public deployment pipeline.

## Automated acceptance scenarios

Tests use fixed scenario fixtures: an initial snapshot, content version/hash, named RNG-stream states, and a command sequence. Fixtures must be able to inject desired event/loot/intent outcomes without using UI automation. Each test asserts final state, resolved facts, and no illegal duplicate ownership.

| ID | Scenario | Required assertions |
|---|---|---|
| `SIM-01` | Two-Hound opening victory | Full initiative timeline appears before action; Basics remain usable; victory grants exactly 50% max Mana/Stamina recovery and Combat 1 reward bundle. |
| `SIM-02` | Late Vanguard defense | Timeline/intent snapshot identifies turns before Vanguard's next turn; Hold the Line Guard expires at Vanguard next-turn start and redirects only direct targeted damage. |
| `SIM-03` | Card zones | Empty draw pile reshuffles discard through `combatDeck`; Exhaust never returns; Retain is visible and affects refill according to its source. |
| `SIM-04` | Conditions and downing | Block layers (including Gloom Block surviving to the owner's second turn), Exposed, Weakened, Burn, Guard, Strain, Downed, and revival targeting resolve at their exact documented timing. |
| `SIM-05` | Tactical enemy selection | A healing/buff intent without a useful legal target is filtered out; selected intent is seeded, visible, and cannot reroll after reveal. |
| `SIM-06` | Marked carrier | Enemy receives the generated carried item before combat; applicable modifier changes combat; the exact same instance drops once on victory. |
| `SIM-07` | Event branches | Each result branch of all four Build 1 events applies its disclosed cost/probability/result and writes the expected expedition flag. |
| `SIM-08` | Craft branches | Every Safe/Risky/Pit outcome consumes exact inputs, creates exact output/curse state, and never deletes an item in Build 1. |
| `SIM-09` | Boss Shroud destroyed | Destroying Shroud cancels Consume the Light, creates Scattered Mist, and applies boss Exposed. |
| `SIM-10` | Boss Shroud survives | Consume the Light damages all living heroes, adds +8 Run Gloom, removes Shroud, and does not duplicate the boss reward. |
| `SIM-11` | Waypoint protection | Boss victory commits waypoint/blueprint/trace; chest seal is irreversible; sealed gear/scroll/Shards cannot be used on Return. |
| `SIM-12` | Successful Return | Bank holdings once, release chest once, preserve eligible learned cards, reset temporary growth, apply Gloom result, queue Leadership, and emit deterministic Chronicle facts. |
| `SIM-13` | Wipe before boss | Lose party/unsealed holdings, snuff one pillar, preserve no unearned boss fact, and return a single wipe result. |
| `SIM-14` | Wipe after waypoint | Preserve waypoint/blueprint/trace and sealed chest; lose unsealed boss loot/unspent Shard; retain an already spent remote pillar repair. |
| `SIM-15` | Final-pillar succession | Create exactly one new Haven at furthest waypoint or Cinder Refuge, with 3/10 pillars and emergency cache; retain only approved campaign-world knowledge. |
| `SIM-16` | Reload/idempotence | Resume at every autosave boundary; duplicate `commandId` returns original result; stale revision cannot mutate state. |
| `SIM-17` | Content rejection | Invalid future school, archived event, incompatible affix, duplicate item location, unknown ID, or invalid target/effect fails validation before a run begins. |

## End-to-end player journeys

These are manual playthroughs over recorded seeds, not scripted UI-click tests. They verify that the real player experience matches the simulation facts.

| Journey | Route and purpose | Pass condition |
|---|---|---|
| `E2E-01 Cautious` | Combat 1 → Early Event → Combat 3 → Rest → Safe Craft → Deep Event → Combat 7 → Boss → Return Event | A first-time-informed player can explain each risk and reaches a meaningful boss/Return decision without feeling railroaded. |
| `E2E-02 Combat-forward` | All available combat branches → Boss → Return Combat | Extra fights produce visibly more/stronger opportunities and materially greater resource/Gloom pressure. |
| `E2E-03 Learning loss` | Take a valuable carried item, seal a second item, then wipe on Return | Results clearly distinguish party loss, unsealed loss, chest protection, and permanent world facts. |
| `E2E-04 Haven growth` | Return with first boss cache and build each core building across separate saves | First clear funds one meaningful choice, Wardyard forces a permanent assignment, Quiet House treats an injury, Forge changes loadout without inventing inventory rules. |
| `E2E-05 Succession` | Drive a fixture Haven to final-pillar wipe | Evacuation/memorial is emotionally clear; successor state is playable and does not falsely inherit gear/heroes/buildings. |

## UX and accessibility sign-off

Review the journeys above against this checklist on supported desktop resolutions:

- [ ] Combat never hides current actor, AP, HP/Mana/Stamina, card costs, timeline, or next enemy intent.
- [ ] Map always shows Run Gloom, edge `+5`, current pressure band, and legal outgoing choices.
- [ ] Reward, craft, and event screens show every relevant input, output, probability, and permanence state before confirmation.
- [ ] Color is not the sole signal for intent, condition, rarity, carried/sealed/Haven-held status, or Gloom pressure.
- [ ] Keyboard navigation reaches every actionable target and modal; focus never disappears after a state transition.
- [ ] Save/resume returns to the same actionable state without an unexplained duplicate popup or lost selection.
- [ ] Wipe, boss-clear, Return, and succession screens tell a consistent story of what changed.

## Playtest and tuning gate

Run at least 20 recorded fresh-Haven expeditions across the three route shapes before declaring the initial balance stable. Use a mix of informed playtesters and internal runs; do not pool results without labeling route, player familiarity, and content version.

| Metric | Initial target | Escalate when |
|---|---|---|
| Roadside Trail victory | 90–97% | Below 85% or any frequent first-fight wipe. |
| Boss arrival, required route | 75–90% | Below 70% or above 95%. |
| Boss victory after typical route | 60–75% | Below 50% or above 85%. |
| Full fresh-Haven Return | 55–70% | Below 45% or above 80%. |
| Combat-forward added value | 1–2 additional meaningful offers | Route does not feel better rewarded than cautious route. |
| Basic-action share | Informational, segmented by hero | Sustained >65% after the first two combats without resource-starvation explanation. |

For each escalation, change one content-data variable, replay the affected deterministic fixture, then record the hypothesis, old value, new value, content version, and observed result. Do not change formula code merely to rebalance content.

## Local diagnostic record

Each completed or failed run records locally: run ID/seed/content hash; route/nodes; Gloom changes; combat duration; resources before/after; supplies; downs/injuries; cards played; rewards selected/declined; event/craft branch; Shroud outcome; Return/wipe/succession result; and all user-visible Chronicle facts.

This record is player-owned local diagnostic data. Build 1 sends no analytics network request. It may be exported manually in a future developer tool, but export UI is not a release requirement.

## Definition of done

Build 1 may be called complete only when:

1. Every `SIM-*` scenario passes against the accepted content version.
2. Every `E2E-*` journey has a recorded successful review, including the UX/accessibility checklist.
3. At least 20 fresh-Haven runs meet the tuning gate or have a documented, approved exception.
4. No known issue can duplicate/losslessly corrupt a save, item, permanent grant, or terminal resolution.
5. Deferred items have not leaked into the executable registry, UI navigation, or save assumptions.
6. The build can start, resume, complete, wipe, and create a successor Haven entirely offline.

## Architecture handoff inputs

The future architecture decision must demonstrate how it will satisfy this plan:

- pure deterministic simulation package usable by tests and UI;
- serializable versioned snapshots and named RNG streams;
- declarative content loading/validation from the registry;
- local persistence with migration boundary and replayable command log;
- snapshot/view-model boundary for the client; and
- test tooling that builds scenario fixtures without browser-driven combat.
