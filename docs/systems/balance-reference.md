# Balance Reference

**Status:** Initial tuning framework — values are proposed, not permanent  
**Last updated:** 2026-07-17  
**Related:** [combat.md](combat.md), [cards-and-decks.md](cards-and-decks.md), [gear-and-affixes.md](gear-and-affixes.md), [vertical-slice-handoff.md](../product/vertical-slice-handoff.md)

Shared spell/ability budgets, school identity, scaling, and future-mechanic guardrails: [Spell and Ability Framework](spell-and-ability-framework.md).

## Purpose

This is a **reference chart**, not a hardcoded balance bible. Its job is to give every future card, enemy, item, and status a visible starting range. Values belong in data tables and must change through playtesting rather than through one-off code exceptions.

## Balance principles

1. Start from a small set of baselines, then price exceptions against them.
2. A card's value includes damage, defense, status, draw, targeting, and reliability—not damage alone.
3. Resource costs use whole numbers. Do not introduce fractional AP, Stamina, or Mana costs.
4. Early content should be legible: a player must understand why a card is stronger, weaker, riskier, or more efficient.
5. Tune one variable at a time and record the reason. Do not solve a hard encounter by silently inflating every number.
6. A vertical slice needs **good relative balance**, not final endgame numbers.

## Hero baselines: first two playable kits

| Property | Vanguard | Aether Weaver | Intent |
|----------|---------:|--------------:|--------|
| HP | 34 | 24 | Vanguard survives more direct pressure |
| Stamina | 10 | 4 | Every hero has Stamina; Vanguard can sustain physical cards |
| Mana | 3 | 10 | Every hero has Mana; Weaver can sustain spells |
| Basic Attack | 5 physical | 3 physical | Always available, modest fallback |
| Basic Block | 6 Block | 4 Block | Vanguard is naturally better at protection |
| Initiative | Low–mid | Mid–high | DEX and gear can alter the order |

Other classes should begin inside the same broad envelope unless their identity explicitly justifies a documented exception.

## Action and resource bands

AP constrains how many actions a hero can take in a turn; Stamina and Mana constrain how often a build can use its strongest actions across the combat.

| Band | Typical cost | Early expected value | Examples |
|------|--------------|---------------------|----------|
| Baseline | 1 AP, no secondary resource | 3–5 damage or 4–6 Block | Basic Attack, Basic Block |
| Tactical | 1 AP + 1 Stamina/Mana | 4–6 damage plus a small effect, or 7–10 Block | Ember Spark, Shield Bash, Brace |
| Power | 1 AP + 2 Stamina/Mana | 9–11 direct damage, or a strong multi-part answer | Iron Cut, Aether Bolt |
| Spike | 1 AP + 3+ resource, or clear downside | Above power-band output, multi-targeting, major control, or meaningful risk | Later loot, craft, subclass content |

Status, draw, retain, target flexibility, and reliability consume part of the value budget. A card with a strong status should normally deal less direct damage than an otherwise equivalent plain attack.

## Initial card anchors

| Card | Cost | Anchor value |
|------|------|--------------|
| Vanguard Basic Attack | 1 AP | 5 physical damage |
| Vanguard Basic Block | 1 AP | 6 Block |
| Iron Cut | 1 AP + 2 Stamina | 9 physical damage |
| Shield Bash | 1 AP + 1 Stamina | 4 damage + one-turn Weakened |
| Aether Weaver Basic Attack | 1 AP | 3 physical damage |
| Aether Weaver Basic Block | 1 AP | 4 Block |
| Aether Bolt | 1 AP + 2 Mana | 11 Aether damage |
| Ember Spark | 1 AP + 1 Mana | 4 Ember damage + 1 Burn |
| Aether Lash | 1 AP + 1 Mana | 6 Aether damage |
| Flare Ward | 1 AP + 1 Mana | 7 Block |

## Condition anchors

| Condition | Initial rule | Balance note |
|-----------|--------------|--------------|
| Block | Temporary HP, clears at next turn | Directly comparable to damage prevention |
| Exposed | +25% damage received | Powerful against focused targets; duration matters |
| Weakened | −25% damage dealt | Stronger against high-damage intent than low chip damage |
| Burn / Poison | 2 damage per stack on their specified tick | Stacking is valuable only if the target survives to tick |
| Stun | Skip one upcoming turn | Major control; price conservatively and avoid routine access |
| Guard | Card-defined protection/redirection | Value depends on the prevented intent |

## Early encounter targets

These are starting hypotheses to validate in simulation and playtests.

| Encounter | Target shape |
|-----------|--------------|
| Standard fight | 2–3 enemies; normally resolves in 3–5 minutes |
| Early enemy | ~18–26 HP; common intent deals ~4–7 damage |
| Tough enemy | ~28–38 HP; can demand Block, Weakened, or focus fire |
| Boss | ~90–120 HP across phases/intent cycles; one highly readable major telegraph |

Enemy packs should pressure different answers. Do not make all enemies simply high-HP damage dealers.

## Growth reference

Expedition levels grant temporary attribute points. Each surviving boss-clear hero can later record one permanent Leadership Point at the Wardyard. Initial derived-value targets:

| Point | Expected effect |
|-------|-----------------|
| +1 VIT | Meaningful maximum-HP increase (initial target: +3 HP) |
| +1 STR | +1 maximum Stamina plus modest physical scaling |
| +1 INT | +1 maximum Mana plus modest spell scaling |
| +1 DEX | Visible initiative increase; no accuracy/evasion layer |

Do not add a respec system by default. If playtests show frequent irreversible-feeling mistakes, revisit the Wardyard rather than weakening every choice preemptively.

## Testing practice

For each balance change, test at least:

1. Vanguard/Aether Weaver baseline party versus a normal two-enemy pack.
2. The same party with poor card draw and no exceptional loot.
3. The same party with one unusually strong gear card.
4. A fight where the Vanguard is downed and the Weaver must use Basics/Block.
5. A boss major-intent turn with and without the intended answer.

Track fight duration, HP lost, resource remaining, cards played, turns spent on Basics, and whether the player could explain the outcome. Change the smallest relevant number first.
