# Cinder Scepter Production Candidate

**Date:** 2026-08-03  
**Tool:** Built-in image generation; model identifier is not surfaced by the built-in tool  
**Status:** Approved master v1; reviewer approved 2026-08-03

## Files

| File | Role |
|---|---|
| `cinder_scepter_candidate_chroma_v1.png` | Generated chroma source |
| `cinder_scepter_candidate_alpha_v1.png` | Cleaned alpha source |
| `cinder_scepter_candidate_normalized_v1.png` | Normalized transparent master comparison |
| `cinder_scepter_candidate_runtime_v1.webp` | Runtime comparison derivative |
| `cinder_scepter_candidate_qa_v1.png` | Size-readability QA sheet |

Master: [`art/masters/items/cinder_scepter.png`](../../../../masters/items/cinder_scepter.png) — transparent `1024 × 1024` PNG.  
Runtime: [`packages/client/public/art/items/cinder_scepter.webp`](../../../../../packages/client/public/art/items/cinder_scepter.webp) — lossless transparent `512 × 512` WebP.

## Post-processing and QA

- Removed the green field with border auto-key, soft matte, thresholds `12/220`, and despill; detected key `#03f906`.
- Normalized alpha bounds to `(190, 83)–(833, 941)` on the `1024 × 1024` master; all four corners are transparent and no green-dominant visible pixels remain.
- Checked `128`, `64`, and `32` px in color and grayscale. The lantern cage and contained warm core remain readable.

## Integrity hashes

| File | SHA-256 |
|---|---|
| Selected chroma source | `3542DA3EB07BEBC44732AAD91E247D287D97F8276EBC1D5F3868F8E40574F259` |
| Transparent PNG master | `A8CF6127F228D1DB3570AD587B3979BE83BAAEA9567A724867D1EC0CE19188A4` |
| Runtime lossless WebP | `76D22A65582E44663B6D68399CAE8E1B298696547C3FA5DF4EF4E95A073EB93D` |

## Exact prompt

```text
Use case: stylized-concept
Asset type: NIGHTFALL production-candidate source for a square game inventory item, Cinder Scepter base vessel.

Primary request: Create exactly one compact one-handed Cinder Scepter, a practical controlled lantern-fire instrument for Ember channeling. It must read immediately as a short scepter at 32 px and be clearly distinct from a spear, staff, sword, shield, and the Aether Rod. Build it from a soot-black square iron shaft with a short wrapped leather grip and a stocky lantern-cage head: four dark iron ribs form a small rectangular cage around one recessed emberglass core. The core is a dim contained orange-red coal behind smoked glass, with no flame extending outside the cage. Include two hammered-copper vent collars and one visible wick-line entering the lower cage. The blunt lower end has a weighted squared iron pommel. This is a credible Salvaged-quality tool, not a royal sceptre.

Scene/backdrop: perfectly flat solid #00ff00 chroma-key background for local background removal. The background must be one uniform color from corner to corner with no shadows, gradients, texture, reflections, floor plane, lighting variation, vignette, or halo. Do not use #00ff00 anywhere in the scepter.

Style/medium: painterly dark-fantasy game item illustration, disciplined simplified value grouping, tactile authored brushwork, bold continuous contour, twilight-gothic and ashen relic-craft language. Practical Salvaged-quality vessel, not a rare or legendary weapon. Not photorealistic or glossy 3D.

Composition/framing: exactly one isolated short scepter, centered diagonally from lower-left pommel to upper-right lantern cage on a square canvas. Fill roughly 78% of the frame; keep the entire object visible with generous even padding and no perspective foreshortening.

Lighting/mood: soft top-left key, cool neutral fill, and only the small controlled warm glow inside the smoked-glass ember core. No cast shadow, contact shadow, reflection, or background spill.

Constraints: one object only; no hand, person, animal, staff, spear, wand, sword, shield, book, second weapon, detached shards, text, UI, rarity gem, badge, watermark, flame plume, bonfire, torch, aura, particles, smoke, runes, ornate filigree, crown, royal finial, excessive orange, neon, floating fire, halo, pristine ceremonial weapon, modern machinery, photorealism, glossy 3D, anime, pixel art, or chibi. No shadow, no extra object.
```
