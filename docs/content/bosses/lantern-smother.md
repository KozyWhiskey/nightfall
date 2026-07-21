# Boss: Lantern-Smother

**Status:** Initial vertical-slice boss brief  
**Band:** 1 — Frontier  
**Related:** [Bosses](README.md), [Frontier Enemy Roster](../enemies/band-1-frontier.md), [Balance Reference](../../systems/balance-reference.md)

## Identity

- **ID:** `lantern_smother`
- **One-line fantasy:** A Gloom intelligence nesting around a fallen Way-lantern, feeding on the memory of its protective light.
- **Role:** First Segment Boss; readable major-intent puzzle.

The Smother speaks in voices the party recognizes or fears recognizing. It is memory horror first: the lantern's last purpose has been distorted into a hunger that wants all light silent.

## Initial combat profile

| Property | Value |
|----------|-------|
| HP | 110 for the two-hero vertical slice |
| DEX | 2 (slow-to-mid initiative) |
| Fight target | 4–6 minutes |
| Major lesson | Stop hitting the boss when a more urgent telegraph appears |

## Intent cadence

The boss applies pressure on **every boss turn**. Every second normal attack also creates the Shroud telegraph. The major attack resolves on its following turn unless the party destroys the Shroud.

| Boss turn | Intent | Effect |
|----------:|--------|--------|
| 1 | `raking_fog` | Deal 7 Gloom damage to the lowest-Block hero. |
| 2 | `stolen_voice` + `gather_shroud` | Deal 4 Gloom damage and apply Exposed for one turn; create a Smothering Shroud. |
| 3, Shroud alive | `consume_the_light` | Deal 9 Gloom damage to **each hero in the party**; increase run Gloom by 8; remove the Shroud. |
| 3, Shroud destroyed | `scattered_mist` | Deal 3 Gloom damage to **each hero in the party**; Lantern-Smother becomes Exposed for one turn. |
| 4+ | Repeat with `drown_the_spark` or `raking_fog`, then the same every-second-turn Shroud cadence. |

`drown_the_spark` deals 5 Gloom damage and applies Weakened for one turn. It replaces a normal attack in later cycles so the boss does not become completely solved.

## Smothering Shroud

The Shroud is a separate, targetable enemy/object created by `gather_shroud`.

| Property | Value |
|----------|-------|
| HP, 2 heroes | 18 |
| HP, 3 heroes | 27 |
| Initiative | Does not take a normal turn |
| UI rule | Display: “Will consume the Way-lantern next turn.” |
| Destroyed | Cancels Consume the Light and triggers Scattered Mist / boss Exposed window |

The party gets one complete initiative cycle after `gather_shroud` to respond. They may destroy the Shroud, Block/Guard to endure the blast, or accept the Gloom cost when finishing the boss is more valuable.

## Reward and narrative result

Victory:

1. Claims the first Waypoint.
2. Opens the waypoint chest and starts the Return leg.
3. Reveals a ruined-settlement trace beneath the fallen Way-lantern.
4. Awards the **Ember Vault blueprint**.
5. Presents the Ember Shard choice before Return.
6. Awards 4 Timber, 4 Stone, and 1 Wick as the first-clear construction cache.

## Constraints

- No hidden immunity, accuracy check, or surprise phase transition.
- No adds, boss healing, or secondary boss mechanic in the first slice.
- The major intent must have a large distinct UI treatment, including the Shroud HP and cancellation rule.
- The boss may later receive carried exceptional loot, but not in the first teaching version.
