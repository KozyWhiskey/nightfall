# Phase A combat art (client presentation)

DOM-only art slots for the combat board. **Art never encodes gameplay rules** — card text, costs, intent labels, and magnitudes remain authoritative. Missing files fall back to CSS silhouettes / text glyphs via `ArtImage`.

## Where to drop assets

Serve from Vite `public/` (stable URL = path under this folder):

```text
packages/client/public/art/
  heroes/{classId}.svg|png|webp
  enemies/{definitionId}.svg|png|webp
  entities/{definitionId}.svg|png|webp
  intents/{kind}.svg|png|webp          # attack | defend | buff | special
  cards/frame.svg|png|webp             # optional hand-card frame
```

Client resolution lives in `src/art/artMap.ts` (`heroArtSrc`, `enemyArtSrc`, `entityArtSrc`, `intentArtSrc`, `cardFrameArtSrc`).

## Naming convention (id-keyed)

| Slot | Filename stem | Source id |
|------|---------------|-----------|
| Hero portrait | `heroes/{classId}` | `HeroSnapshot.classId` / combatant `definitionId` for heroes (`vanguard`, `aether_weaver`) |
| Enemy portrait | `enemies/{definitionId}` | Combatant `definitionId` when `kind === "enemy"` |
| Entity portrait | `entities/{definitionId}` | Combatant `definitionId` when `kind === "entity"` (e.g. `smothering_shroud`) |
| Intent glyph | `intents/{kind}` | Presentation kind only: `attack`, `defend`, `buff`, `special` |
| Card frame | `cards/frame` | Optional; all hand cards share one frame |

Use lowercase snake_case ids matching content/sim. Prefer SVG or PNG/WebP. Keep fixed aspects so layout stays stable:

- Portraits: ~31∶36 (matches combat silhouette box)
- Intent glyphs: 1∶1
- Card frame: ~12∶10 hand-card face

## Placeholder pack (shipped)

| Path | Role |
|------|------|
| `heroes/vanguard.svg` | Vanguard |
| `heroes/aether_weaver.svg` | Aether Weaver |
| `enemies/gloomfang_hound.svg` | Band-1 |
| `enemies/shattered_husk.svg` | Band-1 |
| `enemies/mire_imp.svg` | Band-1 |
| `enemies/mist_chanter.svg` | Band-1 |
| `enemies/gloom_spore.svg` | Band-1 |
| `enemies/lantern_smother.svg` | Boss |
| `entities/smothering_shroud.svg` | Boss entity |
| `intents/attack.svg` | Intent glyph |
| `intents/defend.svg` | Intent glyph |
| `intents/buff.svg` | Intent glyph |
| `intents/special.svg` | Intent glyph |
| `cards/frame.svg` | Optional hand frame |

Unknown ids (new enemies, future classes) resolve to a path by convention; if the file is absent, `ArtImage` shows the existing silhouette / text glyph. Layout must not depend on the bitmap succeeding.

## Later phases (not implemented here)

- **Phase B — screen atmosphere:** Haven/map/reward chrome, full-bleed mood layers, non-combat portraits. Still DOM; no rule changes.
- **Phase C — canvas VFX:** Optional hit/block/floaters on top of the DOM board; sim/host remain snapshot + commands only.
