# Technical Asset Contract

**Status:** Accepted Phase 0 production contract  
**Last updated:** 2026-08-01  
**Related:** [Visual Style Bible](visual-style-bible.md), [Asset Manifest](asset-manifest.md), [Client Integration Reconciliation](client-integration-reconciliation.md)

## Purpose

This contract prevents attractive source images from becoming unreadable or unusable runtime assets. Art is presentation only: it never replaces content IDs, labels, magnitudes, targeting cues, or simulation facts.

## Source, runtime, and archive files

- Keep the untouched generated or illustrated source outside the runtime folder.
- Keep a lossless, cleaned transparent PNG master for raster art.
- Prefer a transparent WebP runtime derivative after visual comparison; retain PNG when WebP introduces unacceptable edge or glow artifacts.
- Use authored SVG for simple UI glyphs such as intent kinds.
- Runtime paths remain lowercase snake_case and ID-keyed.
- Record every source, derivative, crop, and approval in the [Asset Manifest](asset-manifest.md).

The client uses an explicit mixed-format presentation registry. New raster assets remain staged outside `public/art` until approved; integration then adds the runtime derivative and changes that ID's registry entry in the same reviewable change.

## Combat standees

| Property | Contract |
|---|---|
| Master canvas | `992 × 1152` px, exactly `31:36` |
| Runtime aspect | `31:36` |
| Background | Transparent alpha |
| Canonical authored direction | Facing screen-right |
| Runtime orientation | Heroes remain right-facing; enemies/entities are flipped by semantic side in every context |
| Top safe area | At least 4% clear canvas above silhouette |
| Side safe area | At least 6% per side; more around projecting weapons/effects |
| Ground line | Consistent at approximately 94% canvas height |
| Lighting | Soft top-left key, twilight ambient fill |

Do not bake a floor, rectangle, portrait frame, drop shadow, name, health state, intent, target marker, or rarity cue into a standee. Contact shadow and selection treatments belong to the client.

### Required render checks

Review every combatant at:

- `86 × 115` px — current desktop battlefield approximation.
- `72 × 96` px — narrow battlefield approximation.
- `32 × 38` px — initiative approximation.
- Grayscale at the first two sizes.
- Normal, selected, active, dimmed/downed, and enemy-flipped states on `#0d171b` and `#122428`.

Passing at source size does not compensate for failing a runtime-size check.

## Timeline portraits

The same full-body standee is currently reused in the initiative tracker. Before final art integration, choose one of these bounded solutions:

1. Add a dedicated bust crop per combatant; preferred if full-body recognition fails at `32 × 38`.
2. Store per-asset focal metadata and use a controlled CSS crop.
3. Reuse the full standee only when the runtime test proves it remains recognizable.

Do not commission a second portrait set until the anchor test shows it is necessary.

## Item illustrations

| Property | Contract |
|---|---|
| Master canvas | `1024 × 1024` px |
| Background | Transparent alpha |
| Occupancy | Primary vessel fills roughly 72–84% of width or height |
| Runtime checks | `128 × 128`, `64 × 64`, and `32 × 32` |
| Framing | One object or inseparable set; no card frame, label, rarity gem, or scenery |

Keep the base vessel recognizable across rarity and affix presentation. A generated instance may add a restrained overlay or signature detail, but it must not silently become a different weapon category.

## Intent and status glyphs

- Author as SVG with a `24 × 24` viewBox.
- Use one filled/outlined symbolic shape and limited internal detail.
- Verify at 24 px, 16 px, and 12 px.
- Meaning must remain available through adjacent text and accessible labels.
- Do not use generated raster illustration for the four foundational intent kinds.

## VFX

VFX are deferred until event playback and animation timing are specified. A VFX asset may decorate a resolved fact but cannot be the only evidence that it occurred.

- Transparent PNG/WebP source for painterly effects; SVG/CSS is allowed for simple wards and lines.
- Keep the effect centered within a documented safe area and verify it on the combat background.
- Looping effects require a frame count, playback duration, loop behavior, and reduced-motion fallback.
- A sprite sheet must declare frame width, frame height, order, and padding. “Four-frame strip” alone is not sufficient.

## Alpha and cleanup QA

- No opaque or near-opaque corner pixels.
- No white matte, dark fringe, checkerboard, or accidental background remnants.
- No detached noise islands unless they are intentional VFX and remain readable at runtime size.
- Preserve soft glow with premultiplied-alpha testing on both required background colors.
- Crop bounds and orientation must match the manifest.

## Limited equipment-overlay proof

Full layered paper-doll art is not a Build 1 dependency. The only approved proof scope is:

- `vanguard` base pose.
- `hewn_sword` main-hand overlay.
- `gloomwood_spear` main-hand overlay.
- `kite_shield` offhand overlay.

Every overlay must use the exact standee canvas, pose, ground line, camera, key light, and attachment anchors. The proof passes only if swaps remain anatomically credible at desktop and narrow battlefield sizes without manual per-loadout repainting. Armor, relic VFX, and the Aether Weaver do not enter the system until this proof passes.

## Batch acceptance

An asset is approved only when:

- Its ID and role match accepted content.
- It passes all relevant runtime-size and orientation checks.
- It belongs beside the approved anchors without palette or rendering drift.
- Its source, prompt, references, cleanup, and runtime derivative are recorded.
- It adds no gameplay promise absent from the content definition.
