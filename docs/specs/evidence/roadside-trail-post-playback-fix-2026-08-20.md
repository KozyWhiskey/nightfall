# Roadside Trail combat UX smoke — 2026-08-20 (post false-playback fix)

**UI:** `http://192.168.68.92:3050/`  
**Host health:** `status=ok`, `contentVersion=nightfall.vslice.1`, `contentHash=31a84f67b8fac18aeab009d348f5c3d0cef0386c695335f1f25532f2357bea99`  
**Save:** Haven “The Last Lantern”, mid Roadside Trail combat (rounds 2→3)

## False-playback regression check

| Step | Expected | Result |
|------|----------|--------|
| Play Flare Ward mid-hero-turn | Stay on Mara; no “Enemy phase”; End Turn still available | **Pass** — chrome stayed “Your turn Mara · 2 AP”; Mara remained NOW |
| Play Ember Spark + target mid-turn | Same | **Pass** — “Your turn Mara · 1 AP”; hand dropped Ember Spark; no enemy playback |
| End Turn past enemies (Rook → hounds → Mara) | Sim resolves enemy intents; optional playback chrome | **Pass** — facts show both Lunges + burn tick; round advanced to 3 |

## Interaction-contract checklist

| Must show | Result |
|-----------|--------|
| Current actor | Pass |
| AP | Pass |
| HP / Mana / Stamina | Pass |
| Card costs | Pass |
| Initiative timeline | Pass (queue labels; initiative *values* not shown) |
| Next enemy intents | Partial — label + magnitude only; `targetLabel` present in snapshot (`lowest hp hero`) but omitted in UI |
| Basics | Pass |
| Draw / discard / exhaust | Pass |

## Gaps observed (live)

1. **Hero Block invisible** — after Flare Ward, snapshot had Mara Block 7 / Rook Block 6; standees showed no Block chip (enemies-only chip in `CombatStandee`).
2. **Burn invisible** — Ember Spark applied burn on `gloomfang_hound_1` (`combatant.burn`); standee maps `conditions` only.
3. **Guard not presented** — snapshot still had active `guards` (Rook protecting Mara from prior Hold the Line); no Guard link on battlefield/timeline.
4. **Intent target domain omitted** — intents include `targetLabel` but UI shows “Lunge 5” / “Raking Bite 3” only.
5. **Fact log collapsed by default** — “What changed” lives behind collapsed Way Lantern (`»`); mid-combat outcomes easy to miss.
6. **Supply** — none carried this save; `window.confirm` path not exercised live (still present in `CombatView.beginSupply`).

Not a merge gate. Vitest remains combat correctness authority.
