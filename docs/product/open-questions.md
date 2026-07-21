# Open Questions

**Scope note:** This is a historical decision log for both the vertical slice and longer-term game. When an entry conflicts with [Current Product Scope](current-scope.md), the current-scope document wins. In particular, co-op, three-class/subclass launch scope, Shops, and Elites are deferred.

**Status:** Historical decision log; not implementation authority.
**Last updated:** 2026-07-19

**Use instead:** [Decision Register](decision-register.md), [Current Product Scope](current-scope.md), and owning accepted specifications. This file retains prior rationale only.

Parking lot for decisions that do not block scaffolding. Resolve while writing/ refining spine specs; move answers into the owning doc and strike or archive here.

**Walkthrough status:** Expedition / schools / zones + failure/banking/cards/roster pass resolved (2026-07-17).

## Failure / torches

- [x] Exact torch count per Haven / per campaign arc — **10-pillar ring = town HP; starts 10/10; waypoints separate. See [failure-and-torches.md](../loops/failure-and-torches.md).**
- [x] How fast can a Haven die vs recover — **Wipe −1 pillar; Ember Shard restores +1; 0 pillars = Haven death; no Band-1 wipe streak. See [failure-and-torches.md](../loops/failure-and-torches.md).**
- [x] Boss clears vs fragility — **Waypoints grow the map only; pillars mend via Ember Shards (or stay snuffed). All light is fragile.**
- [x] Starting lit count on a brand-new Haven — **10/10 lit; intro settler gift of 2 Ember Shards on first leave.**
- [x] Band-1 streak reset — **Dropped.** Band/segment completion is a soft memorial-like record only — not a fail streak.

## Expedition / world

- [x] Three story acts vs travel structure — **Legs: Approach → Delve → Return; Delve boss = climax + waypoint; Return has no story boss.** See [run-structure.md](../loops/run-structure.md).
- [x] World growth — **Procedural segments; waypoint claims expand the map; Gates are level bands.** See [map-and-nodes.md](../systems/map-and-nodes.md).
- [x] Power vs content — **Zoned Gates (MMO-like), not primary soft-scaling.** See [progression.md](../systems/progression.md).
- [x] Return length after waypoint claim — **Hybrid: short Return graph (~2–4); waypoint chest safeguards limited goods (locked at waypoint until Return/reclaim).**
- [x] How many Gates start unlocked on a fresh Haven — **One path out; more require work/unlocks.**
- [x] Abandon mid-leg without snuff? — **No.** Soft abandon = lost to the Gloom (wipe-class: party gone, −1 pillar).

## Combat / cards

**Superseded entries below:** Build 1 uses a three-card hand and four-card starting deck; equipment changes use only the preparation moments in [Embark and Loadout](../systems/embark-and-loadout.md). Historical entries remain for rationale, not rules.

- [x] Hand size and deck size — **hand 4 / start 8 / mid-run ~20.** See [cards-and-decks.md](../systems/cards-and-decks.md).
- [x] Default AP / resources — **flat 3 AP all classes; Stamina vs Mana by class; Basics = 1 AP only.** See [combat.md](../systems/combat.md).
- [x] Initiative formula — **same for all: `(DEX×2) + itemInitiative + seeded 1..4`; enemies carry pre-rolled drops that can affect the fight.** See [combat.md](../systems/combat.md).
- [x] Gear unequip mid-run — **anytime outside combat; enables party trading; locked in fight.** See [gear-and-affixes.md](../systems/gear-and-affixes.md).
- [x] Exhaust vs discard defaults — **Discard by default; Exhaust only when card/effect says so.**
- [x] Duplicate card names with different mods? — **Yes (same name OK); instances are creation-rolled (Diablo-like); fairness offsets strong multi-rolls.** See [cards-and-decks.md](../systems/cards-and-decks.md).

## Craft / schools

- [x] Scroll knowledge / value — **scrolls always useful (trade/craft/upgrade); extract via chest + Return/reclaim; extracted stock = Haven knowledge.** See [spellcraft.md](../systems/spellcraft.md).
- [x] Risk tiers — **Safe / Risky / Dire feel locked; numeric odds are tunable domain values** (`tierId`, matchers, chances). See [spellcraft.md](../systems/spellcraft.md#tunable-domain-values-crafting).
- [x] Curse cleanse — **soft yes (Haven sink); hard forever.** Domain-tagged. See [spellcraft.md](../systems/spellcraft.md).
- [x] Class schools — **start with 2; subclass opens 3rd; learn only known schools; cross-school reactions as craft groundwork.** See [spellcraft.md](../systems/spellcraft.md), [classes/](../content/classes/).
- [x] Extract: bank at waypoint vs require Return trek — **Chest at waypoint (safe from wipe); Haven knowledge/stock on Return or later reclaim.**
- [x] Aether Weaver must-ship third schools (Tide vs Storm teaching) — **Keep Umbra + Tide; Storm stretch / party teaching.** See [aether-weaver.md](../content/classes/aether-weaver.md).

## Haven

- [x] Buildings in v1 web — **6** (Pillarhouse, Cinder Forge, Ember Vault, The Quiet House, The Wardyard, The Wayfarer); Stockhouse, Cartographer’s Table, and Names Wall later. See [haven-buildings.md](../systems/haven-buildings.md).
- [x] Starting buildings — **Pillarhouse only.** See [haven-buildings.md](../systems/haven-buildings.md).
- [x] Resource types — **Run: Salvage / Emberglass / Rations (+ Ember Shard item); Haven: Timber / Stone / Wick.** Mature-dark presentation; IDs stable if renamed later. See [economy.md](../systems/economy.md).


## Roster

- [x] Max roster size — **8.** See [party-and-roster.md](../systems/party-and-roster.md).
- [x] Dead heroes — **Memorial (plaque/shrine); optional buffs later, not v1-required.** See [party-and-roster.md](../systems/party-and-roster.md).
- [x] Stress — **Run Gloom** plus persistent **Haven Gloom**; visible travel/event pressure, deterministic Gloom-touched combat bands, and light Strain. Pillars set the Haven-Gloom floor. Not full DD afflictions. See [gloom-and-stress.md](../systems/gloom-and-stress.md).
- [x] Can subclasses (and third school) be swapped at Haven for a cost? — **No respec.** Future: some classes may unlock an **additional** tree at a level gate.

## Multiplayer

- [x] Co-op loot — **Need/Greed draft** (Need > Greed; seeded tiebreak; then trade out of combat). See [multiplayer.md](../systems/multiplayer.md).
- [x] Host authority — **authoritative host on N100/LAN** (best practice / desync avoidance, not anti-cheat). See [multiplayer.md](../systems/multiplayer.md).
- [x] Async v1 — **list + peek** (read-only summary). Visit/gifts later. See [multiplayer.md](../systems/multiplayer.md).
- [x] Ally hands — **fully visible to party** for co-op puzzles. See [multiplayer.md](../systems/multiplayer.md).
- [x] Empty slots — **no AI**; humans may **control multiple heroes** via lobby ownership. See [multiplayer.md](../systems/multiplayer.md).

## Content

- [x] First 3 classes — **Vanguard, Aether Weaver, Shadowblade** (names kept). See [content/classes/](../content/classes/).
- [x] Region names — **seeded pools per level band** (all listed options kept; rolls feel like new areas). See [content/regions/README.md](../content/regions/README.md).
