# Haven Buildings

**Status:** Draft  
**Last updated:** 2026-07-16  
**Related:** [../loops/core-loop.md](../loops/core-loop.md), [economy.md](economy.md), [progression.md](progression.md)

## Goal

The named Haven is a **resource sink with identity**: players choose which buildings to unlock first; each building changes future expeditions.

## Player-facing rules

- Fresh account names a Haven.
- **Starting built:** **Lantern Keep only** (tier 1). All other buildings start locked — first real investment is the player’s choice.
- Expeditions return resources used to construct / upgrade buildings.
- Buildings are never all free at once — **order is a buildcraft choice**.
- When Haven permanently fails, buildings are lost; scars may remember fragments.

## Must-ship building web (v1 — locked count: 6)

Start with **6** buildings; expand the web later without rewriting the system.

| ID | Building | Primary benefit |
|----|----------|-----------------|
| `lantern_keep` | **Lantern Keep** | Torch / light related; Haven heart |
| `training_hall` | **Training Hall** | Unlock classes, subclasses, drills |
| `tavern` | **Tavern** | Rumors, map hints, passing strangers / unique one-run classes |
| `forge` | **Forge** | Gear craft, rerolls, salvage |
| `scriptorium` | **Scriptorium** | Spell study, safer fuse tiers, scroll catalogue / extracted stock, soft-curse cleanse |
| `stores` | **Stores** | Resource cap, embark supplies |

Each building: **2–3 upgrade tiers** (tunable domain data).

### Expand-later (not v1)

| Building | Primary benefit |
|----------|-----------------|
| **Wardhouse** | Permanent minor embark buffs / resists |
| Others | As content demands |

Building defs should be data-driven so new IDs can be added without architecture changes.

## Unlock order fantasy

Example divergent Havens:

- Training-first → more class variety early.
- Forge-first → stronger gear loops.
- Tavern-first → map knowledge and wild recruits.

## Acceptance criteria

- [ ] Two players can describe their Havens differently after 5 expeditions
- [ ] Every building has a benefit felt on the next embark
- [ ] Building UI shows opportunity cost (what you’re postponing)

## Unlock graph (v1 default)

- **Free pick** among remaining locked buildings (no deep prerequisite tree) once you can afford them — identity comes from *order*, not gates.
- Optional soft gates later via domain data (e.g. Tavern tier 2 needs Training Hall tier 1) without changing the system.

## Open questions

- None blocking for start state — see economy for costs.
