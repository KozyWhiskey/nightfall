# Procedural Forge

**Status:** Locked direction; initial pools pending  
**Last updated:** 2026-07-18  
**Related:** [Gear and Affixes](../../systems/gear-and-affixes.md), [Spellcraft](../../systems/spellcraft.md), [Content Direction](../content-direction.md)

## Goal

Nightfall loot and spells should feel discovered rather than pre-authored from a small fixed list. A persistent instance is generated from a deterministic, extensible grammar:

```text
base vessel or spell pattern
+ seeded rarity budget
+ weighted prefix(es)
+ weighted suffix(es)
+ optional mutation / curse
+ generated name and lore
= persistent item or spell instance
```

Example:

```text
Hound-Tooth Sword
+ Cinderbound        (attacks apply Burn)
+ of the Last Watch  (gain Block after protecting an ally)
+ Frayed             (self-damage on use)
= Cinderbound Hound-Tooth Sword of the Last Watch
```

The same law applies to spells:

```text
Aether Bolt
+ Forked              (reaches a second target)
+ Ember-Scarred       (applies Burn)
+ Overdrawn           (+1 Mana)
= Forked Ember-Scarred Aether Bolt
```

## Deterministic instance contract

Every generated instance stores:

| Field | Purpose |
|-------|---------|
| `instanceId` | Stable unique ID |
| `generationVersion` | Content grammar version used to create it |
| `seed` | Reproduces its rolls and supports debugging/replay |
| `baseId` | Vessel or spell pattern |
| `rarityId` | Affix budget / presentation tier |
| `prefixIds` / `suffixIds` | Chosen effect modules |
| `curseId` | Optional drawback module |
| `mechanicSnapshot` | Validated resolved mechanics used by the sim |
| `displaySnapshot` | Cached generated name, lore, and presentation text |

The host/simulation owns mechanics. An LLM response must never be required to replay, load, or resolve a saved instance.

## Rarity and affix budgets

| Tier | Affix budget | Initial role |
|------|-------------:|--------------|
| **Salvaged** | 0 | Functional base vessel/pattern |
| **Imbued** | 1 | One clear magical behavior |
| **Rare** | 2 | Two complementary or tension-filled behaviors |
| **Legendary** | 2–3 + signature rule | Named, marked-enemy-worthy build direction |

Rarity is rolled from weighted tables by region, source, enemy role, and progression. A Legendary is visibly marked when an enemy carries it; its mechanically applicable effects help that enemy before it drops.

## Effect grammar

Prefix/suffix pools can only use effects the simulation recognizes. Initial categories:

| Category | Examples |
|----------|----------|
| Damage / element | Cinderbound Burn, Conduit spell power, physical magnitude |
| Defense | Warded Block, Guard enhancement, damage mitigation |
| Tempo | Quickened initiative, draw, Retain, hand-limit changes |
| Resources | Mana/Stamina capacity, cost changes, restore-on-condition |
| Status interaction | Reward Burn, exploit Exposed, improve Weakened/Guard |
| Craft / Gloom | Safer craft modifier, Gloom tradeoff, curse interaction |
| Curse | Frayed self-damage, Hollow Exhaust, Overdrawn cost |

An affix budget prices each effect and its synergies. The grammar may grow, but a generated instance cannot invent a new executable effect outside this vocabulary.

## Item and spell generation

1. Choose a base appropriate to the source, region, and eligible slot/pattern.
2. Roll rarity and derive the allowed affix budget from the named RNG stream.
3. Select valid weighted prefix/suffix modules; reject incompatible or redundant combinations.
4. Optionally add a mutation/curse when the source, rarity, craft tier, or Gloom context permits it.
5. Validate effect budget, targeting, costs, and deterministic resolution.
6. Build a name/lore description from templates or an approved AI presentation layer.

Spell generation follows the same process but uses **pattern + school + form + modifiers** rather than physical slots.

## Vertical-slice seed pool

The first pool is intentionally small but combinatorial:

| Pool | Initial count |
|------|--------------:|
| Base weapons/foci | 4 |
| Offhands | 3 |
| Legendary vessels | 3 |
| Prefixes | 8–12 |
| Suffixes | 8–12 |
| Curses | 3 |
| Spell forms | 2–3 |

This creates hundreds of valid item/spell instances while remaining testable. The initial base/affix lists should be authored next as content data.

## AI-assisted content policy

AI is a creative collaborator, never the authoritative rules engine.

### Curated generation — recommended first mode

An external model may generate batches of item names, lore, spell concepts, event copy, or candidate effect combinations. Candidates enter the pool only after:

1. Schema validation against the effect grammar.
2. Affix-budget and incompatibility checks.
3. Deterministic simulation tests.
4. Human approval or an explicitly approved automated content gate.

### Live discovery mode — later optional mode

At runtime, an external model may generate only a name, lore, and visual description for an already-valid seeded mechanic instance. The host caches that text in `displaySnapshot`; loss of network access cannot alter gameplay or invalidate saves.

Do not allow a live LLM call to create arbitrary executable mechanics, alter combat state, bypass the RNG streams, or decide a saved item's rules.

## Acceptance criteria

- Two items with the same base name can have genuinely different tactical roles.
- A marked enemy's carried instance is exactly the item that drops.
- Every instance is reproducible from its stored seed/version or resolved snapshot.
- A generated name/lore description cannot make an invalid or untestable mechanic live.
- A future AI provider can be swapped without changing simulation rules or saved mechanics.
