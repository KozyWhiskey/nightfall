# Gloom, Light, and Rest

**Status:** Accepted vertical-slice system
**Last updated:** 2026-07-19
**Related:** [Combat](combat.md), [Vertical-Slice Rewards](../content/expeditions/vertical-slice-rewards.md), [Failure and Pillars](../loops/failure-and-torches.md), [Economy](economy.md)

## Goal

Gloom is visible expedition pressure and the antagonist's presence, not a full stress or personality simulation. It makes a long, reward-heavy route feel dangerous, while Rest, readable event choices, and Haven light give the player deliberate counterplay.

The system uses two linked meters:

- **Run Gloom** (`0..100`) is the immediate pressure of the current expedition.
- **Haven Gloom** (`0..10`) is persistent residual danger at the Pillarhouse. It determines how much Run Gloom the next expedition begins with.

No Gloom change may be hidden. The UI records the amount, source, and resulting threshold state in the expedition log.

## Run Gloom

### Starting and movement rules

| Rule | Value / behavior |
|---|---|
| First Haven | Starts at 0 Run Gloom and 0 Haven Gloom with 10 lit pillars. |
| Successor Haven | Starts at 0 current Run Gloom and 7 Haven Gloom: its 3/10 lit state means 7 pillars are snuffed, so its next expedition begins at 28 Run Gloom. |
| Expedition start | `Run Gloom = Haven Gloom x 4`. |
| Travelled edge | `+5 Run Gloom`. The map preview and travel result both show this. |
| Explicit event bargain or abandonment | Usually `+8` or `+12`, shown before confirmation. |
| Lantern-Smother's unbroken `Consume the Light` | `+8 Run Gloom`, as stated on its intent. |
| Rest | Base `-12 Run Gloom`, then a recovery choice. A disclosed expedition flag may modify this one Rest's effective reduction. |
| Event / item relief | Only when a specific resolved option or item explicitly states the value. |

Run Gloom is clamped to `0..100`. **Gloom damage** is ordinary HP damage with a thematic type; it does not itself increase Run Gloom.

### Pressure bands

High Gloom produces predictable, visible pressure rather than random punishment. The active band is always shown on the map and before an affected combat.

| Run Gloom | State | Effect |
|---:|---|---|
| 0-39 | Held at Bay | No global combat penalty. |
| 40-69 | Encroaching | The next combat is **Gloom-touched**: the enemy group begins with 3 Block. |
| 70-89 | Pressing | The next combat is Gloom-touched, and one hero begins **Strained**. |
| 90-100 | Overrun | The next combat is Gloom-touched and every hero begins Strained. Run Gloom cannot increase further until that combat resolves. |

`Gloom-touched` is announced before combat and is not hidden enemy scaling. It is a group-level starting 3 Block, applied once at combat start. It does not recur after every enemy turn. This special **Gloom Block** layer expires at the start of each affected enemy's **second** turn, so initiative cannot clear it before any hero receives a chance to attack.

**Strain** is a light, temporary state: the affected hero has `-1 AP` for that next combat only. It clears after that combat, or may be removed by Rest. It is not an affliction tree, a permanent trait, or a random card-discard penalty.

If a Run Gloom threshold is crossed during an active combat, its pressure applies to the **next** combat. The boss's stated `+8` remains a Run Gloom consequence even if the boss is the final combat; it affects the Return leg and Return result.

## Rest

Rest is an optional route node, not a Ration tax. Its base reduction is 12 Run Gloom; a disclosed expedition flag may reduce or otherwise modify that one Rest's effective value. The Rest screen always shows the base, modifier, and effective Gloom change before the recovery choice.

| Choice | Effect |
|---|---|
| **Tend Wounds** | Heal one hero for 40% of maximum HP. |
| **Resupply** | Fully restore both heroes' Mana and Stamina. |
| **Keep Watch** | Remove Strain or one temporary expedition injury from one hero; both heroes begin their next combat with 3 Block. |

Rest does not automatically heal the whole party or erase all attrition. Its disclosed Gloom relief and one chosen benefit make the route branch valuable even when resources are healthy.

## Resource attrition contract

Mana and Stamina persist across encounters. After each **victorious** combat, each hero restores 50% of their maximum Mana and 50% of their maximum Stamina, capped at maximum. HP never automatically recovers during an expedition.

Entering an Event, Safe Craft, or ordinary map node does not restore resources by default. A specific event result may do so. In-combat consumables are intentionally scarce but supported: Mana Phial (`+4 Mana`), Stamina Draught (`+4 Stamina`), and Ash Tonic (`+2 Mana`, `+2 Stamina`, then 1 direct damage).

This makes expenditure across fights meaningful without letting an ordinary combat-heavy route collapse into Basic Attack/Basic Block repetition.

## Haven Gloom and pillar-light

Haven Gloom is a compact persistent value, shown at the Pillarhouse beside the ring of ten pillars. Its minimum is the number of snuffed pillars; a damaged ring can never be treated as fully safe.

| Trigger | Haven Gloom change |
|---|---:|
| Successful Return at 0-24 Run Gloom | `-1` |
| Successful Return at 25-59 Run Gloom | `0` |
| Successful Return at 60-79 Run Gloom | `+1` |
| Successful Return at 80-100 Run Gloom | `+2` |
| Party wipe / lost-to-Gloom | `+1`, in addition to snuffing one pillar |
| Relight one pillar with an Ember Shard | `-1`, but never below the new snuffed-pillar floor |

After every change, clamp Haven Gloom to `snuffedPillarCount..10`. Thus a single snuffed pillar makes the next expedition begin at least at 4 Run Gloom; a Haven with five snuffed pillars begins at least at 20. Pillars therefore matter both as Haven survival and as direct expedition defense.

## Implementation and UI contract

- Store both meter values, each individual change record, and its source in deterministic run/Haven state.
- The map HUD shows current Run Gloom, current band, the next threshold, and the exact projected `+5` edge cost.
- The Haven HUD shows Haven Gloom, lit/snubbed pillar count, its current floor, and the next-embark Run Gloom value.
- Before an event choice, boss action, or item could change Gloom, show its exact amount and any immediate threshold consequence.
- Threshold values, recovery fractions, Rest values, and consumable numbers are content data and start with the values in this document.

## Explicit non-goals

- Full virtue/affliction or per-hero sanity system.
- Random high-Gloom bad-outcome checks, hidden curse rolls, or secret enemy scaling.
- Automatic resource restoration from non-combat nodes.
- A Ration cost for the vertical-slice Rest node.

## Acceptance criteria

- [ ] A player can identify why Run or Haven Gloom changed from the UI alone.
- [ ] A player can forecast whether a route will cross a Gloom threshold before travelling it.
- [ ] Rest is useful for Gloom, HP, resource, or condition recovery without being mandatory every run.
- [ ] Combat-heavy routes create resource decisions but remain viable with 50% victory recovery.
- [ ] A snuffed pillar visibly increases both Haven danger and next-run pressure.
