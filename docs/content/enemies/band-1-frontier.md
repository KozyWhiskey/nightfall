# Band 1 Enemy Roster — Frontier

**Status:** Initial vertical-slice content pack  
**Last updated:** 2026-07-17  
**Region:** Whisperwood / Frontier ecology  
**Related:** [Enemy Design](README.md), [Balance Reference](../../systems/balance-reference.md), [Combat](../../systems/combat.md)

## Design goal

Frontier enemies teach readable intent response before they become complex. Every enemy has a strong silhouette, one job, and a small intent pool. The Gloom's horror priority is memory first, body second: even a simple monster should feel like a life or place being broken into something wrong.

All numbers are initial data values to simulate and playtest against the Vanguard/Aether Weaver starter party.

## Roster at a glance

| ID | Enemy | Family / role | HP | DEX | Teaches |
|----|-------|---------------|---:|---:|----------|
| `gloomfang_hound` | Gloomfang Hound | Frayed beast / DPS | 20 | 5 | Fast pressure, focus fire, Block |
| `shattered_husk` | Shattered Husk | Sorrowful remnant / tank | 30 | 1 | Weakened, enemy Block, target priority |
| `mire_imp` | Mire Imp | Fear-born parasite / disruptor | 16 | 4 | Exposed and fragile high-priority targets |
| `mist_chanter` | Mist Chanter | Sorrowful remnant / support | 22 | 2 | Support enemy priority and team defense |
| `gloom_spore` | Gloom Spore | Fear-born parasite / exploder | 14 | 0 | Kill-before-telegraph burst |

DEX feeds the shared initiative formula. No enemy uses hidden accuracy or an untelegraphed special rule.

## Gloomfang Hound

**One-line fantasy:** A starving wolf whose smoke-frayed hide cannot decide whether it is animal, mist, or hunger.

| Intent | Weight | Effect |
|--------|-------:|--------|
| `lunge` | 3 | Deal 5 physical damage to the lowest-HP hero. |
| `raking_bite` | 2 | Deal 3 physical damage and apply Exposed for one turn. |
| `circle` | 1 | Gain 4 Block; the next damaging intent gains +2 damage. |

**Encounter role:** The first enemy. Two Hounds make Block and target focus immediately understandable without punishing a new player.

## Shattered Husk

**One-line fantasy:** A traveler who died too slowly; every movement carries the weight of a memory they no longer possess.

| Intent | Weight | Effect |
|--------|-------:|--------|
| `griefswipe` | 3 | Deal 6 physical damage to a random hero. |
| `mourning_blow` | 2 | Deal 4 physical damage and apply Weakened for one turn. |
| `hollow_guard` | 2 | Gain 8 Block. |

**Encounter role:** A durable threat that makes the player decide whether to spend high-value damage now or remove the more fragile support/disruptor beside it.

## Mire Imp

**One-line fantasy:** A small, warped knot of fear that giggles with voices stolen from people who did not come home.

| Intent | Weight | Effect |
|--------|-------:|--------|
| `whisper_bolt` | 3 | Deal 4 Gloom damage to the lowest-Block hero. |
| `doubt` | 2 | Deal 2 Gloom damage and apply Exposed for one turn. |
| `skitter` | 1 | Gain 5 Block. |

**Encounter role:** Fragile but dangerous. It teaches that a low-HP enemy can deserve immediate attention because its status effects amplify the rest of the pack.

## Mist Chanter

**One-line fantasy:** A drowned voice moving through the fog, singing the names of the dead until its allies remember how to hurt.

| Intent | Weight | Effect |
|--------|-------:|--------|
| `dirge` | 3 | All living allies gain 4 Block. |
| `borrowed_fury` | 2 | The next damaging intent of each living ally gains +2 damage. |
| `lament` | 1 | Deal 3 Gloom damage to all heroes. |

**Encounter role:** The first support enemy. It makes focus order a visible tactical problem without inventing a large buff/status system.

## Gloom Spore

**One-line fantasy:** A swollen fungal sac repeating one remembered word until it bursts into black mist.

| Intent | Weight | Effect |
|--------|-------:|--------|
| `spore_shot` | 2 | Deal 4 Gloom damage to a random hero. |
| `swell` | 1 | Telegraphed setup: the next `rupture` cannot be replaced by another intent. |
| `rupture` | forced after `swell` | Deal 7 Gloom damage to **each** hero in the party, then destroy this enemy. |

**Encounter role:** A clear focus-fire test. `Swell` must be unmistakable in the UI; the player can kill, Stun, or defend against the coming burst.

## Teaching encounter sequence

| Encounter | Pack | Lesson |
|-----------|------|--------|
| 1 | 2 × Gloomfang Hound | Initiative, Block, focused damage |
| 2 | Mire Imp + Gloomfang Hound | Fast, fragile disruption and Exposed target priority |
| 3 | Mist Chanter + Gloomfang Hound + Shattered Husk | Support priority, Guard, and resource spending |
| 4 | Shattered Husk + Mire Imp | Attrition and removing a fragile disruptor |
| 5 | Gloom Spore + Mist Chanter + Gloomfang Hound | Answer `Swell` → `Rupture` while managing support pressure |

Elite and shop encounters are intentionally absent from the vertical slice. The Lantern-Smother boss follows these lessons with a larger, multi-turn major intent.

## Content constraints

- Standard packs should normally take 3–5 minutes, not become endurance fights.
- Every intent needs an icon, a plain-language label, a visible magnitude, and a targeting cue.
- No Band-1 enemy uses a hidden immunity, miss chance, or unreadable status.
- Carried exceptional gear remains a rare overlay: it may alter an enemy's stats/intent impact, but must be visibly marked and drop exactly as previewed by the combat.
