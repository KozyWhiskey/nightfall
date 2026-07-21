# Progression

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [party-and-roster.md](party-and-roster.md), [haven-buildings.md](haven-buildings.md), [map-and-nodes.md](map-and-nodes.md), [spellcraft.md](spellcraft.md), [../loops/failure-and-torches.md](../loops/failure-and-torches.md)

## Goal

**Vertical-slice scope override:** expedition levels and their stat points are temporary. On a successful boss-clear Return, each surviving expedition hero earns one pending Leadership Point; The Wardyard records it as one permanent attribute choice. Subclasses, third schools, and their offers are future content.

Invest in people and Haven over time: levels, subclasses, schools, unlocks — without deleting the need for expedition skill. Content difficulty is met mainly by **choosing Gates (level bands)**, not by endlessly scaling one path to the party.

## Future progression model (deferred beyond the vertical slice)

### Within a run

- Hero XP / levels from fights and bosses.
- Every level grants one freely assigned point in `VIT`, `DEX`, `STR`, or `INT`. `STR` expands physical power/Stamina and `INT` expands spell power/Mana, so attribute growth can support cross-play discovered gear. Cards, gear, subclasses, and schools remain the main build-defining choices.
- **Subclass offers** at meaningful beats (elite/boss/event) — subclass opens a **third school** (see Schools below).
- Deck growth via loot and craft (**learn only from known schools**).

### Across runs (same Haven)

- Roster keeps levels/subclasses/gear/schools when survivors return.
- Buildings unlock classes, Gates/bands, craft safety, embark buffs.
- **Town pillars** (Haven HP) and **waypoints** (map growth) track campaign stakes separately — see failure-and-torches.
- Soft **band / segment completion** counts may be recorded (Memorial-like), not as a fail streak.
- Stronger parties take **higher Gates**; weaker parties still have Frontier Gates to run. Fresh Haven starts with **one** path out.

### Across Havens (account)

- **Legacy Scars** only — see [../loops/failure-and-torches.md](../loops/failure-and-torches.md).

## Level bands vs party power

| Approach | Nightfall choice |
|----------|------------------|
| Soft-scale all content to party | Avoid as primary |
| **Zoned Gates** (MMO-like) | **Locked preference** — each Gate targets a band; see [map-and-nodes.md](map-and-nodes.md) |
| Haven upgrades | Raise baseline power; still pick appropriate Gates |

Mixed-level rosters: embark with a party whose **effective band** matches the Gate you choose. Over/under-level rewards are domain-tunable, not free scaling.

## Schools (class learning)

Every class starts with **two schools** (skill / magic types). A hero may **learn cards/spells only from schools they know**.

- **Subclass** (chosen later) opens a **third school** — identity fork.
- Rare ruined-settlement and waypoint discoveries may permanently teach an **additional school** to an individual hero. This is an earned expansion beyond the class/subclass baseline, not universal access from the start.
- Knowing multiple schools enables **cross-school craft reactions** (e.g. Tide + Storm → stun hybrid). Groundwork in [spellcraft.md](spellcraft.md).
- Class school tables: [../content/classes/README.md](../content/classes/README.md).

## Subclasses

- Each class has multiple subclasses that change cards, passives, play patterns, and **which third school** unlocks.
- Future launch target: every launched class has **≥2** subclasses.
- Offered as choices — not automatic.
- **No respec** — subclass (and its third school) is permanent for that hero.
- **No attribute respec** — level-point choices are permanent. Every stat must remain useful enough that an experimental choice does not ruin a hero.
- **Future:** some classes may unlock an **additional** tree at a level gate (extra path, not a swap of the first).

## Unlock gates

| Unlock | Typical gate |
|--------|--------------|
| Class | Major settlement discovery, then The Wayfarer recruit pool |
| Subclass (+ 3rd school) | The Wardyard, then a successful in-run milestone / offer |
| Level band / Gate | Waypoint progress / The Wayfarer rumors |
| Safer craft tiers | Ember Vault upgrades |
| Additional school | Rare ruined-settlement / waypoint discovery for a hero |

## Acceptance criteria

- [ ] Subclass choice visibly changes the next fight **and** opens a readable third school
- [ ] Locked content has a clear in-world unlock path
- [ ] Gate pick is an explicit power/content choice (not hidden scaling)
- [ ] Progression never replaces combat puzzle skill

## Open questions

- Soft level recommendations shown on Gate UI (numbers vs tags only)?
