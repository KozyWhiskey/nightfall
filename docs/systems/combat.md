# Combat

**Status:** Draft  
**Last updated:** 2026-07-16  
**Related:** [cards-and-decks.md](cards-and-decks.md), [party-and-roster.md](party-and-roster.md)

## Goal

**Vertical-slice scope override:** combat is built and tuned for the Vanguard + Aether Weaver pair. Three-hero scaling is a future compatibility requirement, not playable first-slice content.

Every round is a **puzzle**: readable enemy intents, scarce AP, and a visible initiative timeline. Combos that clear the field or lock allies behind defense are the dopamine spike.

## Player-facing rules

### Participants

- Vertical slice: fixed Vanguard + Aether Weaver pair. Future compatibility: 2–3 heroes.
- Enemies: packs with roles (dps, buffer, exploder, tank, etc.).
- Each combatant has a place in **initiative order**.

### Initiative

The complete setup sequence, timeline order, and future-compatible timeline rules are authoritative in [Combat Simulation Contract](combat-simulation-contract.md).

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

### Intent visibility and defensive timing (locked)

- At combat start, every enemy rolls and reveals its **next** intent.
- Immediately after an enemy resolves that intent, the host rolls and reveals its next one. An enemy therefore always displays the action it will take on its next turn.
- A hero acting late in the initiative cycle can see which enemy turns occur before that hero's next turn. They are never asked to Block or Guard against an unrevealed normal intent.
- Block clears at the start of its owner's next turn. Guard lasts until the guarding hero's next turn. Therefore, a late-acting Vanguard can defend against enemies that act early in the following cycle.
- The combat UI must make this duration legible on the initiative timeline: show which upcoming enemy turns are protected by current Block/Guard.
- An enemy may have an explicitly labelled adaptive or scripted exception later, but no Band-1 normal intent changes secretly after being revealed.

#### Carried drops (loot-on-monster)

- When an encounter is generated, each relevant enemy is **granted the actual item(s)** they will drop if defeated.
- That item can affect the fight (affixes, initiative, power) — a tougher pack carrying a **legendary** should feel more dangerous *and* more rewarding.
- On kill, that carried item is what enters the loot flow (no second secret roll that invalidates what you fought).
- Details / rarity rules: [gear-and-affixes.md](gear-and-affixes.md), [../content/enemies/README.md](../content/enemies/README.md).

### Turns

- On a hero’s turn they draw/refresh according to deck rules, then spend **their own resources** to play cards.
- **AP is flat 3 for every class** (per hero, not a shared party pool). Gear/effects may modify later; baseline is equal.
- Enemy turns resolve telegraphed intents (attack, buff, debuff, block, special).
- Combat uses an **individual initiative timeline**: heroes and enemies act one at a time in initiative order, rather than in a shared party phase.
- Stamina and Mana are **expedition resources**, not per-turn resources. They persist from one combat to the next. After each victorious combat, each hero restores 50% of their maximum Mana and 50% of their maximum Stamina; no automatic restoration occurs at Events, Safe Craft, or ordinary travel. Cards, consumables, Rest, and explicitly labelled event outcomes may restore them.

### Targeting and starting combat scope (locked)

- Version-one combat has **no rows, range, or grid**. Every living combatant is targetable unless a card or status explicitly says otherwise.
- Protection and target manipulation come from card effects such as Guard or taunt, not positional rules.
- The starting condition catalogue is deliberately small and extensible: **block, exposed/vulnerable, weakened, burn, stun, guard/taunt, poison, and Gloom-only Strain**. New conditions must declare their timing and stacking behavior before content uses them.
- Ordinary attacks and cards have **no miss chance**. When a valid card is played, it resolves; uncertainty comes from visible intents, card draw, pathing, and explicit effects.

### Stats (starting model)

The exact starting attributes, derived-pool formulas, and damage/rounding rules are authoritative in [Combat Simulation Contract](combat-simulation-contract.md).

| Stat | Primary purpose |
|------|-----------------|
| `VIT` | Maximum HP |
| `DEX` | Initiative (not accuracy/evasion) |
| `STR` | Physical-card power and maximum Stamina |
| `INT` | Spell-card power and maximum Mana |

Every level grants one freely assigned attribute point. This lets a hero lean into unexpected discovered gear: for example, an Aether Weaver can invest in STR/Stamina to support physical weapon cards, while a Vanguard can invest in INT/Mana to support relic magic. Gear and cards may also modify stats.

### Starting condition rules

