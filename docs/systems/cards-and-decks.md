# Cards and Decks

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [combat.md](combat.md), [gear-and-affixes.md](gear-and-affixes.md), [spellcraft.md](spellcraft.md)

Shared card budgets and future mechanic constraints: [Spell and Ability Framework](spell-and-ability-framework.md).

## Goal

Unify **attacks, abilities, and spells** into one per-hero deck so combat always presents card decisions — not a separate “basic attack” mode outside the puzzle. Kits should feel **Diablo-like unique**: same base spell name can appear more than once, but instances are almost never identical.

## Player-facing rules

### Card kinds (all cards)

| Kind | Role | Typical cost |
|------|------|--------------|
| **Basic Attack / Basic Block** | Always-available baseline actions; **not deck cards** | **1 AP**, no Stamina/Mana |
| **Attack** | Weaponed / physical strikes | AP + **Stamina** (usually) |
| **Ability** | Class/gear skills (e.g. Dodge, Guard) | AP + Stamina or Mana by fantasy |
| **Spell** | Weave / learned magic from scrolls & schools | AP + **Mana** |

**Resource law:** everything uses a resource; only Basics are AP-only. See [combat.md](combat.md).

Attacks, abilities, and spells shuffle into the **same draw pile** for that hero. Basic Attack and Basic Block are guaranteed buttons outside the deck; cards and gear may enhance, replace, or interact with them.

### Per-hero deck

- Each hero has: draw pile, hand, discard (and exhaust/consume piles as needed).
- Starting deck has **four** cards: two simple class cards plus two cards injected by starting equipment. It does not include the guaranteed Basics.
- Mid-run: add rewards, remove/cripple weak cards, fuse spells (spellcraft).

### Hand, draw, and retention (locked)

- Each hero normally refills their hand to **three cards** at the start of their turn. Alongside the always-available Basic Attack and Basic Block, this gives a small but meaningful tactical menu without a large starting deck.
- **Retain** means the card stays in hand at end of turn. Retained cards count against the next turn's normal hand refill, so retaining a strong answer trades fresh draw for certainty.
- Cards and gear may grant extra draw, retention, or a larger hand limit. These are valuable build effects, not baseline rules.
- The base hand limit is 3. The first content pack may raise it to at most 5 through explicit effects; further expansion requires an explicit design revisit.
- Basic Attack and Basic Block are actions, not hand cards, and cannot be retained or drawn.

### Learned-scroll persistence (locked)

- Learning a found scroll consumes that physical scroll. It cannot also be traded, extracted, or used as craft material. If its hero survives a successful Return, the learned card persists in that hero's personal deck.
- Every eligible scroll learned during a run becomes a permanent personal deck card when that hero survives successful Return. There is no arbitrary preservation quota in the first beta; deck growth itself creates a reliability tradeoff.
- Only a card explicitly marked temporary, one-fight, or ephemeral leaves the deck at its stated expiry. A learned scroll is never silently treated as run-only.
- Physical scrolls kept unlearned may instead be chested and returned to Haven for future use, extraction, or another hero.

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
- Gear may inject **universal weapon cards** with no school requirement; every hero can use them if they have the needed resource pool. Gear that injects a school-specific card still requires that school, and is blocked with an explanation if the hero does not know it.

## Parameters (locked targets)

| Param | Value | Notes |
|-------|-------|-------|
| Hand size | **3** | Per hero; gear/cards may increase it to a first-slice cap of 5 |
| Starting deck size | **4** | 2 class cards + 2 starting-gear injections |
| Mid-run comfort size | **~12–16** | Soft target; beyond this, thinning should matter |
| Play default | **Discard** | Exhaust only when tagged |
| Max spell load | Soft via mana & duplicates | No separate spell-slot loadout — deck is the limit |

## Edge cases

**Vertical-slice override:** the legacy equip lines below are superseded by [Embark and Loadout](embark-and-loadout.md). Equip, unequip, and party trade are allowed only at Haven, post-combat reward, Rest, Safe Craft, and waypoint/post-boss reward. They are never allowed during combat, ordinary movement, or Event resolution. Injected cards change only before the next combat.

- **Equip/unequip anytime outside combat** — injected cards are added/removed from that hero’s deck immediately when out of fight (enables party **gear trading** between nodes).
- **No mid-combat swaps** — loadout locked for the duration of a fight.
- Ephemeral cards (one-fight tokens) vs permanent deck adds.
- Deck removal is available only at selected Haven, craft, or rest opportunities and has a meaningful cost; it is not a free outside-combat action.
- Co-op: deck ownership is private to each hero/player, but allies see each other's **full hands** plus basic draw/discard counts for cooperative puzzle solving. Trading still happens in shared out-of-combat inventory UI.
- UI should show instance variance (mod lines / affinity) so duplicate names are readable.

## Content hooks

- Card definitions with tags (block, strike, weave, retain, **school**, exhaust, etc.)
- Class starter decks (two schools) + creation-roll tables
- Affix → card injection tables
- Cross-school reaction IDs referenced from spellcraft domain data

## Acceptance criteria

- [ ] A fight is playable with zero spells (attacks/abilities suffice)
- [ ] A spell-heavy hero still draws attacks sometimes (deck composition risk)
- [ ] Players understand Mana versus AP through the first readable combat; the vertical slice has no tutorial fight
- [ ] Exhaust cards are clearly marked; everything else discards
- [ ] Two same-named cards can differ in power/mods and remain distinguishable
