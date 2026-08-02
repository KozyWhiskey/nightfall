# Visual Style Bible

**Status:** Locked visual direction — production assets pending
**Last updated:** 2026-08-01  
**Authority:** Applies the locked [Content Direction](../content/content-direction.md) to Build 1 art. It does not define mechanics, content IDs, or UI behavior.

## Visual promise

Nightfall is a world after both kinds of light have failed. Its images should make the player feel that civilization survives through deliberate maintenance: a tightened copper fitting, a shield repaired for one more crossing, a remembered name stitched into cloth. Hope is warm, local, and built. The Gloom is broad, cold, and erosive.

The look combines three lenses with different jobs:

1. **Twilight gothic — emotion.** Solemn ruins, vows, memorials, quiet dread, and dignified grief. Horror should leave room for empathy.
2. **Ashen relic-craft — human material language.** Soot-black iron, cracked crystal, hammered copper, leather repairs, ward stitching, and Way-lantern infrastructure. Every useful object should imply who maintained it and why.
3. **Corrupted wild frontier — expedition ecology.** Fungal woods, warped anatomy, smoke-frayed wildlife, wet bark, root pressure, and abandoned civic craft being reclaimed by hostile nature.

The target is painterly illustration with disciplined shapes: tactile and atmospheric at source size, immediately legible when reduced. It is not photoreal, anime, pixel art, clean MMO fantasy, or ornamental concept art that collapses in play.

## Composition and value

- Read silhouette first, role second, material story third, surface detail last.
- Use two or three large value masses per combatant. Fine cracks, runes, and straps may enrich those masses but cannot define them.
- Preserve negative space around weapons, limbs, horns, smoke-fray, and magical apertures.
- Put the brightest accent at the decision-relevant feature: ward focus, rupture sac, exposed lantern core, or signature weapon—not automatically in both eyes.
- Figures must remain distinct against near-black blue-green UI surfaces without requiring a halo.
- Full-body standees must still identify at roughly 72 px wide; heads and primary role cues must survive at roughly 32 px wide in the initiative timeline.

## Palette

The client tokens are the baseline presentation context, not a mandate to fill every asset with every accent.

| Function | Value | Use |
|---|---|---|
| Night | `#0d171b` | Primary UI/background context |
| Deep teal-black | `#122428` | Twilight ambient fill and cool shadow separation |
| Ash | `#d8d7ca` | Bone, pale cloth, readable neutral highlights |
| Muted ash | `#9ba8a1` | Weathered midtones |
| Brass | `#a98245` | Aged fittings and non-magical warm metal |
| Ember | `#d99a4e` | Lantern-fire and deliberate human defiance |
| Aether | `#7da9bd` | Unstable broken-solar magic |
| Gloom | `#776c91` | Enemy contamination and entropic pressure |
| Blood | `#a85d52` | Injury, danger, and restrained organic horror |
| Imbued teal | `#7ac4a8` | Rare inner-life accent; use sparingly |
| Legendary coral | `#e87858` | Signature-story accent, never a generic rarity wash |

Do not use hue as the only identifier. School identity also requires shape, motion, and material cues.

## School grammar

| School | Shape and material language | Light behavior |
|---|---|---|
| Iron | Blunt wedges, straight cuts, rivets, compressed mass, disciplined repetition | Dull edge catches; little or no internal glow |
| Bastion | Closed plates, nested shields, rings, knots, stable symmetry | Contained blue ward planes and even pulses |
| Aether | Branching fractures, interrupted circles, asymmetric chains, cracked crystal | Pale blue-white arcs that jump across gaps |
| Ember | Lantern cages, vents, apertures, wick lines, copper containment | Warm cores with controlled spill and soot-dark edges |
| Umbra | Hooks, inward spirals, borrowed seams, deliberate wounds | Restrained violet light that appears drawn into the vessel |
| Gloom | Eroded boundaries, smoke-fray, false repetition, missing anatomy | Purple-grey contamination that swallows nearby contrast |

