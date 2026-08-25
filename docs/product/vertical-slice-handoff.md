# Solo Vertical-Slice Handoff

**Status:** Build contract for the first playable loop  
**Last updated:** 2026-07-17
**Depends on:** [Build Readiness](build-readiness.md) and [Tech Decision](tech-decision.md)

Initial value bands and playtest practice: [Balance Reference](../systems/balance-reference.md).
Starter-card content under review: [Vertical-Slice Starter Kits](../content/classes/vertical-slice-starter-kits.md).
Crafting content under review: [Vertical-Slice Crafting Package](../content/crafting/vertical-slice-crafting.md).
Initial spell content: [First Scroll Pool](../content/spells/first-scroll-pool.md).
First expedition topology: [The Unlit Road](../content/expeditions/the-unlit-road.md).
Reward offers, no-cap vertical-slice possession, and chest rules: [Vertical-Slice Rewards and Protection Rules](../content/expeditions/vertical-slice-rewards.md).
First Haven economy and building actions: [First Haven Progression](../content/haven/first-haven-progression.md).
Post-return results, permanent growth, and chronicle flow: [Post-Return Haven Flow](../ux/post-return-flow.md).

## Objective

Prove that Nightfall's expedition loop is fun and emotionally legible:

> Name a fragile Haven, take a two-hero party into the Gloom, make visible risk/reward choices, gain temporary and lasting build power, defeat a boss to claim ground, then decide what hard-won value comes home.

## Player flow

1. Create/name a Haven with 10 lit pillars, a built Pillarhouse, and two playable core heroes: Vanguard and Aether Weaver.
2. First embark uses the **Vanguard + Aether Weaver** pair. Free party selection is deferred until additional playable classes exist.
3. Travel a short Band-1 graph. Each depth normally presents two choices; Combat and Rest are identifiable, Event is `?`, and detailed contents remain under fog of war.
4. The map offers routes to Combat, Event, Rest, and a Safe Craft node. It does not force every node choice.
5. Fight readable intent-driven encounters. A rare marked enemy may visibly carry an unknown exceptional item whose applicable effects help it in that combat.
6. Defeat the Delve boss by reading/disrupting its powerful telegraphed intent.
7. Claim a waypoint, use a small protected chest, receive the **Ember Vault blueprint**, choose whether to spend an Ember Shard, then take a short Return leg.
8. On Return, recover ordinary HP/resources, retain downed-hero injuries, bank protected/returned goods, and make **one** meaningful Haven decision.
9. On wipe, lose the expedition party and their carried gear/resources, snuff one pillar, preserve chest contents, and show the memorial/failure consequence.

## Combat contract

| Rule | Contract |
|------|----------|
| Timeline | Individual initiative: `(DEX × 2) + itemInitiative + seeded variance` |
| Party | Two heroes in first slice; no rows/grid/range |
| Turn | 3 AP per hero turn; hand refills to three |
| Resources | Mana/Stamina persist across the expedition. Each victorious combat restores 50% of each maximum; Rest, consumables, and explicit event outcomes provide additional recovery. |
| Growth | Expedition levels grant temporary stat points. Each surviving boss-clear hero earns one Wardyard-recorded permanent Leadership Point on Return; no respec. |
| Basics | Basic Attack and Basic Block are always-available 1-AP buttons outside the deck |
| Reliability | No ordinary accuracy/evasion/miss layer |
| Enemy intent | Each enemy always displays its next intent; it rolls/reveals a replacement immediately after acting |
| Conditions | Block, Exposed, Weakened, Burn, Poison, Stun, Guard; use the timing/stack laws in `combat.md` |
| Downed | A hero at 0 HP is downed; allies may revive them. All heroes down = wipe. A downed survivor gains a random stackable injury. |
| Card limits | No default cooldowns; use deck draw, discard, exhaust, and resources |

## Content minimums

| Content | First-slice requirement |
|---------|-------------------------|
| Playable classes | Vanguard and Aether Weaver, each with 2 class cards plus 2 starting-gear cards; 1–2 of those cards/items may be randomized within a controlled starter pool |
| Enemies | 4–6 readable Band-1 enemy templates and encounter packs |
| Boss | One boss with a visible, interruptible/disruptable major intent |
| Events | 3–4 polished events; at least one settlement-trace outcome |
| Craft | At least one Safe and one Risky recipe/outcome with exact disclosed odds |
| Gear | Starter gear, common drops, and a small exceptional-item carrier table |
| Haven | Pillarhouse, Cinder Forge, Quiet House, Wardyard at one functional tier |

## Persistence contract

- Gear recovered on a successful Return enters shared Haven inventory.
- Eligible scroll cards learned during an expedition become permanent personal cards for that survivor on successful Return. On a wipe, the hero and their learned cards are lost.
- An unlearned scroll may be used now, crafted, traded, carried, or chested for Haven knowledge later; learning it consumes that physical scroll.
- Gear, scrolls, and resources carried by a wiped expedition are lost unless chested/protected. The vertical slice has no carry-capacity system; a later inventory system may add limits.
- Haven Gloom has a run meter and a persistent residual. Every movement has an explicit cause.

## Haven decision contract

At the first successful Return, present several real needs but resource-budget only one:

- Construct a currently available core building.
- Treat a temporary injury at The Quiet House.
- Repair a snuffed pillar when applicable.
- Preserve/craft a valuable recovered item or scroll.

Pillarhouse starts built. Cinder Forge, Quiet House, and Wardyard are available from the start. The first boss gives the Ember Vault blueprint; the second boss gives The Wayfarer blueprint.

## Verification scenarios

1. A player can complete an expedition without casting a spell.
2. A player can see an enemy's major intent, choose a defensible response, and explain the outcome.
3. A player can take a Safe or Risky craft decision with exact known odds.
4. A marked enemy drops the same pre-rolled item that made it more dangerous.
5. A player can chest a valuable item, wipe on Return, and recover that chest later.
6. A player can save during combat, exit, resume, and receive the same deterministic result from the same intent sequence.
7. A successful Return changes the Haven, but does not allow every available upgrade.
8. A full-party wipe visibly removes a pillar and loses the expedition heroes.

## Explicit non-goals

- Co-op, cloud/OAuth/email player accounts, async Haven list/peek, or mixed-Haven expeditions. Local LAN profiles and founding a named Haven are in slice.
- Shops, Elites, Dire craft, long greed chains, alternative bands, and a full settlement hub
- Full art/audio production; UI must still be readable and tonally intentional
- Any feature that needs a second rules engine outside the deterministic simulation path
