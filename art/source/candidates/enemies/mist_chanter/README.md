# Mist Chanter Production Candidate

**Date:** 2026-08-03  
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool  
**Status:** Candidate v1; integrated and technically verified, reviewer approval pending

## Files

| File | Role |
|---|---|
| `mist_chanter_candidate_chroma_v1.png` | Immutable accepted revision on chroma field |
| `mist_chanter_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `mist_chanter_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/enemies/mist_chanter.png`](../../../../masters/enemies/mist_chanter.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/enemies/mist_chanter.webp`](../../../../../packages/client/public/art/enemies/mist_chanter.webp) — lossless transparent `496 × 576` WebP.

## Art-direction revision

The first built-in generation established the correct conducting pose and shoulder-yoke silhouette, but was rejected because its stacked dark throat cavities read as skull/rib anatomy and its costume drifted toward ornate necromancer shorthand. A single precise edit preserved the pose, yoke, tabs, hands, ribbons, framing, and field while replacing the face/throat with an erased face plane and three sealed resonant membranes and reducing costume microdetail. Only the accepted revision was copied into the project.

## Post-processing and QA record

- Generated against the approved Shattered Husk and Smothering Shroud masters as rendering/material and shape-language references only; neither reference was treated as an edit target.
- Removed the accepted revision's generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#0aed14`; extraction produced `1,052,439 / 1,573,230` transparent pixels and `13,307` partially transparent pixels.
- Cropped to alpha bounds and proportionally framed the Chanter on the required `992 × 1152` master without stretching.
- Final alpha bounds: `(184, 50)–(807, 1083)`; top safe area `4.34%`; side safe areas `18.55% / 18.65%`; ground line `93.92%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP (`144,080` bytes).
- Automated fringe scan found `43` green-dominant master pixels above alpha `8`; `7` exceed alpha `64`, with maximum alpha `168`. The runtime derivative has `17`, all at alpha `46` or lower. No visible green edge appears on either required field color or the checkerboard.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. The tall conducting stance, separated hands, sealed pale voice-bellows, yoke, and three name-tabs remain readable at the appropriate contract sizes.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments with the Chanter-specific `Dirge` acting callout. Nine Chanter images decoded from the `496 × 576` WebP, all hostile presentations use the required horizontal mirror, and the page has no horizontal overflow.
- Only the client was started for this review. The fixture is presentation-only; a host-backed combat run was not claimed or required for this candidate gate.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Accepted chroma source | `7776C58FDD36AE6777E95699D7E4CDEFD908CE6BEAF2A16F3E61E9BD39F32E63` |
| Alpha extraction | `F2C9070B43FC7A2418167649EB0C4618FC35438FBA7E5CB3E6EC4F2A7FFBBB70` |
| Transparent PNG master | `B581291B70A97BF3B962D8EC016DDD97B7490EE9458D10B5C588373CB6B9C5D4` |
| Runtime lossless WebP | `5D3AB0DD499DEE22D01649B36CBC87D7AA37F4CF8AC5DD587E512DC7C78CC8B9` |

## Exact initial prompt

```text
Use case: background-extraction
Asset type: NIGHTFALL production-candidate Band-1 enemy combat standee
Input images:
- Image 1 is the approved Shattered Husk master and a rendering/material reference only. Match its broad painterly planes, restrained soot-and-ash palette, worn frontier construction, solemn memory horror, and sparse purple-grey Gloom seams. Do not copy its massive wedge torso, pack frame, bowed pose, heavy arms, face, or tank silhouette.
- Image 2 is the approved Smothering Shroud master and a shape-language reference only. Borrow only its disciplined inward-pulling curves, pinched membrane rhythm, and controlled purple-grey value grouping. Do not include its copper ring, trapped spark, floating veil body, boss scale, or composition.

Primary request: Create exactly one Mist Chanter for NIGHTFALL: “a drowned voice moving through the fog, singing the names of the dead until its allies remember how to hurt.” It is a Band-1 sorrowful-remnant support enemy that grants Block, empowers allied attacks, and occasionally laments across the whole party. It must read immediately as a dangerous battlefield supporter—not as a generic robed mage, priest, banshee, or ghost.

Lost trace and subject: a tall, narrow adult frontier funeral-cantor remnant, waterlogged but fully corporeal, reconstructed from a weather-dark travel coat, long layered mourning cloth, and a few blank worn copper name-tokens sewn into one collar sash. The former human posture survives as a dignified upright stance, but the head is tipped slightly back and the face has been smoothed into one quiet ash plane with no eyes or open mouth. The drowned voice has migrated into the upper chest and throat: three stacked pale ash membranes form a closed resonant bellows or choir-fold, suggesting many names being sung without literal mouths, faces, text, teeth, or gore.

Support silhouette and action language: tall vertical silhouette, narrow shoulders, long split coat, planted feet, and two clearly separated conducting arms. The screen-right arm is raised with an open palm and long fingers in a firm sustaining gesture; the screen-left arm crosses low and outward as if drawing a protective measure around unseen allies. A rigid broken cantor’s shoulder-yoke rises behind one side of the neck and carries exactly three short blank copper name-tabs, creating one unmistakable asymmetric support profile. The figure is neither bulky nor fragile-looking; it feels composed, deliberate, and tactically important.

