# First-Expedition Balance Walkthrough

**Status:** Approved initial balance baseline — requires playtest validation
**Last updated:** 2026-07-19
**Purpose:** Validate the first Unlit Road expedition as a connected system before changing isolated card, enemy, or economy numbers.

**Related:** [Unlit Road](../content/expeditions/the-unlit-road.md), [Starter Kits](../content/classes/vertical-slice-starter-kits.md), [Frontier Enemies](../content/enemies/band-1-frontier.md), [Lantern-Smother](../content/bosses/lantern-smother.md), [Gloom, Light, and Rest](../systems/gloom-and-stress.md)

## Method and assumptions

This is not playtest data. It is a deliberately conservative paper model that exposes whether current rules can produce the intended choices. Implementation playtests must record actual turns, damage, draws, and remaining resources before any number is treated as final.

The model assumes:

- A fresh Haven: 10 lit pillars, 0 Haven Gloom, 0 starting Run Gloom.
- The fixed starter Vanguard and Aether Weaver, with no random starter modifier, exceptional item, learned scroll, or consumable unless noted.
- Standard encounters resolve in two to three party rounds when the player makes sensible target and Block choices. A boss resolves in three to five rounds.
- In a standard fight, the Vanguard spends roughly 4-8 Stamina and the Weaver spends roughly 3-7 Mana before the 50%-maximum victory recovery. Defense sometimes replaces a damaging action.
- Visible intent lets a competent player prevent roughly half of ordinary incoming damage through focus, Block, Guard, Weakened, and killing a threat before its next turn. Multi-enemy/support fights cost more HP.
- No event creates an undisclosed result. Where a route takes a corruption/greed result, the model explicitly adds its shown `+8 Run Gloom`.

The values below are **ranges**, not promises. They answer whether a route arrives at the boss in a plausible decision state, not whether every seed must resolve identically.

## Current route math

Every traversed edge adds 5 Run Gloom. A complete successful route has eleven edges: Haven to Combat 1, seven route/approach edges through the boss, then three waypoint/Return/Home edges.

| Route shape | Edges | Base Run Gloom | Rest change | Explicit risky event | Expected Return Gloom before boss-failure effects |
|---|---:|---:|---:|---:|---:|
| Cautious | 11 | 55 | -12 | 0 | 43 |
| Typical | 11 | 55 | -12 | +8 | 51 |
| Combat-forward | 11 | 55 | 0 | 0 | 55 |

The Lantern-Smother's failed Shroud response adds 8 Run Gloom. This moves a cautious run to 51 and a combat-forward run to 63. It remains especially consequential on the Return leg, even though the combat-forward route already meets the boss at the first pressure threshold.

## Scenario A — cautious path

**Route:** Combat 1 -> Early Event -> Combat 3 -> Rest -> Safe Craft -> Deep Event -> Combat 7 -> Boss -> Waypoint -> Return Event -> Haven.

**Promise tested:** The player prioritizes reliable survival and sees the boss after three standard encounters, but gives up multiple reward choices and marked-carrier chances.

| Checkpoint | Expected state | Why it matters |
|---|---|---|
| After Combat 1 | Both resource pools generally return to maximum; roughly 3-8 total party HP lost. | The opener teaches intent without immediately taxing the run. |
| After Combat 3 | Vanguard around 70-85% HP; Weaver around 45-70% HP; both specialist pools commonly 70-90% full after victory recovery. | The Chanter/Hound/Husk pack should make the Weaver's health and the next Rest choice matter. |
| Rest | **Tend Wounds** is normally the attractive choice. Run Gloom falls from 20 to 8. | This confirms Rest is not only a resource reset. |
| Before boss | Run Gloom 28; no Gloom-touched boss. Vanguard/Weaver begin around 55-80% / 55-80% HP and roughly 60-80% specialist resources. | A cautious route is allowed a credible, not guaranteed, first-boss attempt. |
| After boss | If the Shroud is destroyed, Return Gloom is normally 43. If not, it is 51. | The Shroud consequence remains relevant even on a safer approach. |

**Reading:** This route has the right survival identity and remains below the first Gloom threshold at the boss.

## Scenario B — typical route

**Route:** Combat 1 -> Combat 2 -> Combat 3 -> Rest -> Combat 5 -> Deep Event (take a disclosed `+8` greedy result) -> Combat 7 -> Boss -> Waypoint -> Return Event -> Haven.

**Promise tested:** The player pursues several rewards and makes one visible risk bargain, then must choose what the single Rest actually repairs.

| Checkpoint | Expected state | Why it matters |
|---|---|---|
| Before Rest | After three fights, Vanguard commonly has 60-80% HP / 70-90% Stamina; Weaver commonly has 40-70% HP / 60-85% Mana. Run Gloom is 20. | The choice should be real: heal the Weaver or enter the second half with depleted specialist resources. |
| Rest choice | **Tend Wounds** preserves HP but leaves later resources under pressure; **Resupply** enables Combat 5/7/boss power but carries a fragile Weaver forward. | Neither option should be universally correct. |
| After greedy Deep Event | Run Gloom rises from 18 to 26 after the event choice, then continues through the approach. | The player sees and accepts the debt, rather than receiving an opaque penalty. |
| Before boss | Run Gloom about 36; resources depend on Rest choice. Tend tends toward 40-65% specialist resources; Resupply tends toward 60-85%. | The boss remains just below the first Gloom threshold, so recovery choice still dominates. |
| Return | Run Gloom is 51 before a boss failure effect, so the Return fight is Gloom-touched if the player chose that leg. | The greedy event changes the run's ending, even if it does not change the boss. |

