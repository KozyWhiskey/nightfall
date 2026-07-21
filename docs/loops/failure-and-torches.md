# Failure, Pillars, and Haven Succession

**Status:** Accepted Build 1 failure contract
**Last updated:** 2026-07-19
**Related:** [Expedition State Machine](../systems/expedition-state-machine.md), [Gloom, Light, and Rest](../systems/gloom-and-stress.md), [First Haven Progression](../content/haven/first-haven-progression.md), [Future Compatibility Ledger](../product/future-compatibility-ledger.md)

## Purpose

Failure should be frightening without turning one lost settlement into a discarded campaign. A Haven is fragile, its people and material achievements can be lost, but exploration leaves a path for those who escape. The pillar ring measures the Haven's survival; waypoints measure the world's remembered routes. They are deliberately separate systems.

| System | Meaning | Build 1 change rule |
|---|---|---|
| Haven pillars | The Haven's defense against Gloom; its health | Ten maximum; a wipe snuffs one; an Ember Shard relights one; zero causes Haven failure. |
| Waypoints | Permanently discovered places and map growth | A boss victory claims one; a claim never automatically repairs a pillar. |

## Pillar rules

- A newly founded first Haven begins with 10 lit pillars out of 10.
- A full-party wipe or explicit in-world abandonment snuffs one currently lit pillar, to a minimum of zero.
- A carried Ember Shard may be spent at a waypoint's remote rite, or from the Pillarhouse after Return, to relight one snuffed pillar, to a maximum of ten.
- A remote rite is permanent at the moment it is spent. The party may still wipe afterwards, but the repair remains.
- The tenth pillar is not a ten-wipe campaign clock. It is a recoverable health pool: repair, careful play, and hard choices determine when a Haven falls.

## Haven failure

When a wipe snuffs the final pillar, the Haven goes dark. The current expedition has already been lost under normal wipe rules; Haven failure adds a settlement transition after that resolution. It is not a conventional game-over screen and it never restores the lost party.

### New-Haven procedure

1. Record the fallen Haven, its final pillar loss, and the expedition party in the permanent memorial.
2. Select the furthest permanently claimed waypoint as the new Haven's founding location. If no waypoint was ever claimed, found at the **Cinder Refuge**, a minimal escape site outside the fallen Haven; it exists only as a fallback, not a new region or route.
3. Create a new Haven instance with a new stable ID, 10-pillar capacity, **3 lit pillars, and 7 snuffed pillars**. Its initial Haven Gloom is therefore 7 and its next expedition begins at 28 Run Gloom. The pressure is deliberate recovery difficulty, not an unbuilt-pillar state.
4. Create a small emergency cache: **3 Timber, 3 Stone, 0 Wick, and 0 Ember Shards**. This supports recovery without paying for a core building.
5. Carry forward only the approved legacy package below. All other material state stays with the fallen Haven.
6. Present an evacuation chronicle and return the player to the new Haven Hub. The next expedition starts from its founding location under ordinary Embark rules.

## Legacy package

The campaign retains knowledge and paths, not the fallen settlement's power.

| Persists | Does not persist |
|---|---|
| Claimed waypoints and their settlement traces | Buildings, building levels, and building damage |
| Blueprint knowledge and permanently unlocked class, school, item, and affix families | Timber, Stone, Wick, Emberglass, Salvage, Rations, currency, and Ember Shards beyond the emergency cache |
| World-discovery and event-history flags that describe the frontier | Haven inventory: gear, supplies, physical scrolls, and waypoint-chest contents |
| Fallen-Haven and fallen-hero memorial records | Heroes, personal decks, Leadership attributes, injuries, and temporary expedition state |
| The new Haven's location and 3/10 pillar state | A free reconstruction, automatic pillar repair, or a skip of the Band-1 recovery struggle |

Chest contents do not transfer into a successor Haven. They remain associated with their original, fallen-Haven waypoint record for future recovery design, but Build 1 exposes no reclaim expedition after Haven failure. They are therefore retained as durable data, not usable Build 1 stock.

## Implementation ownership

- `campaignWorld` owns permanent waypoint/discovery/blueprint facts and memorials.
- `haven` owns a specific settlement's pillars, buildings, resources, holdings, survivors, and Gloom.
- A failure creates a new `haven` record; it must not mutate the old one into a replacement.
- Every permanent and lost asset must carry a stable location/owner ID so terminal resolution can be replayed without duplication.
- The succession transaction is a terminal extension of the wipe transaction in the [Expedition State Machine](../systems/expedition-state-machine.md). It is idempotent: reload cannot create two successor Havens or duplicate the emergency cache.

## Future compatibility, not Build 1

- Selecting from several evacuation destinations, transporting specific townsfolk, and carrying survivor-linked scars.
- Reclaim expeditions into a fallen Haven's locked waypoint chest.
- Casual/non-permadeath modes, legacy bonuses, and alternate pillar-ring sizes.

## Acceptance criteria

- [ ] A final-pillar wipe loses the committed party and settlement materials, creates exactly one successor Haven, and never deletes campaign world facts.
- [ ] A Haven that falls after at least one boss clear is founded at its furthest claimed waypoint with three lit pillars.
- [ ] A Haven that falls before any boss clear uses Cinder Refuge and remains playable.
- [ ] Blueprints and discovered content families remain unlocked, while stored gear, scrolls, buildings, and hero growth do not.
