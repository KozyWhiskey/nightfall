/** Stable public paths under `/art/` — filenames are content/sim ids. */

export const ART_ROOT = "/art";

export type SilhouetteVariant = "hostile" | "entity" | "vanguard" | "weaver" | "hero";
export type IntentArtKind = "attack" | "defend" | "buff" | "special";

export function heroArtSrc(classId: string): string {
  return `${ART_ROOT}/heroes/${classId}.svg`;
}

export function enemyArtSrc(definitionId: string): string {
  return `${ART_ROOT}/enemies/${definitionId}.svg`;
}

export function entityArtSrc(definitionId: string): string {
  return `${ART_ROOT}/entities/${definitionId}.svg`;
}

export function combatantArtSrc(kind: "hero" | "enemy" | "entity", definitionId: string): string {
  if (kind === "hero") return heroArtSrc(definitionId);
  if (kind === "entity") return entityArtSrc(definitionId);
  return enemyArtSrc(definitionId);
}

export function intentArtSrc(kind: IntentArtKind): string {
  return `${ART_ROOT}/intents/${kind}.svg`;
}

export function cardFrameArtSrc(): string {
  return `${ART_ROOT}/cards/frame.svg`;
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
