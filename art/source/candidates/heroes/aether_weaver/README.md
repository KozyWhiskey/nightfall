# Aether Weaver Production Candidate

**Date:** 2026-08-01
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool
**Status:** Candidate v1; technical QA passed, reviewer approval pending

## Files

| File | Role |
|---|---|
| `aether_weaver_candidate_chroma_v1.png` | Immutable generated chroma source |
| `aether_weaver_candidate_alpha_v1.png` | Cleaned alpha extraction before contract framing |
| `aether_weaver_candidate_qa_v1.png` | Field-color, alpha, runtime-size, and grayscale review sheet |

Master: [`art/masters/heroes/aether_weaver.png`](../../../../masters/heroes/aether_weaver.png) — transparent `992 × 1152` PNG.

Runtime review derivative: [`packages/client/public/art/heroes/aether_weaver.webp`](../../../../../packages/client/public/art/heroes/aether_weaver.webp) — lossless transparent `496 × 576` WebP.

## Post-processing and QA record

- Removed the generated green field with the installed `remove_chroma_key.py` helper using border auto-key, soft matte, thresholds `12/220`, and despill.
- Detected border key: `#09f90d`.
- Extraction: `1,204,017 / 1,572,128` transparent pixels and `9,147` partially transparent pixels.
- Cropped to the alpha bounds and proportionally framed the subject on the required `992 × 1152` master without stretching.
- Final alpha bounds: `(165, 50)–(827, 1083)`; top safe area `4.34%`; both side safe areas `16.63%`; ground line `94.01%`; all corner alpha values are `0`.
- Created the runtime derivative at `496 × 576` as lossless WebP.
- Automated fringe scan found zero green-dominant visible pixels in the master and one nearly transparent runtime pixel at alpha `18`; no visible contamination appeared on either required field color or the checkerboard.
- Source-sheet review passed at `86 × 115`, `72 × 96`, and `32 × 38` on both required field colors and in grayscale. Face, narrow scholar stance, cool rod, and warm buckler remain distinct.
- Live `?artReview=anchors` review passed neutral, active, targetable, acting, downed, and linked treatments. Nine Mara images decoded from the `496 × 576` WebP at the expected review/state sizes, and the page had no horizontal overflow.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Chroma source | `B5A8F7A8026466431E50AD2DA3DCE333ED6057349D0E451BDB0F2B9A77AC82AF` |
| Transparent PNG master | `CFAC552AB5E89BF7F826ED98C4453C36DF22890842DAC0174007863AC7234964` |
| Runtime lossless WebP | `432083E08FBDA64A2F73FD599225FD52D1B6CAFA78E92A3221A0C8BF4B00BADE` |

## Exact prompt

```text
Use case: precise-object-edit and background-extraction
Asset type: NIGHTFALL production-candidate full-body combat standee for Mara, the fixed starter Aether Weaver

Input images:
- Image 1 is Mara's preferred exploration and edit target. Preserve her recognizable face, adult female identity, tied-back hair, narrow field-scholar silhouette, pose, compact Aether Rod, Way-lantern Buckler, note case, and overall class identity.
- Image 2 is Rook's Vanguard production master and family-style reference only. Match its broad painterly planes, disciplined edge hierarchy, ash-value separation, material weight, and simplified Nightfall rendering. Do not copy the man, body type, pose, shield scale, sword, or clothing design.

Primary request: Produce exactly one cleaned Mara standee candidate. Mara is a practical, travel-worn woman and reckless field scholar who controls unstable Aether with a compact rod while defending with a small repaired Way-lantern Buckler. She faces screen-right.

Required changes:
1. Lift the exploration's dark midtones by roughly 15–20% along her mantle, field coat, forearms, inner-leg gaps, and boots so her body remains readable on #0d171b and #122428 and in grayscale at 72x96. Keep the outfit soot-dark; do not add an outline or halo.
2. Simplify remaining internal texture by roughly 20%. Use two or three broad painterly value masses and selective edge detail. Keep only the cross-body document strap, protected note case, and a few competent repairs.
3. Preserve the compact one-handed Aether Rod. Render the cracked crystal and two or three short branching Aether fractures as crisp, mostly opaque pale blue-white painted shapes with hard readable edges. No translucent haze, soft bloom, lightning cloud, detached sparks, or long staff silhouette.
4. Preserve the small Way-lantern Buckler as a compact forearm instrument, clearly smaller than Rook's shield. Simplify it into three construction planes with one contained lantern-gold aperture and no soft glow.
5. Keep Mara's hair tied back as a compact opaque painterly shape with clean outer edges. Remove flyaway wisps and translucent strands.
6. Preserve her visible tired, intent face and natural female presentation. Do not sexualize the costume or redesign her into a different person.

Composition: exactly one full-body adult woman in the same neutral combat-ready 3/4 stance, canonically facing screen-right. Tall 31:36 standee framing; consistent ground line near 94% canvas height; at least 4% clear space above the silhouette and 6% on each side, with extra space around the rod and Aether fractures. Entire rod, fractures, buckler, hair, boots, and coat fully separated from every canvas edge. No dramatic foreshortening or action lunge.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local removal. One uniform color corner to corner: no shadow, floor plane, reflection, gradient, vignette, texture, lighting variation, scenery, mist, or halo. Do not use #00ff00 anywhere in Mara or her gear.

Style/medium: visibly painterly dark-fantasy game standee with broad authored brush planes, disciplined silhouette, twilight-gothic emotion, ashen relic-craft material culture, and mature roguelite tone. Tactile but simplified; not photorealistic or glossy 3D.

Lighting and palette: soft top-left key, cool twilight fill confined to the subject, pale #7da9bd Aether at the rod, one restrained #d99a4e Ember accent inside the buckler, soot-black iron, ash neutrals, dark leather, aged copper. No cast/contact shadow and no green spill.

Readability: narrow scholar silhouette, deliberate rod casting line, compact buckler, and face clear at 86x115 and 72x96; face plus cool rod/warm buckler contrast survive at 32x38.

Constraints: exactly one adult woman; anatomically coherent hands gripping rod and buckler; practical modest clothing; preserve all unmentioned identity decisions; no extra character, extra weapon, familiar, scenery, text, UI, badge, watermark, floor shadow, long staff, wizard hat, floor-length robe, corset, cleavage, exposed midriff, heels, ornate jewelry, floating book, modern object, science-fiction machinery, steampunk excess, glowing eyes, neon bloom, purple fog, translucent magic cloud, excessive particles, photorealism, glossy 3D, anime, pixel art, chibi, or comedy pose.
```