**Reading:** This is the strongest current route shape. The Rest choice, held rewards, and boss preparation create distinct pressure. Its main weakness is that the Gloom consequence arrives late.

## Scenario C — combat-forward route

**Route:** Combat 1 -> Combat 2 -> Combat 3 -> Combat 4 -> Combat 5 -> Combat 6 -> Combat 7 -> Boss -> Waypoint -> Return Combat -> Haven.

**Promise tested:** More fights, better loot, and marked-carrier chances are tempting, but the party deliberately skips its only earlier Rest.

| Checkpoint | Expected state | Why it matters |
|---|---|---|
| After Combat 4 | Vanguard usually retains 55-75% HP and 60-80% Stamina; Weaver usually retains 35-65% HP and 50-75% Mana. | Attrition is visible, but 50% victory recovery avoids an immediate Basic-only collapse. |
| After Combat 6 | The Spore/Chanter/Hound fight can leave one hero around 25-55% HP and both specialist pools around 35-65%, unless a strong reward or supply has been used. | This is the intended point of greed: high carrier chance and Rare weight versus real boss risk. |
| Before boss | Run Gloom 40; the boss is Gloom-touched. Resources commonly 25-55%; HP commonly 25-60%. | The route is risky in HP, resources, and Gloom exactly when the player chooses to pursue Combat 6. |
| Return Combat | Run Gloom reaches 50, keeping the return pack Gloom-touched. A failed Shroud makes it 58. | The player pays Gloom both at the boss and on the Return. |

**Reading:** The route is appropriately greedy in HP, resource, and Gloom terms, assuming Combat 5/6 resolve at the upper end of their intended duration. If ordinary encounters resolve in two rounds, 50% victory recovery will largely erase resource attrition; if they resolve in three rounds, the route produces the intended low-resource boss entry.

## Boss check — Lantern-Smother

The boss presents 110 HP plus an 18-HP Shroud on the intended response cycle. The party's unmodified high-output round is roughly 35-45 damage before defense and card-draw variance:

- Vanguard: Iron Cut plus a tactical card or Basic action, usually 13-18 damage when defense is not required.
- Aether Weaver: Aether Bolt, Aether Lash, and/or Ember Spark/Burn, usually 17-25 damage when defense is not required.

This implies:

- A party that spends most turns attacking can kill the boss in roughly three to four rounds.
- The 18-HP Shroud is killable in one decisive party cycle, as intended, but requires giving up meaningful boss damage.
- A player who breaks the Shroud receives an Exposed boss and may end the fight quickly; this is an earned tempo reward, not a problem by itself.
- If the party arrives with low resources, it can answer the Shroud with Basics/Block but risks taking the fight to five rounds and seeing the repeated cadence.

**Initial conclusion:** Do not change boss HP or Shroud HP before an instrumented playtest. The current 110/18 pair is internally plausible; it is sensitive to actual deck draw and how much defense an initiative timeline demands.

## Findings and recommended tests

### 1. Run Gloom sharpens the greed route at the boss

Travel is locked at `+5` per edge. The maximum-combat no-Rest route enters the boss at 40 Run Gloom, making it Gloom-touched; cautious and typical routes remain below that threshold unless they take additional risky bargains. This preserves an understandable risk/reward distinction.

### 2. 50% victory recovery must be tested against actual fight length

Early two-round fights can spend less than five Mana/Stamina, which a 50%-maximum recovery fully replaces. Three-round fights create the intended attrition.

**Do not retune yet.** Instrument the first ten internal runs for: resource spent, recovery received, resource at next-combat start, number of Basic actions, and boss-entry resources. If more than 70% of ordinary victories return both heroes to full specialist resources, test a 40% recovery variant before increasing card costs.

### 3. The Rest decision is healthy, but Keep Watch needs a clear trigger

Tend Wounds and Resupply naturally compete. Keep Watch is attractive only after a downed hero, high Gloom Strain, or a known dangerous next pack. That is appropriate for a third option; it must not be falsely tuned to equal pick rate.

### 4. First encounter is two Gloomfang Hounds

Combat 1 is locked as two Gloomfang Hounds. It is intentionally easy and teaches initiative, focus, Block, and ordinary hostile intent before the Husk introduces Block and Weakened in later content.

### 5. First instrumentation set

For every run, record: route, each node, Run Gloom after each edge/choice, combat rounds, HP loss, Mana/Stamina spent and recovered, supply use, downs/injuries, reward taken, boss Shroud outcome, and Return outcome. Review all three route classes separately; aggregate win rate alone will conceal whether greed is enticing or merely punishing.

## Locked initial test parameters

1. Travel adds `+5` Run Gloom per edge.
2. Combat 1 is two Gloomfang Hounds.
3. Victory recovery remains 50% of each maximum Mana/Stamina. The listed instrumentation trigger governs any future retune.
