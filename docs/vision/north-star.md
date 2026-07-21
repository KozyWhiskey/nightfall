# North Star

**Status:** Locked  
**Last updated:** 2026-07-17

## Pitch

Nightfall is a dark roguelite expedition game: you lead a small party into a Gloom-infested shattered world, build unique card-based kits through loot and risky crafting, and bring resources and survivors home to grow a named Haven — knowing death can permanently dim that town.

## Player fantasy

You are Haven’s expedition leaders — survivors who risk everything so the settlement can endure. Characters matter; not everyone is expected to live. See [player-fantasy.md](player-fantasy.md).

## Emotional targets

| Priority | Feeling |
|----------|---------|
| Primary | Dark exploration — searching the ruins for what rebuilds the world |
| Primary | Combat puzzle mastery — every round is a decision, not button-mashing |
| Primary | Greedy buildcraft — unique item/spell combos with real downside risk |
| Supporting | Attachment to roster heroes and the named Haven |

**Audience:** mature adults — dark, consequential tone (see [tone-and-world.md](tone-and-world.md)). Not children’s fantasy.

## Design pillars

1. **Combat is a puzzle** — readable enemy intents, per-hero AP, initiative timeline; clearing a field or locking allies behind wards should feel clever.
2. **Everything actionable is a card** — attacks, abilities, and spells share one per-hero deck; gear can inject cards and modify how cards play.
3. **Risk has teeth** — pathing, craft fusion, and expedition death change Haven; enough wiped pillars and the town goes dark for good.
4. **Haven is the long game** — buildings, roster, a lit pillar ring of defense, a waypoint path into a procedural world, and Legacy Scars make expeditions matter beyond a single run.
5. **Unique every time** — loot and spellcraft produce distinct kits (creation-rolled instances); play-your-way within class/subclass frames.

## Spiritual cousins

| Game | Steal | Avoid |
|------|-------|-------|
| Slay the Spire | Turn-as-puzzle; branching path risk/reward | Pure single-hero deckbuilder with no settlement stake |
| Path of Exile | Unique combinations; craft/tweak; play-your-way | Encyclopedia complexity as onboarding |
| Gordian Quest / Darkest Dungeon | Party investment; subclasses; roster attachment; permadeath tension | Opaque punishment without readable intents |

## Product frame

- **Not commercial.** Host for yourself and friends.
- **Solo first**, but every system should stay safe for later **async own-Havens + co-op party PvE** (no PvP).
- **Design before tech.** Stack is now locked in [../product/tech-decision.md](../product/tech-decision.md); implementation follows the bible.

## Sacred keep vs open rewrite

| Keep | Open |
|------|------|
| Solar Concord; Umbra's shattering; Solas's extinction; Gloom-darkened world | Currencies, class list, act names, combat model details |
| Friends-hosted horizon | Greenfield `sim` / `server` / `client` (archived prototype is not authority) |

## Non-goals

See [../product/horizon.md](../product/horizon.md).
