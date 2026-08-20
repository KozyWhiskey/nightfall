# Roadside Trail combat UX smoke — 2026-08-20

**Host:** `http://127.0.0.1:3051/api/health`  
**Result:** `status=ok`, `revision=4`, `contentVersion=nightfall.vslice.1`, `contentHash=31a84f67b8fac18aeab009d348f5c3d0cef0386c695335f1f25532f2357bea99`  
**UI:** `http://127.0.0.1:3050/` — Combat, Roadside Trail, Round 1, Mara's turn

## Interaction-contract checklist

| Must show | Result |
|-----------|--------|
| Current actor | Pass — Mara tagged NOW, gold highlight |
| AP | Pass — 1 AP remaining |
| HP / Mana / Stamina | Pass — Mara 19/8/4, Rook 34/3/10 |
| Card costs | Pass — Flare Ward 1 AP · 1 MANA |
| Initiative timeline | Pass — Mara, Rook, two Hounds |
| Next enemy intents | Pass — Raking Bite 3, Lunge 5 |
| Basics | Pass — Staff Strike / Deflect |
| Draw / discard / exhaust | Pass — 1 / 2 / 0 |

Guard/Block coverage windows on the timeline: not visible (known enhancement; do not treat as a rules bug).

Screenshot captured during the agent browser smoke (Cursor temp screenshots). Not a merge gate.
