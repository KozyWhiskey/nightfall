# Gear and Affixes

**Status:** Draft  
**Last updated:** 2026-08-24  
**Related:** [cards-and-decks.md](cards-and-decks.md), [spellcraft.md](spellcraft.md), [economy.md](economy.md), [local-development.md](../architecture/local-development.md#loot-and-affix-pipeline)

## Goal

PoE- / Diablo-flavored uniqueness: every drop can reshape how a hero plays — via stats, resistances, attack modifiers, **and cards injected into the deck**. Item instances are **creation-rolled** so two “same” base items are rarely identical (see [cards-and-decks.md](cards-and-decks.md) instance rolls).

Weapons use medieval/fantasy forms, but the meaningful power is the unstable magic bound into them. Items are vessels for wards, school effects, card changes, and curses—not a modern-gun or mundane-weapon power fantasy. See [../content/content-direction.md](../content/content-direction.md).

Generated-item grammar, affix budgets, and AI-content guardrails: [../content/items/procedural-forge.md](../content/items/procedural-forge.md).
First authored base/affix seed pool: [../content/items/vertical-slice-affix-pool.md](../content/items/vertical-slice-affix-pool.md).

Enemies **carry their pre-rolled drops into combat** (see [combat.md](combat.md) initiative). Beating a monster that holds a legendary should feel earned because that item helped make the fight harder.

## Player-facing rules

### Carried drops (encounter generation)

1. On encounter spawn, roll loot for eligible enemies **up front** (seeded `loot` stream).
2. Bind that item instance to the enemy as **carried gear**.
3. Applicable combat affixes (including initiative/speed) apply while they live.
4. On death, the carried instance is the drop — no re-roll that could downgrade what you fought for.

An enemy carrying an exceptional / unique item is visibly marked before and during the fight. Players can see that a valuable item is at stake, but do **not** see its exact effects until it drops. The item's applicable combat benefits still affect that enemy, so the displayed risk and eventual reward are honestly linked.

Elite/boss tables bias higher rarity so “scary timeline + big loot” line up.

### Equipment layout (locked)

Every hero has nine equipment slots, grouped into weapons, armor, and relics:

| Group | Slots | Intended identity |
|---|---|---|
| Weapons | Main Hand, Offhand | Injected attacks/spells, direct combat identity, defense and utility. |
| Armor | Head, Body, Gloves, Legs, Feet | Protection, attributes, resource capacity, initiative, and conditional defense. |
| Relics | Relic I, Relic II | Catchall magical finds: jewelry, charms, lenses, fetishes, icons, bound objects, and other build-defining curios. |

Empty slots are valid. The first slice deliberately seeds few armor categories, but the full sheet is visible from the beginning so an unfamiliar item has an obvious home. No slot has weight, durability, or a capacity minigame.

### What gear can do

1. **Stat enhancement** — STR/DEX/INT/VIT and derived pools.
2. **Resistances / mitigation** — Gloom resist, etc.
3. **Attack / spell modifiers** — e.g. strikes apply Fracture; spells echo.
4. **Action cards** — equipping grants ability/attack cards (Dodge boots, Block shield).
5. **Spell grants** — rare gear teaches or sockets a spell card into the deck.

### Rarity and budgets

Use the procedural-forge tiers **Salvaged → Imbued → Rare → Legendary**. Higher tiers spend more affix budget; a Legendary item adds a signature rule. Exact weights and pools live in content data, not game code. `Relic` is reserved for the catchall equipment-slot category, avoiding ambiguous UI such as “Relic Relic.”

### Creation rolls (locked shape)

When an item instance is created (loot, shop, craft result, starter gear):

1. Roll affinity / magnitude bands on a seeded stream (same philosophy as spell instance rolls).
2. Bind the result to a stable instance ID — display name may match another item; numbers/mods should differ.
3. **Ember Shard** may fuel premium upgrades (see [economy.md](economy.md)); Emberglass covers ordinary reroll/fuse.

Fairness for hero kits (offsetting strong rolls) lives in cards-and-decks; gear drops stay greedy but table-weighted.

### Crafting gear

The Haven **Cinder Forge** and in-run craft nodes can:

- Reroll / combine / disenchant (names TBD with economy)
- Push power at the cost of curses (align with spellcraft risk philosophy)
- Spend Ember Shard for powerful upgrade paths (scarce fork vs pillar restore)

## Affix types

| Type | Meaning |
|------|---------|
| Magnitude | Rolled numbers (stats, power) |
| Characteristic | Behavioral mods / card injections / on-hit rules |

Characteristics that inject cards must list the card ID they add.

## Build 1 implementation

Player-facing rules above; this is how the current sim actually rolls and applies gear. Full ops notes: [local-development.md](../architecture/local-development.md#loot-and-affix-pipeline).

- **Stream:** named `loot` only (`packages/sim/src/loot.ts`, `items.ts`, `expedition.ts`, `combat.ts`).
- **Budgets:** Salvaged none; Imbued one prefix (70%) or suffix; Rare prefix+suffix and 15% curse; Legendary curated signature + prefix+suffix and 25% curse. Compatibility filters reject tag mismatches, granted-card requirements, Overdrawn without a secondary cost, and stacking draw/retain modules.
- **Carried drops:** `combat.maybeCreateCarrier` uses `pack.encounters[].carrierChance` and per-enemy base lists, then freezes an Imbued instance on `location.kind === "carried_by_enemy"`. Map greed copy is a **hand-mirrored** table in the client — do not import the content pack from React.
- **Combat:** equipped `mechanicSnapshot.modifiers` and numeric deltas resolve in `combat.ts` (initiative, vessel play costs, first-use flags on `run.flags`, vessel passives). Display enrichment on the host does not replace those mechanics.
- **Fixtures:** `packages/fixtures/src/sim-loot.test.ts`, `sim-affix.test.ts`, `sim-item-display.test.ts`.

## Equip / trade rules (locked)

**Vertical-slice override:** equip, unequip, and party trade are allowed only at Haven, post-combat reward, Rest, Safe Craft, and waypoint/post-boss reward. The broader legacy wording below is superseded by [Embark and Loadout](embark-and-loadout.md). During combat, ordinary movement, and Event resolution, loadouts are locked.

- **Outside combat only:** equip, unequip, and **trade gear between party members** freely between nodes (map, rest, reward, Haven, etc.).
- **During combat:** loadout is locked; no swaps, no trades.
- Unequip removes that item’s injected cards from the hero’s deck before the next fight begins.

## Expedition inventory (locked shape)

- The vertical slice has **no carry-capacity system**. A party may commit any eligible Haven gear or scrolls to an expedition and retain all discoveries during it.
- Valuable rewards are presented as fully identified choices, so choosing a reward is a deliberate build decision rather than a blind outcome.
- All expedition-held gear, scrolls, currencies, and ordinary material resources are lost on a full-party wipe unless a rule explicitly protects them.

Full reward and chest contract: [Vertical-Slice Rewards and Protection Rules](../content/expeditions/vertical-slice-rewards.md).

## Persistence and loss (locked)

- On a successful Return, recovered gear enters shared Haven inventory. Any surviving hero may equip it before a future expedition.
- On a full-party wipe, all gear carried or equipped by that expedition party is lost with them unless it was protected in the waypoint chest.

## Edge cases

- Two gear pieces injecting the same ability — stack, overwrite, or dual copies?
- Legendary unique named items vs pure proc-gen — proposal: both, uniques sparse.
- Trading a carried-drop legendary mid-run between heroes is allowed (out of combat).

## Content hooks

- Affix pool tables by slot and region
- Name pools
- Card injection map

## Acceptance criteria

- [ ] Equipping boots with Dodge visibly adds a card to the deck UI
- [ ] Unequipping removes it fairly
- [ ] A rare item can be explained in one tooltip without a wiki

## Open questions

- Durability? **Proposal: no.**
- Set items? Nice later.
