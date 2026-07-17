# Failure, Torches, and Legacy Scars

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [core-loop.md](core-loop.md), [../systems/haven-buildings.md](../systems/haven-buildings.md), [../systems/economy.md](../systems/economy.md), [../vision/tone-and-world.md](../vision/tone-and-world.md)

## Goal

Death must hurt **Haven**, not only the run. **Town pillars** are the settlement’s hit points and defense against the Gloom. **Waypoints** grow the procedural map separately. Permanent Haven failure is real. Progress can leave **Legacy Scars** when a Haven dies.

## World frame

- Each Haven sits in a **procedurally generated world** of expandable **segments** (not a single fixed endgame map).
- There is **no required endgame** for must-ship. Future: reaching / founding a **new Haven**, or discovering **other towns that have gone dark**, along the path.
- A **ring of 10 torch pillars** surrounds the town — core defense / HP, not path capacity.
- **Waypoints** claimed by Segment Boss clears expand the world map. They do **not** automatically restore a town pillar. See [run-structure.md](run-structure.md) and [../systems/map-and-nodes.md](../systems/map-and-nodes.md).

## Two light systems (locked)

| System | What it is | How it changes |
|--------|------------|----------------|
| **Town pillars** | Haven HP / defense (ring of 10) | Start full; wipe snuffs −1; Ember Shards can restore; 0 = Haven dies |
| **Waypoints** | Map claims / path growth | Delve Segment Boss clear claims one; expands world; separate from pillars |

Do not conflate them in UI or rules copy.

## Town pillar fantasy (locked)

1. A fresh Haven starts with **all 10 pillars lit** (full defense).
2. **Every party wipe** (or equivalent “lost to the Gloom”) **snuffs −1 pillar**. The party is lost; the town mourns.
3. Soft abandon mid-expedition is **not allowed** — quitting is wipe-class (see [run-structure.md](run-structure.md)).
4. At **0 lit pillars**, the town has no protection: **permanent Haven failure** (goes dark).
5. **Relight** a snuffed pillar by spending an **Ember Shard** (`embershard`) — at **act/segment end** (remote rite restoring a pillar in town immediately) or later at Haven. See economy.
6. Lit pillars also **keep the Gloom at bay** — see [../systems/gloom-and-stress.md](../systems/gloom-and-stress.md).

### Ember Shards (risk / reward)

| Rule | Decision |
|------|----------|
| ID / display | `embershard` / **Ember Shard** (not Emberglass) |
| Dual use | Restore a town pillar **or** premium craft / powerful upgrade fuel |
| Intro gift | On first leave-town mission, a settler gives **2 Ember Shards** (town intro beat) |
| Act-end spend | Spend one to restore a pillar **immediately** (remote rite) |
| Keep on person | If not spent / banked home, **lost on wipe** |
| Waypoint chest | May be deposited in the waypoint chest (safe from wipe; still locked at waypoint until Return / reclaim) — see [map-and-nodes.md](../systems/map-and-nodes.md) |

Emberglass remains general craft fuel; Ember Shards are the scarce light/craft premium item. See [../systems/economy.md](../systems/economy.md).

### Locked parameters

| Rule | Decision |
|------|----------|
| Pillar ring size | **10** (max lit = full HP) |
| Fresh Haven start | **10 / 10 lit** |
| Wipe / lost to Gloom | **−1** pillar (floor at 0); party lost |
| Haven death | **0** lit pillars → permanent failure |
| Waypoint claim | Expands map; **does not** +1 pillar |
| Relight | **1 Ember Shard** → +1 pillar (cap 10) |
| Band completion | Soft memorial-like **record** only — not a fail streak |
| Endgame | None required; dark towns / new Haven = future hooks |
| World | Procedural segments; expands via waypoints |

### Design intent

Wipes bleed the town’s defenses. Embers create a greed choice: mend the ring now, craft power, or risk carrying shards home. Claiming waypoints grows the frontier without automatically healing the town. Band clears are remembered like memorials — a record of how far you’ve pushed, not a streak clock.

## Permanent Haven failure

When pillars reach **0** (town goes dark):

1. Town name, buildings, and current pillar / waypoint campaign state are gone.
2. Roster of living heroes is lost.
3. **Legacy Scars** persist on the account for the next Haven.

**Future:** players may find other settlements that once lived and have gone dark — exploration / content hook, not must-ship.

## Soft records (not fail clocks)

Haven (and account-facing memorial UI) may track:

- **Bands / segments completed** — a quiet record of progress (like Memorial), not a core fail mechanic.
- Fallen heroes and fallen Havens (Memorial / Scars).

There is **no** “N consecutive deaths without a Band-1 claim → Haven dies” rule.

## Legacy Scars

Scars are account-level remnants — memories of towns that fell.

### What may persist (proposed)

| Scar type | Example |
|-----------|---------|
| Knowledge | A class/subclass unlock already earned |
| Craft memory | One learned scroll recipe tag |
| Memorial | Name of a fallen hero or fallen Haven (flavor; optional buffs later) |
| Soft starting resource | Small cache toward first building |
| Path memory | Future: faint map knowledge of the procedural world |

### What does **not** persist

- Building levels and layout
- Stockpiled expedition resources beyond scar grants
- A free skip of Chapter 1 struggle
- Full pillar ring or Ember Shard stockpile (except scar grants)

## Player modes (optional later)

Must-ship can be **iron Haven** only. Nice later: a casual mode where Haven cannot permanently die. Track in horizon if added.

## Acceptance criteria

- [ ] Haven UI shows the ring of 10 and current lit count as town HP / defense
- [ ] Wipe UI shows −1 pillar and memorial / mourning beat
- [ ] Waypoint / Segment Boss victory expands the map without implying a free pillar
- [ ] Ember Shard spend at act end clearly restores a pillar vs keep-for-craft risk
- [ ] Intro settler gift of 2 Ember Shards is taught on first leave
- [ ] New Haven after failure grants at least one meaningful Scar

## Domain-tunable / deferred

- Exact Ember Shard drop rates and craft power when spent as fuel
- Must-ship scope of “travel to new location” / dark-town discovery when the frontier is deep
- Waypoint chest slot count (see map-and-nodes)

See [../product/open-questions.md](../product/open-questions.md) for any remaining parking-lot items.
