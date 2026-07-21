# Spellcraft

**Status:** Draft  
**Last updated:** 2026-07-17  
**Related:** [cards-and-decks.md](cards-and-decks.md), [haven-buildings.md](haven-buildings.md), [economy.md](economy.md), [progression.md](progression.md), [../loops/run-structure.md](../loops/run-structure.md), [../content/classes/README.md](../content/classes/README.md)

Shared spell/ability budgets, scaling, school identities, and deferred Blood/summon guardrails: [Spell and Ability Framework](spell-and-ability-framework.md).

## Goal

**Vertical-slice scope override:** only Iron, Bastion, Aether, Ember, and unlearnable-yet-useful Umbra patterns appear in the first scroll pool. Safe Fuse, Safe Imprint, and Risky Overbind are the only craft operations in scope. Tide, Storm, Veil, Root, Pulse, Dire craft, co-op ownership, and broad reaction tables are future design.

Spells are unique every run and deeply modifiable — with a **sliding risk scale**. Soft tradeoffs are normal; hard curses and bricks exist for greed. **Holding a scroll is always a benefit** — never a dead item. **Schools** gate what a hero can learn; mixing known schools is where unexpected hybrids come from.

Spell patterns use the same deterministic procedural-forge law as gear: base pattern + school + form/modifiers + optional curse, all validated against the simulation effect grammar. See [../content/items/procedural-forge.md](../content/items/procedural-forge.md).

## Player-facing rules

**Vertical-slice persistence rule:** a scroll learned by a hero becomes a permanent personal deck card only when that hero survives Return. The physical scroll is consumed when learned; unlearned scrolls remain physical Haven assets. Full beta rationale and future retirement/deck-management hooks: [Post-Return Haven Flow](../ux/post-return-flow.md).

### Schools (learning gate)

Every spell/ability card carries a **school** tag. A hero may **learn a card into their deck only if they know that school**.

- Classes start with **two** schools; subclass opens a **third**. See [progression.md](progression.md) and [../content/classes/README.md](../content/classes/README.md).
- Scrolls of unknown schools are **not dead** — trade, craft fuel, extract, or hold for a party member who knows the school.
- A rare ruined-settlement / waypoint discovery can teach an additional school to an individual hero, expanding their learn and craft options beyond class/subclass schools.
- Martial “schools” (e.g. Iron, Bastion) follow the same learn gate as Weave schools so multiclass kits stay consistent.

### Long-term school catalogue (IDs locked; flavor polish later)

| ID | Name | Fantasy |
|----|------|---------|
| `iron` | Iron | Martial force, weapon arts, crushing strikes |
| `bastion` | Bastion | Block, wards, holding ground |
| `ember` | Ember | Heat, lantern-fire, burn |
| `tide` | Tide | Water, pressure, flow, soak |
| `storm` | Storm | Lightning, shock, sudden force |
| `veil` | Veil | Mist, shadow, evasion, obscure |
| `aether` | Aether | Weave residue, chaotic arcs |
| `umbra` | Umbra | Gloom-touched drain / corruption (dangerous) |
| `root` | Root | Fungal bind, thorns, slowing nature |
| `pulse` | Pulse | Vitality, blood, life-force |

Add schools later as domain data; keep IDs stable.

### Scrolls are multi-use assets

A scroll in the party’s possession can always be used for something valuable:

| Use | When | Benefit |
|-----|------|---------|
| **Combat / learn into deck** | During expedition | Add or upgrade a spell card for a hero **who knows the school** |
| **Crafting / fusion / upgrading** | Craft nodes, Cinder Forge, Ember Vault | Fuel fuses, mods, power-ups (risk ladder applies) |
| **Trade** | Out of combat | Pass to the hero/player who can use it |
| **Extract to Haven** | Special conditions (below) | Adds to Haven knowledge / stock for future runs |

Design law: **there is no “useless scroll.”** If you don’t cast it, you craft with it, trade it, or try to bring it home.

### Extracting scrolls to town (Haven knowledge)

Unlearned / physical scrolls follow the same **hybrid bank** rules as other chestable goods ([../loops/run-structure.md](../loops/run-structure.md), [map-and-nodes.md](map-and-nodes.md)):

