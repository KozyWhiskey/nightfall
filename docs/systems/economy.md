# Economy

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [haven-buildings.md](haven-buildings.md), [spellcraft.md](spellcraft.md), [../loops/failure-and-torches.md](../loops/failure-and-torches.md), [../vision/tone-and-world.md](../vision/tone-and-world.md)

## Goal

Fund Haven growth and in-run decisions without commercial monetization. Currencies should be few, readable, and themed for a **mature, dark** audience (see tone doc). Names below are **working locks** — IDs stay stable even if display copy gets a darker pass later.

## Dual economy (locked working names)

| Layer | ID | Display (working) | Role |
|-------|-----|-------------------|------|
| Run | `salvage` | Salvage | Shops, general expedition spend |
| Run | `emberglass` | Emberglass | Craft / fuse / reroll fuel (general) |
| Run | `rations` | Rations | Rest, escort, fatigue costs |
| Run (item) | `embershard` | Ember Shard | **Premium:** restore a town pillar **or** powerful craft/upgrade fuel |
| Haven | `timber` | Timber | Building construction |
| Haven | `stone` | Stone | Building construction |
| Haven | `wick` | Wick | Lantern Keep, light rites, light upkeep |

**Not currencies:** scrolls and gear are items (see [spellcraft.md](spellcraft.md)). Ember Shards are tracked as **scarce run items** (stackable), not a third soft currency — but listed here so agents never confuse them with Emberglass.

No “Glimmering Shards” meta shop — Haven mats + buildings replace that fantasy.

### Ember Shard vs Emberglass (locked)

| | Emberglass | Ember Shard |
|--|------------|-------------|
| Role | Everyday craft / fuse / reroll fuel | Dual-use: **relight a town pillar** or premium craft ingredient |
| Scarcity | Common expedition craft mat | Rare; intro gift + sparse finds |
| Wipe | Carried stacks lost on wipe unless chested | Same |
| Intro | — | Settler gift of **2** on first leave-town mission |

Pillar restore rules: [../loops/failure-and-torches.md](../loops/failure-and-torches.md).

### Presentation note

Copy, icons, and tooltips should feel **adult and grim** (soot, bone, ash, debt of light) — not cute fantasy coins. If names are later darkened (e.g. Wick → Gravewick), keep the same IDs.

## Design laws

1. Expeditions are the **primary** income; idle Haven does not print power.
2. Buildings are the **primary** Haven sink.
3. Craft greed sinks Emberglass (+ scrolls); Ember Shards are a **greed fork** (mend Haven vs power).
4. Avoid infinite disenchant → rebuild loops that erase scarcity.
5. **Scrolls are always valuable** — trade, craft fuel, upgrade fuel, or extract to Haven.
6. **Hoarding Emberglass** can feed the **Gloom meter** — spending is sometimes survival, not just power (see [gloom-and-stress.md](gloom-and-stress.md)).

## Sinks

| Sink | Spend |
|------|-------|
| Construct / upgrade building | Timber, Stone, (Wick for light buildings) |
| Soft-curse cleanse / scriptorium rites | Wick + Emberglass (tunable) |
| Heal / recruit / train | Haven mats + Rations as flavor costs |
| Shop prices | Salvage |
| Craft / reroll / fuse | Emberglass (+ scrolls as components) |
| Premium craft / powerful upgrades | Ember Shard (+ other components) |
| Restore town pillar | **1 Ember Shard** (act-end rite or at Haven) |
| Light rites | Wick |

### Sink ratios (starting defaults — domain-tunable)

Exact costs live in data tables. Intent:

- One solid Frontier (Band 1) return with a waypoint claim ≈ progress toward **one** building tier or a meaningful upgrade.
- Ember Shard spend is a visible **mend vs power** decision after a boss or at Haven.
- Wick stays scarcer than Timber/Stone so light feels costly.

## Acceptance criteria

- [ ] Player always knows which currency a tooltip means
- [ ] Ember Shard vs Emberglass is never confused in UI
- [ ] After a good run, there is a meaningful spend decision at Haven
- [ ] Poverty is recoverable; wealth does not trivialize Frontier Gates forever
- [ ] UI/copy never reads as children’s coin-collector fantasy

## Open questions

- Darker display rename pass (IDs stay)
- Icon language
