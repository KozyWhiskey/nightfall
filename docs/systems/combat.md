# Combat

**Status:** Draft  
**Last updated:** 2026-07-16  
**Related:** [cards-and-decks.md](cards-and-decks.md), [party-and-roster.md](party-and-roster.md)

## Goal

Every round is a **puzzle**: readable enemy intents, scarce AP, and a visible initiative timeline. Combos that clear the field or lock allies behind defense are the dopamine spike.

## Player-facing rules

### Participants

- Player party: 2–3 heroes.
- Enemies: packs with roles (dps, buffer, exploder, tank, etc.).
- Each combatant has a place in **initiative order**.

### Initiative

- **Same formula for heroes and enemies** — one shared timeline.
- UI always shows an **initiative timeline** (who acts next).
- Ties broken by deterministic seeded rule (entity id / slot order) for co-op sync.

#### Formula (locked recommendation)

```text
initiative = (DEX × 2) + itemInitiative + variance
```

| Term | Meaning |
|------|---------|
| `DEX × 2` | Primary stat weight — Shadowblade-style kits act early |
| `itemInitiative` | Sum of Speed / Initiative bonuses on **currently carried gear** |
| `variance` | Small **seeded** roll per combatant per fight, e.g. `1..4` — enough spice, not chaos |

Enemies use the same math. Their `itemInitiative` (and other combat mods) can come from the **pre-rolled drop they carry** into the fight (see below).

#### Carried drops (loot-on-monster)

- When an encounter is generated, each relevant enemy is **granted the actual item(s)** they will drop if defeated.
- That item can affect the fight (affixes, initiative, power) — a tougher pack carrying a **legendary** should feel more dangerous *and* more rewarding.
- On kill, that carried item is what enters the loot flow (no second secret roll that invalidates what you fought).
- Details / rarity rules: [gear-and-affixes.md](gear-and-affixes.md), [../content/enemies/README.md](../content/enemies/README.md).

### Turns

- On a hero’s turn they draw/refresh according to deck rules, then spend **their own resources** to play cards.
- **AP is flat 3 for every class** (per hero, not a shared party pool). Gear/effects may modify later; baseline is equal.
- Enemy turns resolve telegraphed intents (attack, buff, debuff, block, special).

### Resources (locked)

Every non-trivial card spends something. Three pools:

| Resource | Who leans on it | Rules |
|----------|-----------------|-------|
| **AP** | Everyone | **Flat 3** per turn per hero. Almost every card costs AP. |
| **Stamina** | Martial / physical kits (e.g. Vanguard, Shadowblade) | Spent by non-basic attacks and physical abilities. |
| **Mana** | Weave / spell kits (e.g. Aether Weaver) | Spent by spells (plus AP). |

**Basics exception:** **Basic Attack** and **Basic Block** cost **1 AP** and **no Stamina / no Mana**. They are the always-available puzzle glue when you’re dry on secondary resources.

Class fantasy differentiates **Stamina vs Mana pool sizes** (and card mix), not base AP.

### Win / loss

- Win: all enemies defeated.
- Loss: party cannot continue (all heroes down — exact downed vs dead rules TBD).
- Individual hero death: remove from combat and mark roster death on expedition end (or immediate) — TBD; prefer clear stakes.

### Readability (non-negotiable)

- Enemy intents visible before they act.
- Block, statuses, and **AP / Stamina / Mana** costs always legible.
- See [../ux/readability.md](../ux/readability.md).

## Parameters (proposed)

| Param | Default | Notes |
|-------|---------|-------|
| Base hand size | **4** | Per hero — see cards-and-decks.md |
| Base AP | **3** (flat) | Same for all classes |
| Stamina / Mana | Class-defined pools | Martial vs weave lean |
| Draw per turn | hand refill to size | StS-like unless specified |
| Max enemies on field | 5 | Readability |

## Edge cases

- Stunned / skipped turns and initiative reordering mid-fight.
- Summons and when they insert into timeline.
- Co-op: only the owning player may play that hero’s cards on their turn.

## Content hooks

- Enemy intent tables
- Status kinds
- Encounter packs per region

## Acceptance criteria

- [ ] New players can explain “why I blocked” after one fight
- [ ] At least one taught combo moment in early game (tutorial or easy elite)
- [ ] Initiative order never feels random without cause

## Open questions

- Downed state vs instant death
- Positioning / rows (front/back) — must-ship or nice later? **Proposal: nice later; no rows in v1.**
- Exact `variance` range if 1..4 feels too swingy in playtests
- Which affixes on carried loot apply in-combat vs loot-only cosmetics
