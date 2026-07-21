# Vertical-Slice Rewards and Protection Rules

**Status:** Accepted content contract  
**Last updated:** 2026-07-18  
**Related:** [The Unlit Road](the-unlit-road.md), [Vertical-Slice Tuning](vertical-slice-tuning.md), [Gear and Affixes](../../systems/gear-and-affixes.md), [Run Structure](../../loops/run-structure.md), [Economy](../../systems/economy.md)

## Design law: discovered, then chosen

Rewards should create authored player direction. Random generation determines the available opportunity; it must not routinely dictate a single unavoidable fate. A player may decline a powerful item, choose between competing futures, or take a lesser immediate answer because it supports the party they are trying to build.

Every valuable-reward UI therefore shows at least two fully identified alternatives before a decision. This includes base, rarity, affixes, curse, school, resource cost, and injected-card/deck impact. A marked carrier is the sole exception: it drops the actual pre-rolled item that visibly made the enemy more dangerous; the item is identified at loot resolution, then the player still chooses how to equip, carry, craft, chest, or leave it.

## Vertical-slice possession rule

**Preparation rule:** equipping, party trade, learning a held scroll, and crafting use only the valid preparation moments in [Embark and Loadout](../../systems/embark-and-loadout.md): Haven, post-combat reward, Rest, Safe Craft, and waypoint/post-boss reward.

There is **no expedition carry-capacity system in the vertical slice**. A party may take any eligible gear or scrolls from Haven, then retain all gear, scrolls, materials, and currencies it finds during the run. The implementation needs only a basic expedition-holdings list, not a weight, grid, bag-slot, or capacity UI.

This is still a meaningful risk decision: every item brought from Haven and every item found during the expedition is at risk with the party. On a full-party wipe, all non-chested gear, physical scrolls, materials, currencies, and Ember Shards are lost. Before embark, the UI must clearly show the Haven-owned items being committed to that expedition.

Equipping, trading between expedition heroes, learning a scroll, and crafting remain available outside combat under their existing rules. Voluntarily leaving or destroying a valuable item is not required by a capacity rule in this slice.

## Waypoint chest

The first waypoint chest has **three sealed slots**.

- A sealed slot stores one gear item or one unlearned scroll.
- A stack of Ember Shards may occupy one sealed slot.
- Ordinary currencies and materials cannot be chested in the first slice; they remain vulnerable on Return.
- Chested gear cannot be equipped during Return; chested scrolls cannot be learned or used in a Return craft.
- Chest contents survive a wipe but remain locked at that waypoint until a successful Return or later reclaim expedition.

## Standard combat rewards

Every standard combat awards:

1. A small automatic material bundle: Salvage, a little Emberglass, **1 Timber, and 1 Stone**.
2. One **valuable reward choice** from two revealed alternatives: an eligible gear vessel and/or unlearned scroll.
3. The exact carried item if the encounter had a marked carrier. This is additional to the normal reward choice.

No standard combat rolls hidden enemy-stat scaling. Encounter-specific reward focus changes the two shown offers and material bundle, not the enemy’s strength.

## The Unlit Road offer table

| Slot | Valuable offer | Additional material identity |
|---|---|---|
| Combat 1 — Roadside Trail | One basic gear offer and one basic scroll offer | Small baseline bundle |
| Combat 2 — Lost Mile | Two scroll-weighted offers | Baseline bundle |
| Combat 3 — Whisperwood Threshold | One gear-weighted and one scroll-weighted offer | Baseline bundle |
| Combat 4 — Rootbound Remains | Two gear-weighted offers | Baseline bundle |
| Combat 5 — Houndpack in the Fog | Two scroll-weighted offers | Baseline bundle + 1 Emberglass |
| Combat 6 — The Stalking Choir | One Imbued-or-better gear offer and one strong scroll offer | Large bundle + 1 Emberglass |
| Combat 7 — Lantern Approach | One gear offer and one scroll offer | Boss-prep bundle |

`Gear-weighted` and `scroll-weighted` affect the composition of the revealed alternatives. They do not remove player choice or impose a hidden power adjustment.

## Node reward rules

| Node | Contract |
|---|---|
| Rest | Reduces a base 12 Run Gloom by its disclosed effective amount, then offers one recovery choice: Tend Wounds (heal one hero for 40% max HP), Resupply (fully restore both heroes' Mana and Stamina), or Keep Watch (remove Strain or one temporary expedition injury from one hero and give both heroes 3 Block at their next combat's start). |
| Event | No generic bundle. Each option grants a distinct safety, material/object, temporary-expedition, or future-Haven result with its risk disclosed. |
| Safe Craft | No free loot. Converts carried inputs into deliberate build power. |
| Boss | Ember Vault blueprint, ruined-settlement trace, one Ember Shard, and a choice of **one of three** revealed Rare-or-better procedural items. The three offers should point toward different futures: defense, spell/build direction, and risky high-upside play. |
| Waypoint chest | Protection only; no bonus item. |
| Return Combat | `return_roadwardens`: lean material bundle plus a choice between a gear and scroll offer. |
| Return Event | `returning_echo`: an authored remembered consequence with a small reward, Gloom relief, or a final complication. |

## Expected run outcome

A typical successful expedition returns with roughly three to five meaningful gear/scroll decisions, one boss-grade direction choice, enough Timber/Stone/Wick for one core building, and possibly protected value in the waypoint chest. A combat-heavy route earns more opportunities and exposes more Haven and expedition value to wipe risk, without being restricted by a bag-cap system.

## Resource consumables

The vertical-slice data model supports in-combat consumables, but they are uncommon **single-use expedition supplies**, not routine drops or reusable gear. They create a high-pressure choice: spend an item to solve this combat, or preserve it for the boss. An unused supply is a carried item and is lost on a wipe unless later protected by a future system.

Supplies are visible buttons outside the deck, like Basic Attack and Basic Block, so a three-card hand never prevents use. Using one costs 1 AP, costs no Mana or Stamina, and consumes that item. The party may use **one total supply per combat**. This limit prevents a large carried stack from becoming an emergency full-resource reset.

| Item | Effect |
|---|---|
| Mana Phial | Restore 4 Mana to one hero. |
| Stamina Draught | Restore 4 Stamina to one hero. |
| Ash Tonic | Restore 2 Mana and 2 Stamina to one hero; deal 1 direct damage to that hero. |

They provide a tactical recovery outlet without replacing Rest's expedition-scale Resupply choice.

### Supply sources

| Source | First-slice rule |
|---|---|
| Standard combat | An occasional identified **Emergency Cache** may appear as one of the two valuable reward offers, competing directly with a gear vessel or scroll. |
| Event | A specific safe or risky choice may award a named supply; its source and risk are disclosed. |
| Lantern Approach | Combat 7's boss-prep reward uses the 50% Emergency Cache chance in the tuning table. |
| Craft / Haven medicine | Deferred. Supplies are not initially craftable; later Cinder Forge or Quiet House content may add deliberate production. |

The initial content target is one to two supply opportunities in a typical full expedition. Exact offer weights are in [Vertical-Slice Tuning](vertical-slice-tuning.md).
