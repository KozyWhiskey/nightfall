# Art Prompt Library

**Status:** Draft — validate through anchor generation  
**Last updated:** 2026-08-01  
**Authority:** Prompt wording supports the [Visual Style Bible](visual-style-bible.md) and [Technical Asset Contract](technical-asset-contract.md). Those documents win if a prompt conflicts.

## Prompt construction rule

Use one subject per production generation. Multi-subject batches are for exploration/contact sheets only and cannot be accepted as final separated assets.

Every production prompt uses this order:

```text
PROJECT + ASSET ROLE
Nightfall, a dark turn-based roguelite expedition RPG. Create [asset type] for [runtime use].

CONTENT IDENTITY
Asset ID: [content ID].
Subject: [approved one-line fantasy].
Combat/player role: [role].
Lost purpose or human story: [memory/material story].

VISUAL DESIGN
Primary silhouette: [large shape read].
Primary materials/anatomy: [two to four controlled cues].
Decision-relevant focal feature: [feature].
School/Gloom grammar: [shape, material, and light behavior—not color alone].

COMPOSITION
[asset-specific framing, canonical direction, canvas, occupancy, and safe area].
Must remain identifiable at [required runtime sizes].

STYLE LOCK
[current Style Lock block].

EXCLUSIONS
[asset-specific failure modes plus shared exclusions].
```

Do not ask the generator to invent lore, mechanics, IDs, rarity, equipment eligibility, or combat effects. Supply those from accepted content.

## Style Lock v1

```text
Nightfall visual language: twilight gothic emotion, ashen relic-craft material culture, corrupted wild-frontier horror. Painterly illustration disciplined by bold silhouettes and two or three large value masses; tactile, solemn, mature, and readable at game scale. Soot-black iron, cracked crystal, hammered copper, repaired leather, ward stitching, Way-lantern construction, restrained bound-magic light. Soft top-left key light with cool twilight ambient fill. Palette designed against #0d171b and #122428, with sparse #d99a4e Ember, #7da9bd Aether, #776c91 Gloom, #a85d52 blood, and ash neutrals. Hope is maintained and local; horror begins with lost memory or purpose before bodily distortion. No photorealism, anime, pixel art, chibi proportions, modern guns, steampunk spectacle, pristine MMO armor, generic medieval props, comedy posing, text, frames, badges, or painted background.
```

This block is a baseline, not the whole prompt. It cannot replace asset-specific silhouette, story, material, and readability requirements.

## Enemy standee formula

```text
Nightfall combat standee for enemies/[definitionId].
Subject: [name] — [approved one-line fantasy].
Role: [DPS/tank/disruptor/support/exploder/boss target].
Lost trace: [animal, traveler, voice, remembered word, civic lantern purpose].
Silhouette: [role-defining large shape].
Corruption: [one primary and one secondary Gloom expression].
Focal feature: [decision-relevant cue].
Full-body 3/4 combat stance on a 31:36 transparent canvas, canonically facing screen-right; the client will mirror hostile units. Consistent ground line, clear negative space, no floor or scenery. Readable at 86x115 and 72x96; head and primary cue recognizable at 32x38.
[STYLE LOCK]
```

Lantern-Smother prompts must describe the fallen Way-lantern as part of the boss construction. Smothering Shroud receives its own entity prompt and must look like a forming urgent action rather than a miniature Smother.

## Hero standee formula

```text
Nightfall combat standee for heroes/[classId].
Subject: [name/class] — [approved class fantasy].
Starter loadout: [accepted main hand and offhand].
Silhouette: [class-defining large shape].
Human story: [oath, practice, or maintained equipment detail].
Focal feature: [shield line, casting fracture, or other role cue].
Precomposed Build 1 starter-loadout standee, not a paper-doll layer. Full-body 3/4 combat stance on a 31:36 transparent canvas, canonically facing screen-right. Consistent ground line and clear weapon negative space. Readable at 86x115 and 72x96; head and class cue recognizable at 32x38.
[STYLE LOCK]
```

## Item illustration formula

```text
Nightfall inventory illustration for items/[baseId].
Base vessel: [approved name and category].
Mechanical identity to express without symbols or text: [approved granted card/passive].
Human purpose: [repair, route, vow, or former civic use].
Material construction: [medieval/fantasy form plus relic-craft binding].
Baseline rarity: Salvaged.
Single isolated object on a 1:1 transparent canvas, filling approximately 72–84% of the frame. Strong outer contour, controlled internal glow, no hand, character, scenery, frame, badge, label, or rarity gem. Readable at 128x128, 64x64, and 32x32.
[STYLE LOCK]
```

## Exploration prompt rule

An exploration sheet may request three or four clearly separated variants of one asset. Label variants outside the generated image in the review document, not inside the artwork. Once a direction is selected, regenerate or clean it as a single production asset.

## Revision language

Revise one variable at a time where possible:

- “Preserve pose, framing, palette, and materials; change only [silhouette issue].”
- “Preserve approved silhouette; simplify internal detail for the 72 px test.”
- “Preserve all design decisions; separate [weapon/limb] from the torso with negative space.”
- “Reduce magical spill; keep the glow confined to [named binding feature].”

“Same as above” is not acceptable manifest provenance. Save the complete resolved prompt for every candidate and approved asset.
