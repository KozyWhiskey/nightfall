# Band-1 Enemy Lineup Audit

**Status:** Passed — no blocking repaint required
**Date:** 2026-08-03
**Scope:** `gloomfang_hound`, `shattered_husk`, `mire_imp`, `mist_chanter`, `gloom_spore`

The deterministic [lineup sheet](../../art/source/reviews/band_1_enemy_lineup_audit_v1.png) preserves each `992 × 1152` master’s authored occupancy, mirrors every enemy into its runtime screen-left orientation, and compares the roster on both required combat fields plus grayscale at contract sizes.

Lineup sheet SHA-256: `EBC49376F67FE364CE923FE70A789D4838EEF175165084C397D5EA55C0D3915A`.

## Outcome

| Enemy | Visible height | Primary role cue | Result |
|---|---:|---|---|
| Gloomfang Hound | 55.6% | Low forward hunting line and long horizontal corruption trail | Pass; speed reads before surface detail |
| Shattered Husk | 89.7% | Broad bowed human mass, guard arm, and planted burden | Pass; unmistakable tank silhouette |
| Mire Imp | 67.7% | Low triangular crouch, pale throat, and projecting casting hand | Pass; priority disruptor remains distinct from the Spore |
| Mist Chanter | 89.7% | Tall narrow conducting stance, raised palm, and pale voice-bellows | Pass; support role is the roster’s clearest vertical gesture |
| Gloom Spore | 60.8% | Overpressured orb, diagonal scar cadence, and four-root star base | Pass; impending rupture survives initiative size |

## Cross-roster findings

- **Scale hierarchy passes.** Husk and Chanter share human height but oppose each other through width, posture, and arm rhythm. Imp and Spore remain meaningfully smaller; the Hound stays lowest and widest.
- **Silhouette hierarchy passes.** No pair shares the same dominant contour: horizontal beast, bowed wedge, crouched triangle, conducting column, and rooted orb.
- **Value hierarchy passes.** All five use soot/peat masses plus a restrained pale role cue. Purple-grey Gloom supports family cohesion but is not the sole identifier.
- **Memory-horror provenance passes.** The Hound retains an animal trace, the Husk a burdened traveler, the Imp stolen voices, the Chanter a funeral-cantor posture, and the Spore a lost trail-marker fragment.
- **Family overlap is controlled.** Mire Imp and Gloom Spore share root material, as expected for fear-born parasites, but their locomotion, mass, focal marks, and negative space do not collide.
- **Timeline reuse passes.** Each full-body standee remains recognizable at `32 × 38`; dedicated busts or focal-crop metadata are not warranted for Build 1.

## Non-blocking watch items

- Gloomfang Hound and Mire Imp remain technically passed candidates pending explicit reviewer approval; the audit does not promote them automatically.
- Gloom Spore’s base art communicates stored pressure, but the forced `Swell → Rupture` sequence must continue to rely on its authoritative intent label and telegraph treatment. Future VFX may decorate that state but must not become its only evidence.
- If later color grading reduces the pale focal marks, rerun this sheet before changing any individual asset; local brightening could otherwise break the shared value hierarchy.

## Decision

Accept the five-standee Band-1 lineup as a coherent production set. Do not commission timeline busts. Preserve current scale relationships and proceed to remaining reviewer approvals or `ART-04` item-art integration.
