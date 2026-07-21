# Enemies

**Status:** Draft  
**Last updated:** 2026-07-16

## Design laws

1. Every enemy has a **role** and **readable intents**.
2. Packs teach synergies (buffer + dps, exploder timers, tanks).
3. Region skins change fantasy; roles stay teachable.
4. **Carried loot:** eligible enemies are spawned with their actual drop bound; combat-relevant affixes (including initiative) can apply. Same initiative formula as heroes — see [../../systems/combat.md](../../systems/combat.md).

## Roles

| Role | Job |
|------|-----|
| `dps` | Pressure HP |
| `buffer` | Empower allies |
| `exploder` | Delayed big hit / death rattle |
| `tank` | Soak / protect |
| `disruptor` (optional) | Discard / AP tax / curse |

## Band-1 ecology families

Whisperwood / Frontier content should distribute enemies across three readable families:

| Family | Fantasy | Typical combat role |
|--------|---------|---------------------|
| **Frayed beasts** | Gloom-corrupted wildlife such as Gloomfang Hounds; fur and bodies fray like smoke | Fast DPS, pack pressure |
| **Sorrowful remnants** | Shattered Husks and memory echoes of those lost to the Gloom | Tank, slow pressure, Strain / despair effects |
| **Fear-born parasites** | Mire Imps and fungal whisper-things born from psychic residue | Disruptor, curse, intent manipulation |

## Prototype templates to reinterpret

Gloomfang Hound, Mire Imp, Mist Chanter, Gloom Spore, Moss Bulwark, Shattered Husk — useful as Band 1 (Frontier) starting points, not locked names.

## Pack guidelines

| Pack type | Size | Notes |
|-----------|------|-------|
| Skirmish | 2–3 | Early |
| Ambush | 3–4 | Synergy teach |
| Elite | 1–2 elites + support | |
| Boss | Boss + optional adds | Torch-relevant |

## Content checklist

- [x] Initial Band-1 (Frontier) vertical-slice roster: [band-1-frontier.md](band-1-frontier.md) (5 templates)
- [ ] Broader Band-1 roster (≥6 templates)
- [ ] Band 2–3 (Mid / Deep) distinct templates
- [ ] Intent art language shared with UX readability doc
