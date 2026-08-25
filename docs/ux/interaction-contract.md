# Build 1 Interaction Contract

**Status:** Accepted Build 1 UX contract
**Last updated:** 2026-07-19
**Authority:** UI presents simulation snapshots and submits commands. It never calculates a gameplay outcome.
**Related:** [Expedition State Machine](../systems/expedition-state-machine.md), [Combat Simulation Contract](../systems/combat-simulation-contract.md), [Embark and Loadout](../systems/embark-and-loadout.md), [Post-Return Haven Flow](post-return-flow.md)

## Purpose

This is the player-facing counterpart to the simulation contracts. Every Build 1 view has a known state source, a bounded set of legal commands, and a readable explanation of consequences. Animations, modal layout, and art direction may evolve without changing these rules.

## Interaction law

1. Render from an immutable simulation/Haven snapshot plus derived view data; never from local UI-only game state.
2. Enable only commands legal at the current revision. Disablement explains why when the reason is useful.
3. Submit every game-changing input through `{ commandId, expectedRevision, type, actorId?, payload }`.
4. On acceptance, replace the displayed snapshot with the returned revision and present resolved facts. On a stale or invalid response, retain the authoritative snapshot and show its reason code in plain language.
5. Confirmation is required only for irreversible or wipe-risking actions. Ordinary legal map choices and combat actions act immediately.

## View and command map

| View | Must show | May submit | Confirmation / persistence |
|---|---|---|---|
| Haven Hub | Haven name; lit/max pillars; Haven Gloom; building availability/cost; survivors; stored holdings; claimed waypoint count | `openEmbark`, `openBuilding`, `repairPillar`, `acknowledgeMemorial` | Pillar repair confirms its Ember Shard spend; accepted Haven action autosaves. |
| Embark | Fixed Vanguard/Weaver pair; all nine equipment slots; committed gear/scrolls/supplies; current holdings; wipe-risk warning; route start | `equipItem`, `unequipItem`, `learnScroll`, `commitEmbark`, `cancelEmbark` | Embark confirmation shows committed possessions and creates the run. |
| Leg Map | Current node; legal outgoing edges; visible node category; fogged-but-known category where applicable; Run Gloom and next band; route progress | `chooseMapEdge` | Edge choice acts immediately, adds +5 Gloom, and autosaves at node entry/resolution. |
| Combat | Complete initiative timeline; active actor; AP/HP/Mana/Stamina; hand and all card costs; Basics; supply button/one-per-combat state; visible enemy intents; draw/discard/exhaust counts; condition/tooltips | `engageCombat`, `playCard`, `useBasicAttack`, `useBasicBlock`, `useSupply`, `endTurn` | Opening Engage acknowledges the timeline before the first resolved action. Combat actions act immediately afterward. Only irreversible single-use supply consumption receives a brief, dismissible warning on first use, not a blocking modal. |
| Reward | Automatic bundle; all fully identified alternatives; marked-carrier item; equip/deck impact; current expedition holdings | `chooseReward`, `leaveReward`, legal `equipItem`, `learnScroll` | A chosen reward is final for that offer. Leaving an offer is final after confirmation if it includes a Rare-or-better item. |
| Event | Exact cost, consequence, target, and probability categories for each option; current relevant resources | `chooseEventOption` | Risky/irreversible choice confirms once with its stated outcome range; the event resolves and autosaves. |
| Rest | Base `-12` Run Gloom, any disclosed modifier, effective before/after value, and Tend Wounds/Resupply/Keep Watch effects | `chooseRestOption` | One choice, immediate resolution, autosave. |
| Safe Craft | Exact inputs, output, odds, failure result, and expedition risk | `chooseCraftRecipe`, `cancelCraft` | Craft result is irreversible and confirms before consuming inputs. |
| Waypoint | Claimed waypoint/trace; permanent blueprint; carried boss rewards; Ember-Shard rite eligibility; three chest slots; Return alternatives | `spendEmberShardRite`, `sealChestItem`, `chooseReturnEdge` | Shard spend and chest seal each confirm; neither can be undone this run. Return edge acts immediately. |
| Return / Wipe results | Named survivors/losses; all recovered/lost/chested facts; pillar/Gloom change; permanent discoveries; next step | `continueToHaven` | Pure presentation: terminal simulation already resolved and autosaved. |
| Post-Return Haven Flow | Homecoming, consolidated ledger, chronicle, pending Leadership Points, competing building choices | `assignLeadership`, `buildBuilding`, `saveResources`, `continueToHaven` | Leadership is permanent and confirms its attribute; construction confirms cost. |
| Haven Succession | Fallen Haven memorial; new founding location; inherited world knowledge; explicitly lost settlement state; 3/10 pillars and emergency cache | `continueToHaven` | Pure presentation after the idempotent succession transaction. |

