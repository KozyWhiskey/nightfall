# Vertical-Slice Item and Affix Pool

**Status:** Accepted Build 1 seed pool; tune weights through playtest  
**Last updated:** 2026-07-18  
**Related:** [Procedural Forge](procedural-forge.md), [Balance Reference](../../systems/balance-reference.md)

**Build 1 authority:** [Content Registry](../vertical-slice-content-registry.md) owns the enabled vessels, exact effects, compatibility, and rarity allocation.

## Base vessels

These are base vessels, not fixed loot. The procedural forge creates the persistent instance through rarity, prefixes, suffixes, curses, and optional Legendary signatures.

### Main hand

| Base ID | Vessel | Native direction | Granted card / effect | Eligibility |
|---------|--------|------------------|-----------------------|-------------|
| `hewn_sword` | Hewn Sword | Simple physical vessel | `Iron Cut` — 2 Stamina, 9 physical damage | Universal |
| `gloomwood_spear` | Gloomwood Spear | Reach and target punishment | `Piercing Thrust` — 1 Stamina, 6 physical damage; apply Exposed | Universal |
| `aether_rod` | Aether Rod | Unstable Weave channel | `Aether Lash` — 1 Mana, 6 Aether damage | Aether school |
| `cinder_scepter` | Cinder Scepter | Controlled lantern-fire | `Ember Lance` — 2 Mana, 7 Ember damage; apply 1 Burn | Ember school |

### Offhand

| Base ID | Vessel | Native direction | Granted card / effect | Eligibility |
|---------|--------|------------------|-----------------------|-------------|
| `kite_shield` | Kite Shield | Straight protection | `Brace` — 1 Stamina, gain 10 Block | Universal |
| `way_lantern_buckler` | Way-lantern Buckler | Magical protection | `Flare Ward` — 1 Mana, gain 7 Block | Aether or Ember school |
| `archivists_focus` | Archivist’s Focus | Hand/draw manipulation | Draw +1 card at combat start | Aether school |

### Relic-slot vessel

| Base ID | Vessel | Native direction |
|---------|--------|------------------|
| `cracked_way_lens` | Cracked Way-Lens | +1 spell damage |
| `pilgrims_knot` | Pilgrim’s Knot | +1 maximum Stamina |
| `name_thread_charm` | Name-Thread Charm | First retained card each combat does not count against hand refill |

## Prefix modules

Prefixes are direct magical bindings. “Matching” means an item must grant the named action type before the affix can roll.

| Prefix ID | Prefix | Effect | Compatibility |
|-----------|--------|--------|---------------|
| `cinderbound` | Cinderbound | Matching attack applies 1 Burn | Attack-granting vessel |
| `warded` | Warded | Matching Block effect gains +2 Block | Block-granting vessel |
| `conduit` | Conduit | Matching spell gains +1 damage | Spell-granting vessel |
| `quickened` | Quickened | +1 initiative | Any vessel |
| `anchored` | Anchored | Granted card gains Retain | Card-granting vessel; no other Retain affix |
| `deepdrawn` | Deepdrawn | +1 maximum Stamina or Mana, appropriate to vessel | Any vessel |
| `houndmarked` | Houndmarked | Attacks against Exposed targets deal +2 damage | Attack-granting vessel |
| `lumenforged` | Lumenforged | First Block gained each combat increases by +2 | Any vessel |

## Suffix modules

Suffixes describe an old purpose, vow, route, or remembered failure. They are more conditional than prefixes.

| Suffix ID | Suffix | Effect |
|-----------|--------|--------|
| `last_watch` | of the Last Watch | When you Guard an ally, gain 2 Block |
| `cinders` | of Cinders | Your Burn deals +1 damage per stack |
| `hound` | of the Hound | First attack against an Exposed enemy each combat costs 1 less resource |
| `long_vigil` | of the Long Vigil | First retained card each combat costs 1 less resource |
| `broken_gate` | of the Broken Gate | Basic Block gains +1 Block |
| `veiled_road` | of the Veiled Road | Draw 1 extra card at combat start |
| `ashen_names` | of Ashen Names | When an ally is downed, gain 4 Block |
| `waystation` | of the Waystation | Reduce one event/combat Gloom increase each expedition |

## Curses

| Curse ID | Curse | Effect |
|----------|-------|--------|
| `frayed` | Frayed | Granted/injected card deals 1 damage to its caster |
| `hollow` | Hollow | Granted/injected card Exhausts after use |
| `overdrawn` | Overdrawn | Granted/injected card costs +1 Mana or Stamina |

## Legendary signatures

A Legendary item receives its normal affix budget plus one curated signature rule.

| Signature ID | Signature | Effect |
|--------------|-----------|--------|
| `vigils_promise` | Vigil’s Promise | Guard grants the protected ally 2 Block too |
| `cinder_scar` | Cinder-Scar | Burned enemies deal 1 less damage |
| `hounds_pursuit` | Hound’s Pursuit | When an enemy becomes Exposed, draw 1 card |
| `lanterns_memory` | Lantern’s Memory | Once per combat, retaining a card does not reduce next-turn draw |

## Combination rules

- Reject duplicate modules and modules that do not match the base vessel.
- At most one hand/draw/Retain manipulation module may appear on an instance in the first slice.
- At most one resource-capacity module may appear on an instance in the first slice.
- A curse must have a visible associated upside: rarity budget, craft improvement, or signature effect.
- Names compose from prefix + base + suffix. A Legendary may instead use a curated proper name with the generated affix details shown in its tooltip.

## Example instances

| Instance | Mechanical identity |
|----------|---------------------|
| Quickened Gloomwood Spear of the Hound | Fast universal weapon that punishes Exposed targets |
| Cinderbound Kite Shield of the Last Watch | Guard-focused defense that creates small Burn pressure |
| Anchored Cracked Way-Lens of the Long Vigil | Spell/retention planning relic |
