# Party and Roster

**Status:** Draft  
**Last updated:** 2026-07-17  
**Template:** [../templates/system-spec.md](../templates/system-spec.md)

## Goal

**Vertical-slice scope override:** the playable party is the fixed Vanguard + Aether Weaver pair, controlled by one solo player. Shadowblade, 2–3-hero party variety, and all co-op ownership rules are future content. This override takes precedence over older broad-roster wording below.

Darkest Dungeon–like attachment: heroes persist at Haven, you send a party out, death is real, and you want them to live as long as you can.

## Player-facing rules

### Party

- Expeditions field **2–3 heroes**.
- **Solo:** player controls the entire party.
- **Co-op:** 1–3 humans; lobby assigns **ownership** of the 2–3 heroes. A human may control **multiple** heroes. **No AI allies** for must-ship. Ally hands are visible to all party members — see [multiplayer.md](multiplayer.md).

### Roster (Haven)

- Haven maintains a **roster** of available heroes between runs.
- Embark selects who goes; others stay home (safe from expedition death).
- Heroes gain levels, subclasses, and gear identity across expeditions when they survive.
- Successful Return restores normal health and combat resources. Heroes who were downed carry a temporary, treatable injury rather than permanent death.
- **Subclass is permanent** for that hero (no Haven respec). Future classes may open an **extra** tree at a level gate — see [progression.md](progression.md).
- Dead heroes are removed from the living roster and recorded in the Haven **Memorial** (see below).
- Haven may also keep a soft **band / segment completion** record (progress flavor, like Memorial — not a fail clock).

### Recruitment

- **The Wardyard** (building): class drills, level-up offers, and subclass rites.
- **The Wayfarer** (building): rumors, map hints, and **passing strangers** — including recruit archetypes/classes made available by major settlement discoveries.
- **Events:** rescue survivors who may join roster or grant resources.
- A recruit's small starting-gear variation is rolled **once at recruitment** (or once when founding a new Haven's initial roster). It is part of that hero's persistent identity, not a per-session roll.
- Recruitment offers do not have a free reroll button. New offers arrive through expeditions, events, or Wayfarer updates; players should choose people, not repeatedly fish for a statistically perfect modifier.

### Hybrid identity

- Core: persistent custom survivors you grow.
- Flex: temporary recruits / strangers for a single expedition.
- You do not expect every face to last forever.
- Starting variations must be horizontal or carry a visible tradeoff; they cannot be a hidden hierarchy of strictly best recruits.

### Gear trading

- Party members may trade gear only at the valid preparation moments defined in [embark-and-loadout.md](embark-and-loadout.md): Haven, post-combat reward, Rest, Safe Craft, and waypoint/post-boss reward.

### Memorial (locked)

- When a hero dies for good, their **name and brief epitaph** are added to the Haven Memorial (initially a Pillarhouse-adjacent list; The Names Wall is a later dedicated presentation).
- Must-ship: flavor + emotional weight (mature tone — quiet, not cartoonish).
- **Optional buffs later:** Memorial entries may grant tiny Haven-wide or embark bonuses (domain-tunable); not required for v1 pride bar.
- Memorials die with the Haven on permanent failure (unless a Legacy Scar preserves a single name — see failure-and-torches).

## Parameters (proposed)

| Param | Default | Notes |
|-------|---------|-------|
| Party min/max | 2 / 3 | Must-ship |
| Roster cap | **8** | Locked for v1; domain-tunable later if needed |
| Vertical-slice starting roster | 2 (one Vanguard, one Aether Weaver) | Shadowblade is a canonical follow-on class, not a playable slice kit |
| Permadeath | On full-party wipe only | Heroes are downed at 0 HP; a downed survivor has a temporary injury |

## Edge cases

- Roster too small to embark → forced Wayfarer event / free recruit / Haven crisis event.
- Co-op disconnect mid-run → pause and save; host waits, reassigns ownership, or ends the session (no AI takeover).
- Recruit mid-run when party already at 3 → swap, refuse, or send home (pick one later).

## Content hooks

- Class / subclass defs
- Stranger templates (Wayfarer)
- Survivor event outcomes

## Acceptance criteria

- [ ] Player can name heroes and recognize them across runs
- [ ] Losing a leveled hero feels bad for more than one screen
- [ ] Embark always shows why a hero is valuable (subclass, key cards, scars)

## Stress

Full DD afflictions are **out** for must-ship. Pressure uses the **Gloom meter** + light **Strain** — see [gloom-and-stress.md](gloom-and-stress.md).
