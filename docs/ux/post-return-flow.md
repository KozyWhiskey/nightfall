# Post-Return Haven Flow

**Status:** Accepted vertical-slice flow  
**Last updated:** 2026-07-19  
**Related:** [Vertical-Slice Handoff](../product/vertical-slice-handoff.md), [First Haven Progression](../content/haven/first-haven-progression.md), [Spellcraft](../systems/spellcraft.md)

## Goal

Returning should feel like people arriving home after a dangerous journey, not a chain of administrative popups. The flow makes survival, loss, hero growth, discoveries, and the next Haven decision emotionally legible.

## Successful Return sequence

### 1. Homecoming

A short, skippable arrival beat states only the major emotional facts:

- Which named heroes returned and which are injured.
- Waypoint claimed, settlement trace discovered, and blueprint recovered.
- Escort/survivor/event consequences that reached Haven.
- Pillar state, including any repair already performed with an Ember Shard.

No resource management or permanent choice occurs on this beat.

### 2. Return Ledger

One consolidated results screen replaces a chain of loot popups.

| Section | Contract |
|---|---|
| Recovered | Returned gear, unlearned scrolls, materials, currencies, and released chest contents enter Haven state. |
| Consumed / spent | Learned scrolls, crafted inputs, spent resources, and spent Ember Shards are recorded plainly. |
| Hero condition | Ordinary HP/Mana/Stamina recover; Injured, Wounded, and Drained persist. |
| Expedition growth | Expedition Levels reset to 1 and their temporary stat choices fade. |
| Leadership | Each surviving boss-clear hero receives one pending Leadership Point. |
| World change | Waypoint claim, discoveries, blueprints, and event flags are recorded. |

The player can open detail views, but the first view is a compact human-readable recap rather than a raw transaction log.

### 3. Chronicle

The Ledger ends with a brief journey chronicle: the route taken, dangers faced, choices made, what was recovered, and how the Haven changed. It should acknowledge event decisions such as the Last Courier rather than reducing them to hidden flags.

#### Optional OpenRouter narrative enhancement

The simulation writes a deterministic `chronicleFacts` record at Return: run ID/seed, hero names, visited nodes, encounter outcomes, injuries, event choices, claimed waypoint, chest outcome, recovered items, and Haven decision.

- A local template renderer always produces the recap from these facts.
- An optional OpenRouter request may turn the same facts into richer prose for beta testing.
- The generated prose is cached by `runId`, `promptVersion`, and model configuration; it is never re-used as a source of game truth.
- Failure, timeout, opt-out, or unavailable network always falls back to the local recap.
- The model may not create mechanics, loot, consequences, rules, or canon facts not present in `chronicleFacts`.

This is the appropriate first live-AI use: narrative presentation after deterministic resolution. Procedural items, spells, and outcomes remain governed by the validated content grammar and simulation.

### 4. Haven decision board

Show all meaningful needs at once, with costs, benefits, and what each choice postpones.

| Need | First-boss-return state |
|---|---|
| Cinder Forge | Affordable; unlocks armory, Commission Vessel, and Safe Imprint. |
| Quiet House | Affordable; unlocks injury care and immediately grants one free treatment. |
| Wardyard | Affordable; requires immediate permanent Leadership assignment for each pending point. |
| Ember Vault | Blueprint recovered but not functional in this slice. |
| Pillar repair | Available only when a pillar is snuffed and an Ember Shard is available. |
| Save supplies | Always allowed; preserve materials for a future project. |

If the Wardyard already exists, Leadership assignment occurs immediately after the Return Ledger and before this board. If it does not exist, the points remain pending until the player constructs it; construction then resolves every pending assignment immediately.

### 5. Resolve the chosen action

- **Cinder Forge:** open the armory; inspection/equipment changes are optional and no craft is forced.
- **Quiet House:** choose the recipient of its construction-time free treatment.
- **Wardyard:** immediately assign each pending Leadership Point to VIT, DEX, STR, or INT. No respec and no deferral after choosing this building.
- **Pillarhouse:** choose whether to spend an Ember Shard for a pillar repair.
- **Save supplies:** return directly to the Haven Hub.

### 6. Haven Hub

The player is free to review survivors, permanent leader attributes, returned gear, scrolls, discoveries, and the claimed waypoint. There is no automatic re-embark prompt.

## Learned-scroll persistence beta rule

When a hero learns an eligible scroll during an expedition, the physical scroll is consumed immediately. If that hero survives the successful Return, its learned card becomes a permanent part of that hero's personal deck for future expeditions.

- All successfully learned eligible scrolls persist in the initial beta; no arbitrary preservation quota is imposed.
- The character's deck naturally becomes less reliable as it grows, creating an early balancing pressure alongside its increased options.
- On a party wipe, the heroes and their personal learned cards are lost.
- Unlearned scrolls instead return as physical Haven assets and can be learned later, crafted, or preserved.
- Future content may add character retirement, inheritance, or deck-management buildings if long-lived leaders become too strong or their decks become too bloated.

### Beta watch signals

Track permanent deck size per surviving hero, preserved learned-scroll count, win/wipe rate by completed expedition, and the proportion of turns using Basic actions. These reveal whether preservation creates exciting leadership growth, deck bloat, or runaway power before a retirement system is designed.

## Acceptance criteria

- [ ] A player can explain what survived, what was spent, and what became permanent without opening multiple screens.
- [ ] The Homecoming/Chronicle acknowledges at least one event decision in a run where one occurred.
- [ ] Wardyard construction forces its permanent Leadership choices immediately.
- [ ] OpenRouter narrative failure has no effect on the resolved run or the ability to continue.
- [ ] A learned scroll visibly becomes permanent only after successful Return; an unlearned scroll remains a physical asset.
