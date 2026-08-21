# Overnight autonomy — loot gameplay AAA

**Branch:** `overnight/loot-gameplay-aaa` (pushed to `origin`)  
**Started:** 2026-08-21 ~02:54 UTC  
**Stopped:** 2026-08-21 ~03:37 UTC (morning briefing ready)  
**Mission:** Diablo-grade loot feel + core loop tightness within Build 1 architecture.

## Morning briefing

### Verdict

**Sim + reward helpers are substantially upgraded and green (81 tests).** Procedural loot identity, reward compare/deck/carrier UX, and nearly the full Build 1 affix registry now resolve in combat. Browser UI smoke was not run (host was down during combat-tester pass) — morning playtest should open `pnpm dev` and clear Roadside Trail.

### Shipped specs (this night)

| Spec | What it does |
|------|----------------|
| `shipped/procedural-affix-rolls.md` | Registry rarity budgets + compatibility on `loot` stream |
| `shipped/reward-desire-path.md` | Compare-to-equipped, deck inject, carrier card, rare+ leave gate, ownership strip |
| `shipped/wire-affix-combat-modifiers.md` | Burn, basic Block, combat-start draw, Guard self-Block, Exposed damage, curses |
| `shipped/item-readout-rarity-curse-polish.md` | Sectioned effects, full curse sentences, rarity glyphs/weight/affix-count |
| `shipped/wire-signature-expedition-affixes.md` | Legendary signatures + Deepdrawn mana/stamina + Ashen Names + Waystation |
| `shipped/wire-remaining-first-use-affixes.md` | Cinders first-burn, Hound/Long Vigil discounts; Lumenforged copy honesty |

### Commits on branch (from `main`)

1. Roll gear affixes from the content registry budgets  
2. Surface reward compare, deck inject, and carrier loot  
3. Document next affix-combat wiring pass…  
4. Apply registry affix modifiers during combat resolution  
5. Make rarity, curses, and effect sections readable at a glance  
6. Honor Legendary signatures and remaining registry affix hooks  
7. *(pending)* Wire remaining first-use burn/discount affixes  

### How to verify

```bash
git checkout overnight/loot-gameplay-aaa
pnpm install
pnpm check:boundaries && pnpm test   # expect 81+ green
pnpm check                           # optional full gate
pnpm dev                             # Vite :3050, host :3051
curl http://127.0.0.1:3051/api/health
```

**Key fixture ids:** `SIM-LOOT-01..03`, `SIM-AFFIX-01..12`, `SIM-AFFIX-SIG-01..06`, `SIM-01..06`, `SIM-16`, offline-smoke.

**UI path:** Embark → Roadside Trail → win → Reward screen: varied prefix/suffix names, rarity glyph + affix count, compare lines, deck inject callout, Carried — at risk strip. Party & packs inspector: sectioned Granted/Affixes/Curse/Passive + curse chrome.

### Honest limitations

- `first_block_plus_2` (Lumenforged) is **always-on +2 Block** on the granted card; display was aligned (no false “first only”).
- `hound` / `long_vigil` / `cinders` first-use tracking uses **run flags** cleared each combat (same pattern as Hound's Pursuit).
- Reward desire path is covered by **unit helpers + App wiring**, not browser smoke yet.
- No Decision Register row changes for pure bugs vs accepted contracts; Lumenforged honesty is copy alignment only.

### Top 5 remaining ideas (by impact)

1. **Browser loot theater smoke** — reward drop beat + equip feedback + fact-log celebration of Rare/Legendary (P2 juice; host required).  
2. **Boss / marked-carrier chase presentation** — stronger “this fight is for *that* item” pre-combat mark + post-drop fanfare.  
3. **Craft Safe/Risky loot sink juicing** — make Overbind results feel like forged identity, not spreadsheet outcomes.  
4. **Greed route temptation** — map tooltips that hint higher carrier chance / richer tables without spoiling exact rolls.  
5. **Party & packs dual-pane compare** — stash vs equipped side-by-side for mid-run greed (beyond reward one-liners).

### Deprioritized (correctly left alone)

Co-op, new regions, full art pipeline, architecture rewrites, drive-by refactors.

---

## Cycle log

### Cycle 0 — scout
Spec-scout + explore: reward desire path, stubbed affix rolls, text-only modifiers ranked highest.

### Cycle 1 — procedural affix rolls
`packages/sim/src/loot.ts`; generateItem/carrier/boss use registry budgets. `SIM-LOOT-*`.

### Cycle 2 — reward desire path
Client `rewardUi` + `RewardView`: compare, deck inject, carrier card, leave gate, strip.

### Cycle 3 — core combat affix wiring
`SIM-AFFIX-01..08`: burn, block, draw, guard, exposed damage, curses.

### Cycle 4 — readout polish
Sectioned descriptions, curse sentences, rarity glyphs/weight/affix-count.

### Cycle 5 — signatures + expedition
`SIM-AFFIX-SIG-*`: Vigil's Promise, Cinder-Scar, Hound's Pursuit, Ashen Names, Deepdrawn, Waystation.

### Cycle 6 — remaining first-use affixes
`SIM-AFFIX-09..12`: first burn stack, Exposed/Retain discounts; Lumenforged copy honesty.
