# Cards and Decks

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [combat.md](combat.md), [gear-and-affixes.md](gear-and-affixes.md), [spellcraft.md](spellcraft.md)

## Goal

Unify **attacks, abilities, and spells** into one per-hero deck so combat always presents card decisions — not a separate “basic attack” mode outside the puzzle. Kits should feel **Diablo-like unique**: same base spell name can appear more than once, but instances are almost never identical.

## Player-facing rules

### Card kinds (all cards)

| Kind | Role | Typical cost |
|------|------|--------------|
| **Basic Attack / Basic Block** | Always-on martial basics | **1 AP**, no Stamina/Mana |
| **Attack** | Weaponed / physical strikes | AP + **Stamina** (usually) |
| **Ability** | Class/gear skills (e.g. Dodge, Guard) | AP + Stamina or Mana by fantasy |
| **Spell** | Weave / learned magic from scrolls & schools | AP + **Mana** |

**Resource law:** everything uses a resource; only Basics are AP-only. See [combat.md](combat.md).

All three shuffle into the **same draw pile** for that hero.

### Per-hero deck

- Each hero has: draw pile, hand, discard (and exhaust/consume piles as needed).
- Starting deck comes from class kit + equipped gear card injections.
- Mid-run: add rewards, remove/cripple weak cards, fuse spells (spellcraft).

### Play resolution (locked)

- **Discard by default** when a card is played.
- **Exhaust** (or consume) only when the card text or an effect says so (StS-like).

### Instance creation rolls (locked)

Spells, abilities, and items are **instances** with a seeded creation roll (affinity / power band), not flat template clones.

| Rule | Decision |
|------|----------|
| Same display name | **Allowed** in one deck (e.g. two “Ice Bolt” cards) |
| Identity | Distinct instance IDs + rolled magnitude / mod lines |
| Starters | Near baseline is fine, but still rolled — a hero may leave town with a slightly stronger or weaker starter |
| Fairness | Strong rolls elsewhere on the kit should be **offset** (weaker rolls on other spells/stats) so multi–nat-20 kits don’t dominate |

Exact band tables (e.g. d20 → damage ranges) are domain data; the law is uniqueness + fairness, not specific numbers.

### Gear relationship

- Gear can: grant stats/resists, grant **ability/attack cards**, modify other cards, or grant spells.
- Equipping boots with “Dodge” adds that ability card to the deck while equipped.
- Injected / granted cards follow the same instance-roll rules.

### Spells

- Spells are action cards found as **scrolls**, learned, and modifiable.
- Each spell has a **school** tag; a hero learns it only if they know that school (see [spellcraft.md](spellcraft.md), [progression.md](progression.md)).
- Mana is a spell resource distinct from AP.
- See [spellcraft.md](spellcraft.md) for fusion risk and **cross-school reactions**.

### Schools on cards

- Attacks/abilities also carry school tags when they belong to a learnable kit (Iron, Bastion, Veil, etc.).
- Starter decks only include schools the class knows at embark.
- Gear may inject cards; if the injected card’s school is unknown, either block equip (preferred for clarity) or inject as unusable until school unlock — **proposal: block with explanation**.

## Parameters (locked targets)

| Param | Value | Notes |
|-------|-------|-------|
| Hand size | **4** | Per hero |
| Starting deck size | **8** | Class kit + starting gear injections |
| Mid-run comfort size | **~20** | Soft target; beyond this, thinning should matter |
| Play default | **Discard** | Exhaust only when tagged |
| Max spell load | Soft via mana & duplicates | No separate spell-slot loadout — deck is the limit |

## Edge cases

- **Equip/unequip anytime outside combat** — injected cards are added/removed from that hero’s deck immediately when out of fight (enables party **gear trading** between nodes).
- **No mid-combat swaps** — loadout locked for the duration of a fight.
- Ephemeral cards (one-fight tokens) vs permanent deck adds.
- Co-op: decks are private to each hero/player; trading still happens in shared out-of-combat inventory UI.
- UI should show instance variance (mod lines / affinity) so duplicate names are readable.

## Content hooks

- Card definitions with tags (block, strike, weave, retain, **school**, exhaust, etc.)
- Class starter decks (two schools) + creation-roll tables
- Affix → card injection tables
- Cross-school reaction IDs referenced from spellcraft domain data

## Acceptance criteria

- [ ] A fight is playable with zero spells (attacks/abilities suffice)
- [ ] A spell-heavy hero still draws attacks sometimes (deck composition risk)
- [ ] Players understand mana vs AP in the first tutorial fight
- [ ] Exhaust cards are clearly marked; everything else discards
- [ ] Two same-named cards can differ in power/mods and remain distinguishable
