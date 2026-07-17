# Party and Roster

**Status:** Draft  
**Last updated:** 2026-07-17  
**Template:** [../templates/system-spec.md](../templates/system-spec.md)

## Goal

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
- **Subclass is permanent** for that hero (no Haven respec). Future classes may open an **extra** tree at a level gate — see [progression.md](progression.md).
- Dead heroes are removed from the living roster and recorded in the Haven **Memorial** (see below).
- Haven may also keep a soft **band / segment completion** record (progress flavor, like Memorial — not a fail clock).

### Recruitment

- **Training Hall** (building): unlocks classes / subclasses for new recruits.
- **Tavern** (building): rumors, map hints, and **passing strangers** — possible unique one-run or recruitable heroes.
- **Events:** rescue survivors who may join roster or grant resources.

### Hybrid identity

- Core: persistent custom survivors you grow.
- Flex: temporary recruits / strangers for a single expedition.
- You do not expect every face to last forever.

### Gear trading

- Party members may **trade gear anytime outside combat** so the right hero wears the right drop.
- See [gear-and-affixes.md](gear-and-affixes.md).

### Memorial (locked)

- When a hero dies for good, their **name and brief epitaph** are added to the Haven Memorial (shrine / plaque list under Lantern Keep or a Memorial UI).
- Must-ship: flavor + emotional weight (mature tone — quiet, not cartoonish).
- **Optional buffs later:** Memorial entries may grant tiny Haven-wide or embark bonuses (domain-tunable); not required for v1 pride bar.
- Memorials die with the Haven on permanent failure (unless a Legacy Scar preserves a single name — see failure-and-torches).

## Parameters (proposed)

| Param | Default | Notes |
|-------|---------|-------|
| Party min/max | 2 / 3 | Must-ship |
| Roster cap | **8** | Locked for v1; domain-tunable later if needed |
| Starting roster | 3 (covering 3 classes) | Fresh Haven |
| Permadeath | On wipe or individual death | Individual death rules in combat.md |

## Edge cases

- Roster too small to embark → forced tavern event / free recruit / Haven crisis event.
- Co-op disconnect mid-run → host pause or AI takeover (MP doc).
- Recruit mid-run when party already at 3 → swap, refuse, or send home (pick one later).

## Content hooks

- Class / subclass defs
- Stranger templates (tavern)
- Survivor event outcomes

## Acceptance criteria

- [ ] Player can name heroes and recognize them across runs
- [ ] Losing a leveled hero feels bad for more than one screen
- [ ] Embark always shows why a hero is valuable (subclass, key cards, scars)

## Stress

Full DD afflictions are **out** for must-ship. Pressure uses the **Gloom meter** + light **Strain** — see [gloom-and-stress.md](gloom-and-stress.md).
