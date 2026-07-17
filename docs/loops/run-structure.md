# Run Structure

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [core-loop.md](core-loop.md), [../systems/map-and-nodes.md](../systems/map-and-nodes.md), [failure-and-torches.md](failure-and-torches.md)

## Goal

Expeditions last long enough that gear/spell combos feel earned — never a five-minute tease. Structure supports a **growing procedural world** (waypoints unlock new segments) without forcing a story climax onto the walk home, and without coupling map growth to town pillar HP.

## Length targets

| Metric | Target |
|--------|--------|
| Session length | ~40–90 minutes for a serious push |
| Structure | One frontier segment per push: **Approach → Delve → Return** |
| Party | 2–3 heroes for the whole expedition (replacements only via in-run recruits if designed) |

Exact node counts per leg are tunable; see map-and-nodes.

## Design law: legs, not three story acts

Expeditions are **three legs of one outing**, not three narrative acts that each need a climax.

| Leg | Fantasy | Tension role |
|-----|---------|--------------|
| **Approach** | Travel to the chosen frontier segment | Rising pressure; gate fights / elites OK; **not** the expedition climax |
| **Delve** | Explore the segment | Meat of the run; **Segment Boss** = true climax |
| **Return** | Get spoils (and survivors) home | Survival / exhaustion pressure — **no second story boss** |

### Why this (climax vs return)

Nightfall’s peak is **claiming ground**: the Delve boss is a territorial fight. Victory **opens a Waypoint** on the world map (map growth — not a free town pillar). Return is logistics under Gloom pressure with a **short graph** after the boss — retreat tension, not a second setpiece climax.

Optional Return threats (ambush elites, Gloom weather, resource checks) are fine.

## Expedition flow (locked shape)

1. **Embark** from Haven — pick party, supplies, and the available **Gate** (fresh Haven: **one** path out). See [map-and-nodes.md](../systems/map-and-nodes.md).
2. **Approach** — branching path toward the segment; rest/craft/event breathing room.
3. **Delve** — explore the segment; boss at end.
4. **Segment Boss clear** — claim **Waypoint** (world expands); open waypoint **chest**; option to begin Return. (Optional greed-chain into a deeper segment is **nice later** — longer Return if pursued.)
5. **Act-end Ember choice** — spend an Ember Shard to restore a town pillar immediately, or keep it for craft / later (risk if wiped).
6. **Return** — short graph home (~2–4 depths); surviving Return moves chested goods + carried spoils to Haven; roster XP/scars applied.

## Hybrid bank (waypoint chest)

- After the Delve boss, the party may deposit a **limited** set of items into a **waypoint chest**.
- Chested goods are **safe from wipe** (survive if the party dies later on Return or a later push).
- Chested goods stay **locked at that waypoint** until a successful Return (or a later expedition reclaim) brings them to Haven — not instant town stock.
- Carried (non-chested) goods and kept Ember Shards are **lost on wipe**.

Scroll extract follows the same chest rules; Haven knowledge unlocks when goods reach town. See [../systems/spellcraft.md](../systems/spellcraft.md).

## No soft abandon

- There is **no** “quit to Haven without consequence” exit mid-leg.
- Leaving the expedition / giving up = **lost to the Gloom**: wipe-class — party gone, **−1 town pillar**.
- Choosing **Return after the boss** (or finishing Approach→Delve→Return) is the legitimate way home — not abandon.

## Pathing fantasy (StS-like)

- Multiple branches per depth within a leg.
- Visible risk/reward previews where fair (elite = better loot, event = mystery).
- Strategic choice: heal vs greed, craft vs combat, safe road vs rumor.
- Gate choice at embark is the **MMO-style zone pick** (level band); pathing inside the leg is the tactical graph.

## Mid-run progression

Within one expedition, heroes should:

- Level / gain subclass offers at meaningful beats (especially Delve)
- Grow decks via loot, gear-injected cards, learned scrolls (**only from known schools** — see spellcraft / classes)
- Face inventory/deck-thinning decisions (quality over bloat)

## Death during a run

- Party wipe (or last hero down — exact rule TBD) ends the expedition.
- Apply pillar snuff + Legacy Scar rules ([failure-and-torches.md](failure-and-torches.md)).
- Surviving roster members not on the expedition are untouched.
- Unclaimed waypoints from this run are not kept.
- Waypoint **chest** contents remain at that waypoint for later reclaim if the wipe happened after deposit.

## Acceptance criteria

- [ ] A fresh player reaches a “my build is online” moment before the run naturally ends
- [ ] Path choices are readable without a wiki
- [ ] Players understand Delve boss = claim climax; Return ≠ second boss
- [ ] Soft abandon is unavailable; wipe / lost-to-Gloom is the fail path
- [ ] Claiming a waypoint visibly expands the world map
- [ ] Waypoint chest vs carried loot risk is readable before Return

## Domain-tunable / deferred

- Exact chest slot count and what item types are chest-eligible
- Must-ship UI polish for “return now” after boss (greed-chain UI can wait)
- Longer Return when greed-chaining deeper segments (nice later)
