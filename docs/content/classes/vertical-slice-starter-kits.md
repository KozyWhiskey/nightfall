# Vertical-Slice Starter Kits

**Status:** Draft — review before locking  
**Last updated:** 2026-07-18  
**Related:** [Classes](README.md), [Balance Reference](../../systems/balance-reference.md), [Cards and Decks](../../systems/cards-and-decks.md)

**Build 1 authority:** [Content Registry](../vertical-slice-content-registry.md) owns stable IDs, sources, and executable effects. This document supplies teaching rationale only.

## Purpose

Define the first playable Vanguard and Aether Weaver kits. Both classes start deliberately simple: two class cards, two starting-gear cards, and always-available Basics. Their real identity should emerge through found gear, scrolls, additional schools, temporary expedition attributes, and later Wardyard-recorded Leadership choices.

All numeric values below are initial balance anchors, not final tuning.

## Shared starter rules

- Every hero has 3 AP per turn, a three-card hand, Basic Attack, and Basic Block.
- Starting deck: 2 class cards + 2 cards injected by starting equipment.
- Every hero has both Stamina and Mana; class starting pools merely express a bias.
- Universal weapon cards granted by gear have no school requirement. School-specific cards still require the matching school.
- The fixed Build 1 pair has no recruitment-time modifier roll. Future recruits may use the documented permanent-at-recruitment variation seam.
- Expedition growth is temporary; successful boss-clear Return grants the separate Wardyard Leadership Point. No respec.

## Vanguard

**Teaching role:** Reliable protection, Block, Guard, Weakened, and spending Stamina for a decisive physical action.

### Starting profile

| Property | Value |
|----------|------:|
| HP | 34 |
| Stamina | 10 |
| Mana | 3 |
| Initiative | Low–mid |
| Basic Attack: `iron_blow` | 1 AP; deal 5 physical damage |
| Basic Block: `raise_shield` | 1 AP; gain 6 Block |

### Starting deck

| Source | ID | Card | Cost | Effect |
|--------|----|------|------|--------|
| Class | `shield_bash` | Shield Bash | 1 AP + 1 Stamina | Deal 4 physical damage; apply Weakened for one turn. |
| Class | `hold_the_line` | Hold the Line | 1 AP + 1 Stamina | Gain 4 Block; Guard a chosen ally until the Vanguard's next turn. |
| Iron sword | `iron_cut` | Iron Cut | 1 AP + 2 Stamina | Deal 9 physical damage. |
| Kite shield | `brace` | Brace | 1 AP + 1 Stamina | Gain 10 Block. |

### Future recruitment-time gear variation

One starting gear card receives one modifier when the Vanguard is recruited. The player sees it before confirming a non-initial recruit; recruitment offers refresh only through play, not manual rerolls.

| Base card | Possible modifier |
|-----------|-------------------|
| Iron Cut | `+1` damage **or** apply 1 Burn |
| Brace | `+2` Block **or** Retain |

## Aether Weaver

**Teaching role:** Mana as a combat budget, direct spell damage, Burn, and weaker defensive efficiency than the Vanguard.

### Starting profile

| Property | Value |
|----------|------:|
| HP | 24 |
| Stamina | 4 |
| Mana | 10 |
| Initiative | Mid–high |
| Basic Attack: `staff_strike` | 1 AP; deal 3 physical damage |
| Basic Block: `deflect` | 1 AP; gain 4 Block |

### Starting deck

| Source | ID | Card | Cost | Effect |
|--------|----|------|------|--------|
| Class | `aether_bolt` | Aether Bolt | 1 AP + 2 Mana | Deal 11 Aether damage. |
| Class | `ember_spark` | Ember Spark | 1 AP + 1 Mana | Deal 4 Ember damage; apply 1 Burn. |
| Aether rod | `aether_lash` | Aether Lash | 1 AP + 1 Mana | Deal 6 Aether damage. |
| Lantern charm | `flare_ward` | Flare Ward | 1 AP + 1 Mana | Gain 7 Block. |

### Future recruitment-time gear variation

One starting gear card receives one modifier when the Aether Weaver is recruited. The player sees it before confirming a non-initial recruit; recruitment offers refresh only through play, not manual rerolls.

| Base card | Possible modifier |
|-----------|-------------------|
| Aether Bolt | `+1` damage **or** costs 1 less Mana once per combat |
| Flare Ward | `+2` Block **or** Retain |

## Early growth

The first slice should show level growth without immediately introducing subclass complexity.

| Moment | Build 1 rule |
|--------|------------|
| Third victorious standard combat | Each living hero immediately assigns one temporary attribute point. |
| First successful boss Return | Reset temporary expedition levels; each surviving hero earns one pending Leadership Point, assigned permanently only through the Wardyard. |
| Subclass | Not offered in the first vertical-slice expedition |
| Gear path | Aether Weaver may use a universal Stamina weapon card; Vanguard may use a Mana relic card if found |

## Review checks

- Does Vanguard feel durable without making Aether Weaver irrelevant?
- Does Aether Weaver's 2-Mana Bolt feel stronger than the Vanguard's 2-Stamina Iron Cut?
- Does the first hand give a real choice while Basics prevent dead turns?
- Does a single random gear modifier create personality without confusing onboarding?
- Does the first attribute point make a future cross-build feel possible but not mandatory?
