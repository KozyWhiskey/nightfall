/** Stable public paths under `/art/` — filenames are content/sim ids. */

export const ART_ROOT = "/art";

export type SilhouetteVariant = "hostile" | "entity" | "vanguard" | "weaver" | "hero";
export type IntentArtKind = "attack" | "defend" | "buff" | "special";
export type CombatantArtKind = "hero" | "enemy" | "entity";

/**
 * Explicit runtime paths allow approved assets to use SVG, PNG, or WebP without
 * changing their content IDs. Unknown future IDs retain the SVG convention and
 * gracefully fall back through ArtImage when no file exists.
 */
export const ART_ASSET_PATHS = {
  heroes: {
    vanguard: `${ART_ROOT}/heroes/vanguard.webp`,
    aether_weaver: `${ART_ROOT}/heroes/aether_weaver.webp`
  },
  enemies: {
    gloomfang_hound: `${ART_ROOT}/enemies/gloomfang_hound.webp`,
    shattered_husk: `${ART_ROOT}/enemies/shattered_husk.webp`,
    mire_imp: `${ART_ROOT}/enemies/mire_imp.webp`,
    mist_chanter: `${ART_ROOT}/enemies/mist_chanter.webp`,
    gloom_spore: `${ART_ROOT}/enemies/gloom_spore.webp`,
    lantern_smother: `${ART_ROOT}/enemies/lantern_smother.webp`
  },
  entities: {
    smothering_shroud: `${ART_ROOT}/entities/smothering_shroud.webp`
  },
  intents: {
    attack: `${ART_ROOT}/intents/attack.svg`,
    defend: `${ART_ROOT}/intents/defend.svg`,
    buff: `${ART_ROOT}/intents/buff.svg`,
    special: `${ART_ROOT}/intents/special.svg`
  },
  cards: {
    frame: `${ART_ROOT}/cards/frame.svg`
  },
  items: {
    hewn_sword: `${ART_ROOT}/items/hewn_sword.webp`
  }
} as const;

function registeredPath(
  paths: Readonly<Record<string, string>>,
  id: string,
  fallbackDirectory: string
): string {
  return paths[id] ?? `${ART_ROOT}/${fallbackDirectory}/${id}.svg`;
}

export function heroArtSrc(classId: string): string {
  return registeredPath(ART_ASSET_PATHS.heroes, classId, "heroes");
}

export function enemyArtSrc(definitionId: string): string {
  return registeredPath(ART_ASSET_PATHS.enemies, definitionId, "enemies");
}

export function entityArtSrc(definitionId: string): string {
  return registeredPath(ART_ASSET_PATHS.entities, definitionId, "entities");
}

export function combatantArtSrc(kind: CombatantArtKind, definitionId: string): string {
  if (kind === "hero") return heroArtSrc(definitionId);
  if (kind === "entity") return entityArtSrc(definitionId);
  return enemyArtSrc(definitionId);
}

export function intentArtSrc(kind: IntentArtKind): string {
  return ART_ASSET_PATHS.intents[kind];
}

export function cardFrameArtSrc(): string {
  return ART_ASSET_PATHS.cards.frame;
}

/** ID-keyed base-vessel art; ItemGlyph retains the authoritative slot-glyph fallback. */
export function itemArtSrc(baseId: string): string {
  return registeredPath(ART_ASSET_PATHS.items, baseId, "items");
}

export function silhouetteForHero(classId: string | undefined): SilhouetteVariant {
  if (classId === "vanguard") return "vanguard";
  if (classId === "aether_weaver") return "weaver";
  return "hero";
}

export function silhouetteForCombatant(
  kind: "hero" | "enemy" | "entity",
  definitionId?: string
): SilhouetteVariant {
  if (kind === "entity") return "entity";
  if (kind === "hero") return silhouetteForHero(definitionId);
  return "hostile";
}

/** Keys shipped in the Phase A placeholder pack (see `public/art/README.md`). */
export const PLACEHOLDER_ART_KEYS = {
  heroes: ["vanguard", "aether_weaver"],
  enemies: [
    "gloomfang_hound",
    "shattered_husk",
    "mire_imp",
    "mist_chanter",
    "gloom_spore",
    "lantern_smother"
  ],
  entities: ["smothering_shroud"],
  intents: ["attack", "defend", "buff", "special"],
  cards: ["frame"]
} as const;