Voice and corruption language: two opaque attached ribbons of wet mourning cloth curve from the collar/yoke back into the torso, forming an incomplete enclosing oval like a broken choir stave. Sparse desaturated purple-grey Gloom appears only in recessed throat folds, selected coat seams, and the inside edges of those attached ribbons. Contours are gently erased at the lower coat hem, but remain opaque and attached. No detached fog, aura, floating particles, translucent smoke, water splash, slime, or fungus.

Production readability: use two major dark value masses plus the pale throat membranes and raised hand. Reduce surface microdetail by roughly 40%. Preserve strong negative space between both arms and torso and between the split coat and legs. Lift ash separation on the throat, smooth face plane, raised palm, shoulder yoke, and shins. The tall stance, conducting arms, and pale throat must read at 72x96; the vertical silhouette, raised palm, and pale chest mark must survive at 32x38.

Style/medium: painterly dark-fantasy creature illustration with broad authored brush planes, disciplined game-readable silhouette, twilight-gothic memory horror, and corrupted frontier material weight. Sorrowful, mature, tactile, and restrained; not photorealistic or glossy 3D.

Composition/framing: exactly one complete full-body humanoid enemy in a neutral support-casting 3/4 stance, canonically facing screen-right. Tall 31:36 standee composition with consistent ground line near 94% canvas height, at least 4% clear space above and 6% on each side. Entire head, yoke, tabs, hands, coat, and boots fully separated from every canvas edge. No dramatic foreshortening, action lunge, levitation, or floor interaction.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. The background must be one uniform color with no gradient, texture, floor plane, vignette, atmospheric haze, shadow, reflection, or lighting variation. Do not use #00ff00 or similar green anywhere in the Chanter.

Lighting/mood: soft top-left key, cool twilight fill, no halo. The pale throat membranes and raised sustaining hand are the decision-relevant focal points but do not glow brightly.

Color palette: soot-black and wet-charcoal cloth, muted ash-grey face and throat membranes, dark weathered wood yoke, tiny aged-copper name-tabs, sparse #776c91 Gloom seams. No large warm focal light, blue magic, or neon.

Constraints: exactly one corporeal humanoid; coherent two-arm/two-leg anatomy; exactly one head and one chest voice-bellows; exactly three short blank name-tabs; no staff, weapon, spellbook, lantern, shield, religious symbol, crown, antlers, wings, extra face, visible text, open singing mouth, teeth, exposed organs, blood, scenery, floor, cast/contact shadow, UI, badge, frame, or watermark.

Avoid: wizard, mage, priest, nun, monk, bard, opera singer, conductor’s baton, banshee, wraith, ghost, floating dress, hooded cultist, plague doctor, drowned zombie, merfolk, generic necromancer, glowing eyes, screaming face, literal choir faces, musical notes, readable names, purple fog, neon aura, excessive particles, gore, horror-comedy, photorealism, glossy 3D, anime, pixel art, or chibi.
```

## Exact accepted revision prompt

```text
Use case: precise-object-edit
Asset type: NIGHTFALL production-candidate Band-1 enemy combat standee revision
Edit target: the most recently generated Mist Chanter image.

Primary request: Preserve the exact single-character composition, full-body framing, screen-right-facing 3/4 stance, tall narrow proportions, two conducting arms, raised open screen-right palm, low open screen-left hand, asymmetrical wooden shoulder yoke with exactly three blank copper tabs, planted boots, attached looping mourning-cloth ribbons, lighting, painterly medium, and perfectly flat solid #00ff00 background. Change only the face/throat design and costume-detail discipline described below.

Face correction: replace the current skull-like hollow face and every dark facial opening with one continuous smooth mournful ash face plane. No eye sockets, nose cavity, mouth cavity, teeth, or visible skull anatomy. The head should read as an erased former human face tipped slightly back, with only shallow planar depressions where features were lost.

Throat correction: replace the current stack of open dark cavities/rib-like jaws with exactly three CLOSED overlapping pale ash membranes. Each membrane is a solid smooth leaf- or shell-shaped plate with only a thin recessed purple-grey seam between plates. Together they form a sealed resonant bellows from throat to upper sternum. They must not resemble mouths, ribs, vertebrae, teeth, gills, or exposed anatomy. Keep one narrow dark-violet central seam, not multiple open holes.

Costume simplification: reduce coat straps, buckles, seams, layered flaps, and surface microdetail by about 35%. Consolidate the lower garment into two or three broad weather-dark mourning-cloth masses with a clean split around the legs. Preserve the worn frontier material and three copper yoke tabs, but remove ornate necromancer-fashion clutter.

Readability: keep the pale sealed throat bellows and raised hand as the two focal cues. Maintain clear negative space around both arms and legs. The tall conducting silhouette must survive at 32x38.

Background invariant: preserve a perfectly flat uniform solid #00ff00 chroma-key field with no gradient, texture, shadow, floor, reflection, vignette, or lighting variation. Do not add green to the subject.

Constraints: exactly one corporeal humanoid, one smooth closed face, exactly three closed throat membranes, coherent two-arm/two-leg anatomy, exactly three blank copper tabs. No staff, weapon, spellbook, lantern, magical orb, readable text, symbols, extra face, open mouth, skull, exposed ribs, gore, floating particles, fog, halo, scenery, floor, shadow, UI, frame, or watermark.

Avoid: skull face, skeleton, rib cage, stacked mouths, open throat holes, necromancer, wizard, priest, banshee, ghost, ornate fantasy robes, glowing eyes, purple fog, photorealism, glossy 3D, anime, pixel art, or chibi.
```