| Condition | Initial behavior | Initial balance default |
|-----------|------------------|-------------------------|
| Block | Temporary HP; clears at the target's next turn | Stacks additively |
| Exposed | Target takes more damage | +25% damage received; refreshes duration |
| Weakened | Target deals less damage | −25% damage dealt; refreshes duration |
| Burn | Damage at turn end | 2 damage per stack; stacks additively |
| Poison | Damage at turn start | 2 damage per stack; stacks additively |
| Stun | Skip one upcoming turn | Does not stack; refreshes only if explicitly allowed |
| Guard | Protects named ally / redirects attacks as card text states | Card-defined |
| Strain | Hero begins the affected next combat with -1 AP | Clears after that combat; no stacking in the first slice |

All numeric defaults are domain-tunable; their timing and stacking law are the stable contract.

### Resources (locked)

Every non-trivial card spends something. Three pools:

| Resource | Who leans on it | Rules |
|----------|-----------------|-------|
| **AP** | Everyone | **Flat 3** per turn per hero. Almost every card costs AP. |
| **Stamina** | Every hero; martial kits lean on it | Spent by non-basic attacks and physical abilities. |
| **Mana** | Every hero; weave kits lean on it | Spent by spells (plus AP). |

**Basics exception:** **Basic Attack** and **Basic Block** cost **1 AP** and **no Stamina / no Mana**. They are the always-available puzzle glue when you’re dry on secondary resources.

Class fantasy differentiates **Stamina vs Mana pool sizes** (and card mix), not base AP.

### Between-combat recovery (locked)

- At embark, every hero begins at full HP, Mana, and Stamina, subject to any persistent injury.
- On a combat victory, restore `ceil(maximum resource Ã— 0.5)` Mana and the same fraction of Stamina to each living hero, capped at their maximum. HP does not recover automatically.
- Events, Safe Craft, and travel never restore resources merely because the party entered them. A specific event choice may say that it does.
- A party that wipes receives no recovery. A full successful Return restores ordinary HP, Mana, and Stamina; injuries persist under the existing Return rules.
- This recovery fraction is balance data. It begins at 50% so a resource-heavy combat route remains viable without making Rest, consumables, and low-cost cards irrelevant.

Starting resource profiles for the first playable kits:

| Class | Stamina | Mana |
|-------|---------:|-----:|
| Vanguard | 10 | 3 |
| Aether Weaver | 4 | 10 |

### Card limits (locked)

Cards have **no cooldowns by default**. Deck draw, discard, exhaust, and resource costs are the normal limits. Future content can introduce a cooldown only when its card text explicitly defines it.

### Win / loss

- Win: all enemies defeated.
- At 0 HP, a hero is **downed**, not immediately dead. A downed hero takes no further turns for that encounter.
- Loss: the expedition ends only when the whole party is down. A full-party loss is a wipe: every expedition hero is lost to the Gloom and the Haven suffers its failure consequence.
- An ally may use a card or action to revive a downed hero in combat. If the party wins while a hero remains down, that hero survives with an injury / low-health recovery state; the exact recovery cost is a run-structure decision.
- Each downed hero receives one random temporary injury after a victorious combat. Injuries may stack; a hero can carry more than one until treated at a Rest or The Quiet House.

| Injury | Effect until treated |
|--------|----------------------|
| `injured` | Start combat with −1 AP |
| `wounded` | Reduced maximum HP |
| `drained` | Reduced starting Mana or Stamina |

### Readability (non-negotiable)

- Enemy intents visible before they act.
- Block, statuses, and **AP / Stamina / Mana** costs always legible.
- See [../ux/readability.md](../ux/readability.md).

## Parameters (proposed)

| Param | Default | Notes |
|-------|---------|-------|
| Base hand size | **3** | Per hero — see cards-and-decks.md |
| Base AP | **3** (flat) | Same for all classes |
| Stamina / Mana | Class-defined pools | Martial vs weave lean |
| Draw per turn | hand refill to size | StS-like unless specified |
| Max enemies on field | 5 | Readability |
| Standard-fight duration | **3–5 minutes** | Elites and bosses may run longer |

## Edge cases

- Stunned / skipped turns and initiative reordering mid-fight.
- Summons and when they insert into timeline.
- Co-op: only the owning player may play that hero’s cards on their turn.
- Block is temporary HP that clears at the start of that combatant's next turn; it therefore protects through the intervening initiative cycle.

## Content hooks

- Enemy intent tables
- Status kinds
- Encounter packs per region

## Acceptance criteria

**Vertical-slice scope note:** early lessons must emerge from ordinary Band-1 combat. The slice has no scripted tutorial and no Elite encounters.

- [ ] New players can explain “why I blocked” after one fight
- [ ] At least one readable combo moment in early game through ordinary Band-1 combat
- [ ] Initiative order never feels random without cause

## Open questions

- Downed-hero recovery / injury rule after a combat win
- Exact `variance` range if 1..4 feels too swingy in playtests
- Which affixes on carried loot apply in-combat vs loot-only cosmetics
