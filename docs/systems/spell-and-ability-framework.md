# Spell and Ability Framework

**Status:** Accepted framework; vertical-slice pool not yet authored  
**Last updated:** 2026-07-18  
**Related:** [Balance Reference](balance-reference.md), [Spellcraft](spellcraft.md), [Cards and Decks](cards-and-decks.md), [Content Direction](../content/content-direction.md)

## Purpose

This is the shared balance and extensibility contract for class abilities, weapon techniques, gear-injected cards, scrolls, crafted hybrids, and future schools. Random generation determines available opportunities; it must not routinely create a strict or opaque best answer.

The vertical slice starts intentionally simple. Its architecture must support more distinctive future magic—especially blood costs/lifesteal and summons—without requiring a second combat rules engine.

## Shared action economy

| Band | Cost | Early expected value | Use |
|---|---|---|---|
| Basic | 1 AP | 3–5 damage or 4–6 Block | Reliable fallback |
| Tactical | 1 AP + 1 Mana/Stamina | 4–6 damage plus a minor effect, or 7–10 Block | Most early cards |
| Power | 1 AP + 2 Mana/Stamina | 8–11 direct damage, or a strong linked effect | Core reward/crafted cards |
| Spike | 1 AP + 3 resource, a condition, or a downside | 12–15 damage, multi-targeting, major control, or a major payoff | Rare/risky/later content |

No first-slice card creates extra AP. Spells normally cost Mana; physical and weapon techniques normally cost Stamina. Any hero may use an equipped weapon card. School-specific scrolls require school knowledge to learn, but remain valid craft, trade, and extraction assets for every party.

## Effect budget

| Effect | First-slice guidance |
|---|---|
| Direct single-target damage / Block | Primary, easily priced effect |
| Exposed / Weakened / Burn | A meaningful rider; pair with reduced damage or increased cost |
| Guard | Bastion/gear protection; must clearly state protected target and prevention behavior |
| Draw 1 | Significant utility; cannot accompany power-band damage |
| Retain | Strong with a three-card hand; rare and tightly capped |
| Resource restoration, Stun, Poison | Rules support only; exclude from ordinary first-pool scrolls |
| Multi-target damage | Ember identity; expensive, conditional, or risky |
| Summons, transformations, permanent auras | Deferred from the first pool |

One card gets one strong idea. A linked rider must reinforce that idea rather than turn a card into a pile of unrelated benefits.

## Rarity contract

| Rarity | Mechanical identity |
|---|---|
| Salvaged / common | One legible action |
| Imbued | Primary action plus a connected rider or conditional |
| Rare | Build-direction card: related effects, mode choice, or visible tradeoff |
| Relic-grade magic | Later signature rule with a visible constraint |

Rarity increases decision space and build identity, not merely raw damage.

## Starting-school identities

| School | Strengths | Deliberate weaknesses |
|---|---|---|
| Iron | Reliable physical damage, Exposed exploitation, weapon techniques | Large Block, draw, area magic |
| Bastion | Block, Guard, Weakened, ally protection | Burst damage, card advantage |
| Aether | Precise spell damage, flexible targeting, modest selection later | Durable defense, large area damage |
| Ember | Burn, pressure, costly multi-target effects later | Sustained defense, efficiency |
| Umbra | Exposed, risky tempo/Retain effects later, Gloom-adjacent bargains | Safe raw damage, reliable protection |

Vanguard starts with Iron and Bastion knowledge. Aether Weaver starts with Aether and Ember knowledge. Umbra scrolls may be found, carried, crafted with, and extracted, but are not learnable until their school is discovered.

## Scaling

Characters do not automatically rank up every spell at level-up. Power grows through chosen permanent stats, found gear, scrolls, and crafting.

| Stat | Per point | Direct scaling |
|---|---|---|
| VIT | +3 max HP | None |
| DEX | +2 initiative | Timeline only; never accuracy/evasion |
| STR | +1 max Stamina | Every 2 STR: +1 direct physical-card damage |
| INT | +1 max Mana | Every 2 INT: +1 direct spell-card damage |

Direct scaling does not automatically improve Burn, Block, Exposed, Weakened, draw, or other riders. This preserves distinct build paths and prevents multi-effect cards from scaling every component at once.

## First-pool limits

- Target 8–12 scrolls: two each of Iron, Bastion, Aether, Ember, and Umbra.
- Max 2 Mana or 2 Stamina cost, except for one clearly signposted Rare.
- No routine Stun, Poison, summoning, resource restoration, or permanent aura.
- At most one Draw-1 card and one Retain-granting card.
- At most one all-enemy damage card, most likely Ember.
- Every effect must be readable in one combat tooltip.

Accepted patterns: [First Scroll Pool](../content/spells/first-scroll-pool.md).

## Future signature mechanics

### Blood magic — provisional school name: Vitae or Sanguine

Blood magic spends health intentionally for unusual damage, control, or conversion effects, then recovers through conditional lifesteal, drains, sacrifice, or marked-kill effects. It must be a voluntary risk engine, not free damage.

- Health costs, self-damage, healing, and lifesteal are explicit in the card UI.
- Lifesteal is based on damage actually dealt and cannot heal beyond missing HP.
- Sustained healing must have caps, conditions, or opportunity costs so expedition attrition remains meaningful.
- A sacrifice effect may down/kill its caster only as a clearly disclosed player choice, never as an unexpected payment outcome.

### Summoning — provisional identity: Echo / Calling

Future summon cards create normal combat entities, not a separate minigame.

- A summon has owner, HP, initiative, intent/action rules, duration, tags, and targetability.
- Begin testing with a maximum of one active summon per hero.
- Summons use the same deterministic simulation, timeline, targeting, and effect pipeline as enemies and heroes.
- They must have visible purpose and vulnerability; they are not passive extra damage.

## Implementation-facing constraint

Content is deferred, not the capability. The simulation data model must be able to represent declarative costs (including future HP), conditionally resolved effects, entity ownership, durations, and summoned entities. It must not encode a special-case combat engine for Blood or summons.
