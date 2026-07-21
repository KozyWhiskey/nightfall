# Embark and Loadout

**Status:** Accepted vertical-slice system
**Last updated:** 2026-07-19
**Related:** [Gear and Affixes](gear-and-affixes.md), [Cards and Decks](cards-and-decks.md), [Vertical-Slice Rewards](../content/expeditions/vertical-slice-rewards.md), [Post-Return Flow](../ux/post-return-flow.md)

## Goal

Leaving Haven should feel like committing people and valued possessions to a dangerous frontier, without requiring a bag grid, weight system, or storage-management game. Equipment makes a hero's build legible; expedition holdings create voluntary risk and flexible discovery.

## Hero equipment sheet

Each hero has nine persistent equipment slots.

| Group | Slots | Vertical-slice role |
|---|---|---|
| Weapons | Main Hand, Offhand | The main source of injected attack, spell, defense, and utility cards. |
| Armor | Head, Body, Gloves, Legs, Feet | Mostly attributes, protection, initiative, resource capacity, and small conditional effects in the first slice. |
| Relics | Relic I, Relic II | Catchall magical items: jewelry, charms, lenses, fetishes, icons, and bound curios. They often provide unusual build direction. |

An empty slot is valid. The first item pool focuses on weapons, offhands, body pieces, and a small number of relics; the remaining armor slots are present and ready for later content. `Relic` is an equipment category, not a rarity tier: quality tiers are Salvaged, Imbued, Rare, and Legendary.

## Eligibility and deck derivation

- A hero may equip any **universal** item in its valid slot.
- A school-specific item requires the hero to know its required school. The UI explains an ineligible item rather than hiding it.
- Equipped items apply their stats immediately and inject their listed cards into that hero's deck. Unequipping removes those injected cards before the next combat.
- An Aether Weaver may use universal physical weapons and spend Stamina. A Vanguard may use universal Mana relics or compatible school-specific gear. This permits cross-build discovery without erasing class identity.

## Expedition holdings and loss

There is no general carry limit in the vertical slice. At embark, the player may commit any eligible Haven gear, physical scrolls, and supplies to the expedition holdings.

- Only equipped items affect the party immediately.
- Held items offer future flexibility but are consciously at risk.
- On a wipe, every equipped or held item, supply, material, currency, and Ember Shard is lost unless it was sealed in the waypoint chest.
- On successful Return, all surviving held items enter shared Haven holdings. Permanent learned-scroll cards stay with their surviving hero under the existing persistence rule.

## Valid preparation moments

Equipment may be equipped, unequipped, or traded between the party only at:

1. Haven before embark.
2. A post-combat reward screen, after its offer is chosen.
3. Rest.
4. Safe Craft.
5. The waypoint chest / post-boss reward.

There are no swaps during combat, ordinary map movement, or Event resolution. A newly equipped item changes the derived deck only for the next combat; it never alters a hand or deck mid-fight.

At a valid preparation moment, a compatible hero may learn a held physical scroll. Learning consumes the item and adds the card to that hero's run deck immediately. Every eligible learned scroll becomes a permanent personal card only if that hero survives successful Return.

## Supplies

Supplies require no equipment slot and have no separate prepared-belt cap. They remain visible from expedition holdings as combat buttons under the established rules: one party supply use per combat, 1 AP, no Mana/Stamina cost, then consumed.

## Embark screen contract

The embark screen is a short risk review, not a grid inventory.

| Section | Must show |
|---|---|
| Party | Vanguard and Aether Weaver, current injuries, current permanent attributes, and nine-slot equipment sheets. |
| Deck preview | Class cards, learned cards, and every equipped-item card with its source. |
| Starting state | HP, Mana, Stamina, initiative, lit pillars, Haven Gloom, and projected starting Run Gloom. |
| Committed at risk | Counts and expandable list of physical scrolls, spare gear, supplies, Ember Shards, materials, and currencies entering the run. |
| Confirmation | A plain warning that unsealed expedition holdings are lost on a wipe. |

## Minimal state contract

Each hero stores an item ID or empty value for `mainHand`, `offHand`, `head`, `body`, `gloves`, `legs`, `feet`, `relic1`, and `relic2`. The simulation derives stats and deck cards from that equipment plus class and learned-card sources. Expedition holdings and waypoint chest contents use the common item-state lifecycle: `haven`, `equipped`, `held`, `sealed`, `consumed`, or `lost`.

## Non-goals

- Bag grids, weight, stacks, durability, sorting puzzles, or storage limits.
- Mid-combat equipment swaps.
- A mandatory supply belt or consumable-slot puzzle.
- Filling every visible slot with starter gear.
