# Map and Nodes

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [../loops/run-structure.md](../loops/run-structure.md), [events.md](events.md), [progression.md](progression.md), [../loops/failure-and-torches.md](../loops/failure-and-torches.md), [../content/regions/README.md](../content/regions/README.md)

## Goal

StS-like strategic pathing on **expedition legs**, inside a **procedural world that expands via waypoints**. Content difficulty is primarily **zoned by level band** (MMO-style gates), not endless soft scaling of the same path. Town **pillars** (Haven HP) are separate — see failure-and-torches.

## World frame

- The world is built from **segments** (frontier chunks) generated around the Haven and claimed waypoints.
- Clearing a **Segment Boss** (Delve climax) **opens a Waypoint** — the map grows; new Approach edges appear from that light.
- Waypoints do **not** automatically restore town pillars.
- Segments keep generating as the frontier expands — no fixed final map for must-ship.

## Gates (level bands)

Haven (and later claimed waypoints) expose **Gates** — embark destinations tagged by **level band**.

| Idea | Rule |
|------|------|
| Fresh Haven | **One** path / Gate out of town; opening more paths requires play / buildings / work |
| Different gates → different bands | Low / Mid / High (map to region band templates) |
| Party power | Roster levels, gear from prior runs, and Haven upgrades all raise effective strength |
| Content answer | **Prefer zoned paths over pure enemy scaling** — pick a gate that matches what you want to fight |
| Mismatch | Underleveled gate = intentional hard mode; overleveled = easier farm / salvage (domain-tunable rewards) |

Players with mixed-level rosters choose the gate for **this** party — they do not auto-scale the whole world to the highest hero.

Exact band thresholds are domain data; systems only need stable band IDs (`band_1`, `band_2`, `band_3`, …).

**Soft record:** band / segment completions may be tracked like Memorial (progress flavor), not as a fail streak.

## Player-facing rules (pathing)

- Each **leg** (Approach / Delve / Return) is a **directed branching graph** with depth rows.
- **Delve** ends in a **Boss** node (segment climax + waypoint claim).
- **Approach** may end in a gate elite or threshold fight — not a story boss.
- **Return** has no required boss; short pressure graph after a claimed waypoint.
- At each step the party picks among available connected nodes.
- Reward previews where fair (elite ≈ better gear; event ≈ mystery).
- Visited / resolved nodes cannot be farmed endlessly (standard once-resolve).
- **No soft abandon** mid-leg — see [../loops/run-structure.md](../loops/run-structure.md).

## Node types (must-ship)

| Type | Purpose |
|------|---------|
| Combat | Standard fight + loot |
| Elite | Harder fight + better loot |
| Event | Branching narrative/mechanical choice |
| Rest | Heal / small prep (choices TBD) |
| Shop | Spend run resources |
| Craft | Spell/gear craft with risk UI |
| Boss | **Delve only** — segment climax; waypoint claim on victory (map growth) |
| Waypoint (hub) | Post-boss: chest deposit, Ember rite option, begin Return (greed-chain later) |
| Gate (embark) | Haven UI — choose level-banded destination (one unlocked at start) |

## Waypoint chest (hybrid bank)

| Rule | Decision |
|------|----------|
| When | After Delve boss / at waypoint hub |
| Effect | Limited deposit; chested items **survive wipe** |
| Location | Stay **locked at waypoint** until successful Return or later reclaim to Haven |
| Not chested | Lost on wipe (including carried Ember Shards) |

Slot count and eligible item types are domain-tunable.

## Parameters (proposed)

| Param | Approach | Delve | Return |
|-------|----------|-------|--------|
| Depths | ~4–5 | ~6–8 | ~2–4 (short pressure after waypoint) |
| Branches per depth | 2–3 | 2–3 | 1–2 |
| Elite weight | Medium | Higher | Low–medium (ambush feel) |
| Boss | No | Yes | No |

Region / band weight tables and **display name pools** are content data — see [../content/regions/README.md](../content/regions/README.md). Mechanics stay by **level band** + **leg**; names roll seeded so exploration feels fresh.

## Edge cases

- Dead-end paths — generator must guarantee Delve boss reachability.
- Inventory full — block travel or force discard flow.
- Co-op path choice — majority, leader, or rotating picker (MP doc; proposal: **embark leader** picks map nodes).
- Wipe before Delve boss — no waypoint claim; −1 pillar; no chest.
- Wipe after chest deposit — chest remains; carried goods / unspent shards lost.

## Acceptance criteria

- [ ] Player can articulate why they skipped an elite
- [ ] Craft and event nodes appear often enough to matter
- [ ] Delve boss is always reachable once Approach completes
- [ ] Gate pick communicates level band before embark; fresh Haven shows a single path
- [ ] Waypoint claim visibly adds a segment / edge on the world map
- [ ] Chest vs carried risk is clear at the hub

## Open questions

- Hidden / locked paths from Tavern rumors?
- Can waypoints offer Gates of lower bands for farming once multiple paths exist?