## Required information hierarchy

### Combat

The action area prioritizes, in order: active turn/AP, next enemy turns and intents before this hero acts again, hero resources/conditions, then playable cards and Basics. An enemy intent must identify target domain, exact magnitude when known, and timing; icons never stand alone. The timeline makes a late Vanguard's next-turn defensive timing visible rather than asking the player to infer it.

### Map and risk

The map always shows current Run Gloom, the `+5` cost of every selected edge, and the next threshold's effect. Fog of war may hide the precise node identity but cannot disguise a revealed category or hide an already-determined outcome after entry. A player can identify the route to the boss, their current leg, and whether a waypoint chest is available.

### Loot and permanence

Every choice screen distinguishes three ownership states with labels, not color alone:

- **Carried — at risk:** expedition-held and lost on wipe.
- **Sealed at waypoint:** safe from wipe but unavailable until Return/reclaim.
- **Haven-held:** safe, reusable stock.

The UI labels whether a scroll will be consumed to learn, whether its card becomes permanent only after successful Return, and which item cards a gear change adds to a hero's deck.

### Failure

A wipe results view separates immediate loss (party and unsealed holdings), protected chest contents, permanent world facts already secured at the waypoint, and the pillar/Gloom consequence. On final-pillar failure, the succession view additionally separates inherited knowledge from lost settlement state; it must never imply that stored gear or heroes escaped.

## Confirmation policy

| Action | Confirmation |
|---|---|
| Commit Embark | Yes: list all Haven-held possessions entering wipe risk. |
| Explicit in-world abandonment | Yes: state that it is a wipe-class loss and will snuff a pillar. |
| Spend Ember Shard / seal chest item | Yes: identify irreversible spend or lock. |
| Learn a scroll | Yes: identify physical-scroll consumption and successful-Return permanence condition. |
| Craft with consumed inputs | Yes. |
| Assign Leadership Point / build building / repair pillar | Yes: permanent choice or resource spend. |
| Card, Basic action, supply, map edge, ordinary reward, Rest, Event | No extra confirmation after initial event-risk disclosure. |

## Accessibility and presentation minimums

- Color is never the only carrier of intent, rarity, condition, ownership state, or Gloom pressure.
- No critical numerical effect exists only in a tooltip. Tooltips can explain terms, not conceal rules.
- All target choices are keyboard-reachable and names are available to assistive technology.
- Motion may decorate resolution but must not be the only evidence that a command succeeded; a readable fact log accompanies state change.
- Build 1 is solo. UI has no ownership, ally-hand, lobby, or co-op-presence assumptions; its entity list and timeline remain collection-based for later compatibility.

## Acceptance criteria

- [ ] From any screen, a player can identify their current state, the legal next decisions, and the irreversible cost before choosing it.
- [ ] UI test fixtures can render every listed view from a recorded snapshot without a live simulation session.
- [ ] A repeated/stale command cannot visually duplicate a reward, craft, Shard spend, or building result.
- [ ] A player who wipes after a boss can distinguish permanent waypoint knowledge, sealed chest items, and lost carried boss loot.