Umbra is dangerous power used by people; Gloom is hostile dissolution. They may share violet ancestry but must not share the same contour language.

## Character and creature direction

### Heroes

- Heroes are maintained rather than pristine. Repairs are competent and purposeful, not random visual noise.
- Vanguard reads through a low center of gravity, broad protected torso, shield line, and lantern-oath construction.
- Aether Weaver reads through a narrower silhouette, travel-worn layered cloth, a deliberate casting line, and visibly stabilized fractures rather than generic wizard ornament.
- Faces should carry resolve, fatigue, and personhood. Avoid anonymous helmet-only designs for both starter heroes.
- Build 1 uses precomposed starter-loadout standees. Modular armor is a later proof, not a requirement of the initial designs.

### Enemies

- Begin with the trace of what was lost: an animal's hunting form, a traveler's posture, a remembered voice, or a civic lantern's purpose.
- Memory horror leads; body distortion supports it. Gore is not the primary differentiator.
- Each Band-1 enemy needs one unmistakable role cue: Hound speed, Husk mass, Imp priority, Chanter support, Spore impending rupture.
- Lantern-Smother must visually depend on the fallen Way-lantern. It is not a generic fog demon.
- Smothering Shroud is a separate urgent target and must read as a forming action, not a smaller duplicate of the boss.

## Gear and rarity

Every item begins with a credible medieval/fantasy vessel and a visible binding story. A plain sword with colored glow is insufficient.

- **Salvaged:** useful, patched, soot-stained, uneven, and restrained.
- **Imbued:** one faint inner-life cue and slightly more intentional repair.
- **Rare:** deliberate geometry, cleaner construction, and a controlled ember/brass accent.
- **Legendary:** a unique silhouette or story-bearing construction. Legendary identity cannot be created by adding glow alone.

Build 1 should illustrate each base vessel once. Rarity and procedural affixes remain primarily UI/text information, with restrained overlays where they preserve recognition of the base vessel.

## Lighting and texture

- Soft top-left key light; cool twilight ambient fill; restrained warm bounce near active Ember sources.
- Metal is worn and weighty, crystal is fractured rather than jewel-clean, leather is repaired rather than decorative.
- Gloom can erase edges, but never the edges required to understand target shape or combat role.
- Transparent standees contain no painted backdrop, frame, floor rectangle, typography, rarity badge, intent symbol, or baked gameplay information.

## Approved anchor findings

The 2026-08-01 anchor review approved the shared material, tonal, silhouette, and lighting direction. The generated pass remains exploratory rather than runtime-ready. Production work must carry forward these corrections:

- Reduce surface micro-detail by roughly 25–35% so shape and role survive before ornament.
- Lift ash-value separation where dark figures meet the near-black UI; do not solve readability with a painted halo.
- Treat clean background removal as a technical production step. Prompted flat backdrops are not accepted as reliable transparency.
- Keep Lantern-Smother and Smothering Shroud as separate runtime assets. The relationship study validated their connection but was too dense at combat and initiative sizes.
- Lead Lantern-Smother with the failed civic purpose of the Way-lantern; Gloom corruption is the consequence, not the whole concept.

## Exclusions

Avoid modern guns, industrial science-fiction language, steampunk excess, bright heroic polish, candy color, chibi proportions, anime rendering, pristine plate armor, generic medieval loot, comedy poses, floating MMO particle clutter, and purple fog used as a substitute for an idea.

## Anchor validation record

These four subjects were reviewed as one family in the client context:

1. `heroes/vanguard` — human construction and starter gear.
2. `enemies/gloomfang_hound` — corrupted frontier anatomy.
3. `enemies/lantern_smother` plus a Shroud relationship study — memory-horror boss language.
4. `items/hewn_sword` — base-vessel and bound-magic language.

The 2026-08-01 review approved the visual direction, not the individual files. Contact-sheet testing at source, battlefield, and initiative sizes established the production corrections above. Every runtime asset still requires individual review on the real UI background and in grayscale under the [Technical Asset Contract](technical-asset-contract.md).
