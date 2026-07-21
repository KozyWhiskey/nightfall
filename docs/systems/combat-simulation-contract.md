# Combat Simulation Contract

**Status:** Accepted Build 1 simulation contract
**Last updated:** 2026-07-19
**Authority:** [Decision Register](../product/decision-register.md), [Combat](combat.md), and [Current Product Scope](../product/current-scope.md)

## Purpose

Define deterministic, UI-independent combat behavior. The simulation receives validated player commands and produces facts/snapshots; it never depends on React, animation timing, or network state.

This contract defines combat lifecycle, initiative, stats, damage, condition timing, commands, deterministic RNG, and save/replay behavior for Build 1.

## Combat creation and initiative timeline

Combat begins from the current expedition state: each hero retains current HP, Mana, Stamina, injuries, permanent cards, equipment, and approved temporary expedition effects. The encounter seed determines enemy composition, carried drops, and all combat-local random values.

### Setup order

1. Create hero, enemy, and future-compatible summoned-entity records for the encounter.
2. Apply equipped-item stats, affixes, and injected cards; derive every combatant's current DEX and `itemInitiative`.
3. For each combatant, draw one `initiativeVariance` from the named deterministic `combatInitiative` stream using the validated `combat.initiative_variance` tuning definition (Build 1: `1..4` inclusive).
4. Calculate and persist the displayed initiative value:

   ```text
   initiative = (DEX x 2) + itemInitiative + initiativeVariance
   ```

5. Sort combatants by initiative descending. A tie resolves by stable combatant creation order / ID, never by an additional hidden random roll.
6. Create the fixed combat timeline from that order, then reveal every living enemy's first intent.
7. Apply start-of-combat effects, including Gloom-touched enemy-group Block and Strain. These effects do not alter the already-created timeline in Build 1.
8. Give the first timeline combatant its turn.

The UI shows the complete ordered timeline before the first action: portrait/silhouette, initiative value, current condition markers, and enemy next intent. It also highlights the enemy turns that occur before each hero's next turn, so late-acting defense is never a blind guess.

### Timeline rules

- The timeline loops from its final combatant back to its first; initiative variance is rolled once per combat, not once per round.
- In the vertical slice, initiative does not change mid-combat. Future speed effects, summons, or reordering must calculate an explicit insertion/re-sort rule rather than mutating turn order silently.
- A Downed combatant remains in the timeline for deterministic ordering but its turn is skipped. A dead/destroyed enemy is removed from visible future turns.
- Every normal enemy intent is visible before it resolves. After an enemy acts, the simulation resolves its action, then immediately rolls and publishes that enemy's next intent before advancing the timeline.
- The same formula and ordering law applies to heroes, enemies, and future summons. There is no hero phase, enemy phase, or hidden priority layer.

## Approved combat lifecycle

### Turn order

For every combatant in timeline order:

1. **Start turn:** clear that combatant's Block; resolve start-of-turn effects; check Stun/downed state.
2. **Hero turn:** refill hand to three, resolve start-turn triggers, then allow actions until the player ends the turn or has no legal action.
3. **Enemy turn:** resolve its visible intent. Immediately roll and reveal its next intent.
4. **End turn:** resolve end-of-turn effects, then expire durations that end on that combatant's turn.

The active hero has 3 AP. Playing a card or supply validates target, AP, resource, timing, and ownership before any cost is paid. Invalid commands change nothing.

### Condition timing

| Condition | Exact rule |
|---|---|
| Block | Clears at the start of its owner's next turn, except a Gloom-touched initial Block layer clears at the start of the owner's second turn. |
| Exposed | `+25%` damage received until the end of the target's next completed turn. |
| Weakened | `-25%` outgoing damage until the end of the target's next completed turn. |
| Burn | Each stack deals 2 damage at target end-of-turn, then loses one duration. Each stack lasts 2 target turns initially. |
| Poison | Future-ready: same stack structure as Burn, but damage at start-of-turn. No Build 1 content uses it. |
| Stun | Skips the target's next complete turn; cannot stack. |
| Guard | Redirects direct targeted damage from the guarded hero to the guarding hero; does not redirect party-wide or untargeted damage. Expires at the start of the guarding hero's next turn. |
| Strain | Hero starts the affected next combat with `-1 AP`; clears when that combat ends. |

### Downed, victory, and loss

