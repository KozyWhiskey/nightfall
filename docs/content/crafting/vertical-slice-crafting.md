# Vertical-Slice Crafting Package

**Status:** Accepted initial Build 1 crafting data — playtest-tunable  
**Last updated:** 2026-07-19  
**Related:** [Spellcraft](../../systems/spellcraft.md), [Balance Reference](../../systems/balance-reference.md), [Cache: Ember Pit](../events/cache-ember-pit.md)

**Numeric authority:** Inputs and exact outcomes are defined by [Vertical-Slice Tuning](../expeditions/vertical-slice-tuning.md).

## Crafting material roles

| Material | Fantasy | Mechanical role |
|----------|---------|-----------------|
| Emberglass | Crystallized magical fallout | Standard craft fuel; stabilizes a process |
| Unlearned scroll | Recovered magical pattern | Pattern consumed by a fuse or imprint |
| Gear / learned card | Vessel or existing pattern | Thing the player is trying to reshape |
| Ember Shard | Fragment of surviving light | Premium stabilizer; competes with pillar repair |

## Safe Fuse

**Inputs:** 2 unlearned scrolls from schools the hero knows, plus Emberglass.  
**Output:** A new hybrid card. This is the first craft teaching moment: it creates something new rather than risking a favorite card. No scripted tutorial is required.

| Inputs | Result | Direction |
|--------|--------|-----------|
| Iron + Bastion | **Wardstrike** | Damage plus Block |
| Aether + Ember | **Cinder Arc** | Strong Aether damage plus Burn |
| Bastion + Ember | **Lantern Ward** | Block that Burns attackers |

| Outcome | Chance | Result |
|---------|-------:|--------|
| Desired hybrid | 75% | New card with its listed effect |
| Hybrid with soft tradeoff | 25% | New card with `Overdrawn` or comparable +1 resource cost |

Safe Fuse has no brick or hard-curse result in the first slice.

The exact Build 1 input cost is 2 Emberglass. `unstable_resin` changes the scroll requirement to one and always adds Frayed; a `safe_fuse_voucher` waives only the Emberglass cost.

## Safe Imprint

**Inputs:** 1 unlearned scroll, 1 gear item, plus Emberglass.  
**Output:** A modest school-flavored modification to the item or its injected card. No brick chance.

| Scroll + gear | Imprint | Effect |
|---------------|---------|--------|
| Ember + sword | **Cinder Edge** | The injected attack applies 1 Burn |
| Bastion + shield | **Wardplate** | The injected Block card gains +2 Block |
| Aether + rod | **Conduit Coil** | The injected spell deals +1 damage |

Safe Imprint uses the same 75% desired / 25% soft-tradeoff table as Safe Fuse.

The exact Build 1 input cost is 1 Emberglass.

## Risky Overbind

**Inputs:** 1 learned card or equipped item, 1 unlearned scroll, plus Emberglass.  
**Output:** A stronger version of a card or item the player already values. The full outcome table is shown before confirmation.

| Outcome | Chance | Result |
|---------|-------:|--------|
| Strong improvement | 55% | Meaningful upgrade, such as Aether Bolt `+3` damage or Iron Cut gaining 1 Burn |
| Improvement + soft tradeoff | 25% | Upgrade with `Overdrawn` or comparable cost increase |
| Improvement + soft curse | 15% | Upgrade with `Frayed` or another cleanseable cost |
| Catastrophic result | 5% | Improvement plus Hollow; no item deletion in Build 1. |

### Ember Shard stabilization

Spending an Ember Shard on a Risky Overbind does **not** make it Safe. It converts the Hollow result to Frayed; the player sees that protection and its remaining curse risk before confirming.

The exact Build 1 input cost is 3 Emberglass. Build 1 has no brick/item-deletion result: the 5% catastrophic result is Hollow; an Ember Shard converts only that result to Frayed.

## First curse language

| Curse | Class | Effect |
|-------|-------|--------|
| **Overdrawn** | Soft tradeoff | Costs `+1` Mana or Stamina |
| **Frayed** | Soft curse | Deal 1 damage to the caster on play |
| **Hollow** | Hard curse | The card Exhausts after use |

No random-target effects, permanent forgotten spells, or large curse trees belong in the first slice.

## First-run availability

- The first expedition guarantees ingredients for one Safe Fuse on a reachable Craft node.
- [Cache: Ember Pit](../events/cache-ember-pit.md) offers the first Risky Overbind opportunity.
- Ember Shard spending is optional and competes with the pillar/Return decision.
