# Gloom Meter and Light Stress

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [../loops/failure-and-torches.md](../loops/failure-and-torches.md), [economy.md](economy.md), [events.md](events.md), [party-and-roster.md](party-and-roster.md)

## Goal

A **light** pressure system for mature tension — not a full Darkest Dungeon affliction sim. The **Gloom meter** is the lingering danger that **town pillars** hold at bay; neglect and cowardice let it creep. Higher Gloom means higher chance something bad happens.

## Player-facing fantasy

The Gloom is always at the edge of the lantern light. Your pillar ring buys safety. If you hoard Emberglass, skip the world’s calls (events), or let the town’s defenses dim, the meter rises — and the dark starts answering.

## Core rules (locked shape)

### One primary meter: Gloom

| Property | Decision |
|----------|----------|
| Scope | **Expedition / Haven pressure** (party-facing), not a heavy per-hero psychology sim for must-ship |
| UI | Always visible on map / Haven (creeping mist / meter) |
| Torches / pillars | **Lit town pillars suppress Gloom** — more lit defense = slower creep and/or lower effective Gloom |
| High Gloom | Raises chance of **bad outcomes** (ambushes, cursed finds, soft stress breaks, harsher event forks) |

### What raises Gloom (creep sources)

Domain-tunable weights; starting intent:

| Source | Intent |
|--------|--------|
| Skipping / avoiding events too often in a run | “You refused the world’s call” |
| Hoarding Emberglass (not spending on craft/rites when thresholds hit) | Greed invites the dark |
| Low lit-pillar count on the Haven ring | Town defense is weak; Gloom presses harder |
| Certain corruption event choices | Explicit bargain |
| Party wipe / snuffed pillar | Spike |

### What lowers or holds Gloom

| Source | Intent |
|--------|--------|
| Lit pillars on the ring | Keep the Gloom at bay |
| Resolving events (especially hard ones) | Engage the world |
| Spending Emberglass (craft, cleanse, rites) | Refuse to stagnate |
| Ember Shard spent to restore a pillar | Mend defense (also see failure-and-torches) |
| Wick spent on lantern rites | Pay the debt of light |
| Rest / certain building upgrades | Brief relief |

### Bad things at high Gloom (light stress)

Not a full affliction tree. At thresholds or on checks, pick from a **small** domain table, e.g.:

- Ambush pack on next travel
- Soft curse on a random held scroll/gear
- Temporary hero **Strain** (light stress): −1 effective AP next fight, or skip a card draw
- Harsher event outcome weights
- Rare: force a Dire-leaning craft instability if crafting while Gloom is critical

**Strain** (optional per-hero chip): short-lived, clearable at Rest/Haven — not multi-page affliction lore for v1.

## Tunable domain values

All thresholds and weights live in data (same philosophy as craft risk):

| Field | Purpose |
|-------|---------|
| `gloomMax` | e.g. 100 |
| `creepPerSkippedEvent` | |
| `creepPerEmberglassHoardTick` | When unspent Emberglass above threshold for N nodes |
| `suppressPerLitPillar` | How hard town pillars push back |
| `badThingTable` | Weighted outcomes by Gloom band (`low` / `mid` / `high` / `critical`) |
| `strainDuration` | Fights or nodes |

## Explicit non-goals (must-ship)

- Full virtue/affliction personality system
- Stress heal camping minigame as a second game
- Punishing opacity — players should see *why* Gloom rose

## Acceptance criteria

- [ ] Gloom meter visible and explained in one tooltip
- [ ] Player can name at least two ways they raised it and two ways they lowered it
- [ ] High Gloom visibly changes a run (bad thing fires) without feeling like pure RNG hate
- [ ] Torches / pillars clearly matter beyond Haven failure math

## Open questions

- Exact Emberglass “hoard” threshold UX (warning before creep tick?)
- Does Gloom persist between expeditions on the Haven, or reset on return with a residual?
- **Proposal:** Haven stores a **residual Gloom**; successful returns bleed it down; wipes spike it.