1. **Waypoint chest** — deposit at the hub after Delve boss; chested scrolls **survive wipe** but stay locked at the waypoint until Return / later reclaim.
2. **Successful Return (or reclaim)** — when the scroll reaches Haven, it deposits into stock **and** unlocks **Haven knowledge** (Ember Vault catalogue).
3. **Mystery `??` events** — rare outcomes that let you send a scroll home early (risky tradeoffs possible).

Chested but not yet returned scrolls are **not** yet Haven knowledge — catalogue unlock waits until town arrival.

Carried (non-chested) scrolls are lost on wipe (unless an event said otherwise).

**Ember Shards** may also be used as premium craft / upgrade fuel (see [economy.md](economy.md)); spending one on craft consumes it — it cannot also restore a pillar.

### Learned vs unlearned (craft risk)

| State | Meaning |
|-------|---------|
| **Unlearned scroll** | Physical item you found this run (or not yet in Haven catalogue). Safer fuse material; also extractable. |
| **Learned (Haven / hero)** | Catalogue or deck knowledge — reshaping is harder (higher risk tier). |

Learning into a hero’s deck mid-run and extracting to Haven are related but not identical — depositing builds town memory; deck learning is that hero’s kit.

### Mana

- Casting spells costs **Mana** in addition to AP.
- Craft that raises power often raises mana cost or adds downside (soft tradeoff default).

### Fusion / modification

Players combine scrolls, bind mods, or fuse spells at craft nodes / Haven spell facility.

#### Cross-school reactions (groundwork)

When fusing **two components from different schools the crafter knows**, the result may trigger a **reaction recipe** instead of a plain damage hybrid.

| Example inputs | Reaction (illustrative) |
|----------------|-------------------------|
| Tide bolt + Storm bolt | **Stun / shock-soak** (control) where each alone was damage |
| Ember + Root | **Smolder bind** — DoT + slow |
| Veil + Umbra | **Smother** — obscure + chip corruption |
| Bastion + Ember | **Lantern ward** — block that burns attackers |

Long-term reaction-table design laws:

- Reaction table is **domain data** (`schoolA`, `schoolB`, `resultTags`, weights) — sparse at first, grow over time.
- Crafter must **know both schools** to get the reaction (otherwise normal fuse rules / soft tradeoffs only).
- Reactions still sit on the Safe / Risky / Dire ladder.
- Full creative crafting catalogue is future work; **tags + reaction hooks** ship as groundwork now.

#### Sliding risk ladder (design law)

| Attempt | Tier | Typical outcome |
|---------|------|-----------------|
| 2 unlearned scrolls | **Safe** | Stronger hybrid; soft tradeoffs common; almost never bricks |
| Scroll + learned spell | **Risky** | Power + occasional curse / instability |
| 3+ components stacked | **Dire** | Real brick / backfire / corruption chance |
| Fuse two already-learned spells | **Dire** | Chance to **forget** one; or birth a cursed hybrid |