- At 0 HP, a hero becomes Downed immediately.
- A Downed hero cannot act or be normally targeted; only explicit revival effects can target them.
- Enemies ignore Downed heroes when choosing targets.
- A Downed hero cannot take further damage in Build 1.
- When the last enemy falls, combat ends immediately. Apply victory recovery, award a deterministic injury to each Downed survivor, clear combat-only state, then enter rewards.
- When all heroes are Downed, the expedition immediately becomes a wipe. No post-combat recovery or reward resolution occurs.

## Stats, damage, and mitigation

### Starting attributes and derived pools

**Numeric authority:** [Vertical-Slice Tuning](../content/expeditions/vertical-slice-tuning.md) supplies the Build 1 class profile and initiative-variance values. The table below is a formula reference mirror, not a simulation constant.

| Hero | VIT | DEX | STR | INT | Base HP | Base Stamina | Base Mana |
|---|---:|---:|---:|---:|---:|---:|---:|
| Vanguard | 4 | 3 | 4 | 1 | 22 | 6 | 2 |
| Aether Weaver | 4 | 5 | 2 | 4 | 12 | 2 | 6 |

```text
maxHP       = classBaseHP + (VIT x 3)
maxStamina  = classBaseStamina + STR
maxMana     = classBaseMana + INT
initiative  = (DEX x 2) + itemInitiative + seededVariance
```

| Hero | Starting HP | Starting Stamina | Starting Mana |
|---|---:|---:|---:|
| Vanguard | 34 | 10 | 3 |
| Aether Weaver | 24 | 4 | 10 |

Each temporary or permanent point has the same derived effect: `+1 VIT` gives 3 maximum HP; `+1 DEX` gives 2 initiative; `+1 STR` gives 1 maximum Stamina and 1 physical-card damage; `+1 INT` gives 1 maximum Mana and 1 spell damage.

### Damage formula

Each damage card stores a baseline. The formula below yields the displayed starter-card result at starting attributes.

```text
physical raw damage = cardBaseDamage + STR + flat bonuses
spell raw damage    = cardBaseDamage + INT + flat bonuses

final damage = max(0, floor(rawDamage x outgoingModifier x incomingModifier))
```

Block absorbs final damage before HP is reduced.

| Card | Formula | Starter result |
|---|---|---:|
| Vanguard Basic Attack | `1 + STR 4` | 5 |
| Iron Cut | `5 + STR 4` | 9 |
| Shield Bash | `0 + STR 4` | 4 |
| Weaver Basic Attack | `1 + STR 2` | 3 |
| Aether Bolt | `7 + INT 4` | 11 |
| Ember Spark | `0 + INT 4` | 4 |
| Aether Lash | `2 + INT 4` | 6 |

### Modifier and mitigation order

1. Calculate raw card damage.
2. Add flat bonuses from gear and card effects.
3. Apply the attacker's outgoing modifier; Weakened is `x0.75`.
4. Apply the target's incoming modifier; Exposed is `x1.25`.
5. Round down once.
6. Let Block absorb damage.
7. Apply remaining damage to HP.

No critical hits, evasion, armor rating, resistances, or miss chance exist in Build 1. Physical, Aether, Ember, and Gloom are visible content tags but share the same mitigation pipeline.

### Special cases

- Burn is fixed 2 damage per stack at target end-of-turn. It does not scale from INT after application. Exposed affects Burn; Weakened does not.
- Direct damage bypasses Block and ignores Exposed/Weakened. Ash Tonic's self-damage is direct.
- Healing cannot exceed maximum HP. Fractional healing rounds up; Tend Wounds heals `ceil(maxHP x 0.40)`.
- If an equipment/stat change lowers a maximum below current Mana or Stamina, clamp the current value down immediately. Increasing a maximum does not refill it.
- Damage never becomes negative.

## Effect resolution, targeting, and commands

### Targeting

Every card and intent declares its targeting rule.

| Target rule | Meaning |
|---|---|
| `self` | Acting combatant. |
| `ally` / `enemy` | One explicitly selected living valid target. |
| `allAllies` / `allEnemies` | All living members of that side. |
| `allCombatants` | All living combatants. |
| `lowestHpHero` / `lowestBlockHero` | Deterministic enemy selector; ties use stable entity ID. |
| `randomLivingHero` | Uses the named combat-target RNG stream. |
| `guardedAlly` | The hero protected by a specific Guard link. |

There are no rows, range, or hidden targeting restrictions. Downed heroes are invalid targets except for explicit revival effects.

### Ordered effects

