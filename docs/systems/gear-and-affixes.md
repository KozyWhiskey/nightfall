# Gear and Affixes

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [cards-and-decks.md](cards-and-decks.md), [spellcraft.md](spellcraft.md), [economy.md](economy.md)

## Goal

PoE- / Diablo-flavored uniqueness: every drop can reshape how a hero plays — via stats, resistances, attack modifiers, **and cards injected into the deck**. Item instances are **creation-rolled** so two “same” base items are rarely identical (see [cards-and-decks.md](cards-and-decks.md) instance rolls).

Enemies **carry their pre-rolled drops into combat** (see [combat.md](combat.md) initiative). Beating a monster that holds a legendary should feel earned because that item helped make the fight harder.

## Player-facing rules

### Carried drops (encounter generation)

1. On encounter spawn, roll loot for eligible enemies **up front** (seeded `loot` stream).
2. Bind that item instance to the enemy as **carried gear**.
3. Applicable combat affixes (including initiative/speed) apply while they live.
4. On death, the carried instance is the drop — no re-roll that could downgrade what you fought for.

Elite/boss tables bias higher rarity so “scary timeline + big loot” line up.

### Slots (proposed)

Weapon, offhand, armor, helmet, boots, accessory — same skeleton as the archived prototype unless content demands change.

### What gear can do

1. **Stat enhancement** — STR/DEX/INT/VIT and derived pools.
2. **Resistances / mitigation** — Gloom resist, etc.
3. **Attack / spell modifiers** — e.g. strikes apply Fracture; spells echo.
4. **Action cards** — equipping grants ability/attack cards (Dodge boots, Block shield).
5. **Spell grants** — rare gear teaches or sockets a spell card into the deck.

### Rarity and budgets

Keep a **budget/rarity** mental model (common → magic → rare → legendary): higher rarity spends more affix budget. Exact numbers TBD during balance.

### Creation rolls (locked shape)

When an item instance is created (loot, shop, craft result, starter gear):

1. Roll affinity / magnitude bands on a seeded stream (same philosophy as spell instance rolls).
2. Bind the result to a stable instance ID — display name may match another item; numbers/mods should differ.
3. **Ember Shard** may fuel premium upgrades (see [economy.md](economy.md)); Emberglass covers ordinary reroll/fuse.

Fairness for hero kits (offsetting strong rolls) lives in cards-and-decks; gear drops stay greedy but table-weighted.

### Crafting gear

Haven **Forge** and in-run craft nodes can:

- Reroll / combine / disenchant (names TBD with economy)
- Push power at the cost of curses (align with spellcraft risk philosophy)
- Spend Ember Shard for powerful upgrade paths (scarce fork vs pillar restore)

## Affix types

| Type | Meaning |
|------|---------|
| Magnitude | Rolled numbers (stats, power) |
| Characteristic | Behavioral mods / card injections / on-hit rules |

Characteristics that inject cards must list the card ID they add.

## Equip / trade rules (locked)

- **Outside combat only:** equip, unequip, and **trade gear between party members** freely between nodes (map, rest, reward, Haven, etc.).
- **During combat:** loadout is locked; no swaps, no trades.
- Unequip removes that item’s injected cards from the hero’s deck before the next fight begins.

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