**Ladder shape is locked.** Numeric odds are **domain values** (data), not sacred code constants — see [Tunable domain values](#tunable-domain-values-crafting) below.

### Vertical-slice operations

The first slice uses three named operations: **Safe Fuse** (two unlearned known-school scrolls create a hybrid card), **Safe Imprint** (an unlearned scroll adds a modest magical modification to gear), and **Risky Overbind** (a learned card/equipped item plus an unlearned scroll attempts a stronger permanent upgrade). Full first-slice recipes, odds, and curse language: [../content/crafting/vertical-slice-crafting.md](../content/crafting/vertical-slice-crafting.md).

### Tunable domain values (crafting)

All craft odds and costs live in a single balance table (future: `data/craftRisk.ts` or JSON). Designers/agents may retune as crafting becomes a bigger pillar **without** changing system rules.

#### Risk tiers (defaults — editable)

| `tierId` | When (matcher tags) | Soft tradeoff chance | Hard curse chance | Brick / forget chance | Notes |
|----------|---------------------|----------------------|-------------------|-----------------------|-------|
| `safe` | `unlearned+unlearned`, componentCount≤2 | high (e.g. 70%) | very low (e.g. 5%) | ~0–2% | Teaching tier |
| `risky` | `scroll+learned` | medium | moderate (e.g. 20%) | low (e.g. 8%) | Greed with warning |
| `dire` | `componentCount≥3` OR `learned+learned` | low–medium | high (e.g. 35%) | real (e.g. 25% brick **or** forget) | Must show failure modes in UI |

Percentages above are superseded for the vertical slice by the named operation tables in [vertical-slice-crafting.md](../content/crafting/vertical-slice-crafting.md). Future content may retune them; craft confirmation always shows exact odds for major outcomes as well as tier and failure categories.

#### Required domain fields (contract)

| Field | Purpose |
|-------|---------|
| `tierId` | `safe` \| `risky` \| `dire` |
| `matchers` | Rules that select the tier from craft inputs |
| `softTradeoffWeight` | Distribution of mana+/cooldown+/etc. |
| `hardCurseWeight` | Curse table picks |
| `brickChance` | Result destroyed / no upgrade |
| `forgetChance` | Applies when fusing learned+learned |
| `manaCostDeltaRange` | Soft power tradeoff bounds |
| `uiFailExamples` | Strings shown before confirm on Risky/Dire |
| `curseKind` | Per curse def: `soft` \| `hard` |
| `softCleanseCost` | Haven sink table by building tier |

Ember Vault upgrades may **modify** these values (e.g. −brickChance on `risky`, cheaper soft cleanse) via named modifiers, not one-off code branches.

### Soft vs hard outcomes

- **Soft:** +magnitude, +mana cost, +cooldown, –block efficiency; mild curse tags.
- **Hard:** hurts caster/allies on play; random target; “forget” removes a known spell; brick destroys the craft result; severe curse tags.

Players should **see risk tier** before confirming a craft.

### Curse cleanse (locked)

Curses are tagged `soft` or `hard` in domain data (tunable list).

| Kind | Cleanse? |
|------|----------|
| **Soft curses** | **Yes** — can be healed/cleansed at Haven (Ember Vault or related building) for a resource sink. Not always free; may be incomplete on low building tier (domain-tunable). |
| **Hard curses** | **No** — permanent on that card/instance. Live with it, overwrite via another fuse, scrap, or extract consequences as designed. |

UI must show curse kind (`soft` healable vs `hard` forever) on the card and before craft confirm when a hard curse is possible.

## Parameters

| Param | Default | Notes |
|-------|---------|-------|
| Risk UI tiers | Safe / Risky / Dire | Stable IDs; odds in domain table |
| Extract / chest | Waypoint chest safe from wipe; Haven knowledge on Return/reclaim | Locked shape |
| Early extract | `??` mystery events | Rare |
| Craft currency | See economy.md | Scrolls + Emberglass; Ember Shard = premium fuel |
| Balance ownership | Domain data table | Retunable as craft grows |
| Cross-school reactions | Domain reaction table | Sparse must-ship; expand later |

### Solo vertical-slice craft scope

The first playable build includes **Safe** and **Risky** attempts only, with exact disclosed odds. **Dire** remains a designed future tier and should not be needed to prove the early craft loop.

## Edge cases

The co-op ownership case below is future-only; it has no vertical-slice UI or simulation requirement.

- Co-op: who owns the scroll? Trade out of combat; extract is party decision (leader confirm).
- Deliberate curse chasing for power builds? **Yes — supported.**
- Extract vs spend: using a scroll in a fuse consumes it — can’t also deposit that instance.

## Content hooks

- Scroll definitions / **school tags**
- Cross-school **reaction** table
- Curse table
- Craft node types
- `??` extract event briefs
- Ember Vault catalogue / stock UI

## Acceptance criteria

- [ ] Player always has a sensible sink for a scroll they don’t want to cast (including wrong school)
- [ ] Learn UI blocks unknown schools and explains why
- [ ] Waypoint chest teaches “deposit to survive wipe; knowledge unlocks at Haven”
- [ ] First Safe craft teaching moment makes its odds and soft tradeoffs clear; no scripted tutorial is required
- [ ] At least one cross-school reaction is teachable in must-ship (e.g. Tide+Storm via party)
- [ ] Dire craft shows explicit failure modes before confirm

## Open questions

- Can Haven catalogue teach a school pattern without the hero knowing the school (for town craft only)?