A card, Basic action, supply, or enemy intent owns an ordered effect list. Effects resolve in listed order.

1. Validate and pay costs once.
2. Validate and snapshot legal targets.
3. Resolve each effect in listed order. A multi-target effect resolves targets in stable timeline order.
4. If an effect downs or destroys a target, later effects aimed at that target do nothing unless a future effect explicitly supports downed/destroyed targets.
5. Move the used card to discard or Exhaust according to its definition.

An invalid command pays no cost and changes no state. Ember Spark, for example, deals calculated Ember damage first and applies Burn only if the target remains in combat.

### Condition application

| Condition | Application rule |
|---|---|
| Block | Additive; no cap initially. |
| Exposed / Weakened | Do not stack; reapplication refreshes expiry to the target's next completed turn. |
| Burn / Poison | Each application adds independent duration-tracked stacks; initial soft cap is 10 stacks per condition per target. |
| Stun | Does not stack; reapplication has no effect unless future card text explicitly permits refresh. |
| Guard | Creates a source-to-protected-hero link. If several Guards exist, the most recently applied valid Guard redirects first. Redirected damage cannot bounce through another Guard. |

### Player command envelope

Every player input uses this validated command envelope:

```text
{
  commandId,
  expectedRevision,
  type,
  actorId,
  payload
}
```

Build 1 combat commands are `playCard`, `useBasicAttack`, `useBasicBlock`, `useSupply`, and `endTurn`.

Validation runs in this order:

1. Combat revision equals `expectedRevision`.
2. Combat is active and it is the actor's turn.
3. Actor is alive, not Stunned, and has AP.
4. The card/supply exists and is available.
5. Targets are legal.
6. AP, Mana, Stamina, and party supply-use limits are sufficient.

On success, increment revision and emit resolved facts for presentation. On failure, return a stable reason code and mutate nothing. This is the same command path for local solo, save/resume, and future co-op.

## Deterministic RNG, save/resume, and replay

### Named RNG streams

Every run begins with one root seed. The simulation derives isolated named streams from it and saves each stream state independently.

| Stream | Owns |
|---|---|
| `map` | Route topology, fogged node identity, and regional variation. |
| `encounter` | Encounter-pack selection and enemy spawn composition. |
| `combatInitiative` | Per-combat initiative variance. |
| `combatIntent` | Enemy intent rolls. |
| `combatTarget` | Random valid combat targets. |
| `combatDeck` | Card draw-pile shuffles and reshuffles. |
| `loot` | Reward offers, marked carriers, rarity, and item generation. |
| `craft` | Safe/Risky recipe outcomes. |
| `event` | Event outcome rolls and event-specific target selection. |
| `injury` | Downed-survivor injury assignment. |

No gameplay code may use `Math.random()`. A draw in one stream must never change outcomes in another; adding an event roll cannot change combat initiative or a marked-item drop.

### Save boundaries and state

Autosave after every meaningful resolved boundary: Embark; travel/node resolution; accepted combat command; combat victory/loss; reward/event choice; craft result; Haven action; and Return resolution.

An active-run save contains:

```text
schemaVersion
contentVersion
runId
rootSeed
namedRngStreamStates
revision
havenSnapshotReference
expeditionMapState
currentNode / pendingDecision
expeditionHoldings
heroSnapshots
combatSnapshot, if active
acceptedCommandLog
```

A combat snapshot contains combatants, current HP/resources, conditions, ordered timeline, current timeline cursor, active AP, card-instance draw/hand/discard/exhaust piles, enemy intents, supply-use count, and combat revision. Reloading restores that exact state.

### Replay and versioning

A deterministic replay consists of an initial Haven/run snapshot, root seed and named stream states, content version/hash, and ordered accepted command log. Replaying those commands against the same content version must produce the same revisions and resolved event log.

- Compatible save changes use explicit migrations.
- An incompatible schema/content change must never silently reinterpret an active run.
- If no valid migration exists, preserve the save and report that it cannot yet resume; do not overwrite or corrupt it.

### Command idempotence

Each accepted command records `commandId`, sequence, `expectedRevision`, resulting revision, `resolvedEventHash`, and the original result/facts required to return it after reload. A duplicate `commandId` returns its original result rather than resolving twice. This protects solo retries and future host/client transport alike.

### AI boundary

Optional OpenRouter Chronicle prose receives only already-resolved `chronicleFacts`. It cannot consume gameplay RNG, issue commands, modify a save, or determine mechanics, loot, or canon.
