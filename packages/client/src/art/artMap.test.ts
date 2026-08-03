import { describe, expect, it } from "vitest";
import {
  ART_ASSET_PATHS,
  cardFrameArtSrc,
  combatantArtSrc,
  enemyArtSrc,
  heroArtSrc,
  intentArtSrc,
  reviewItemArtSrc
} from "./artMap.js";

describe("art map", () => {
  it("resolves registered production paths explicitly", () => {
    expect(heroArtSrc("vanguard")).toBe(ART_ASSET_PATHS.heroes.vanguard);
    expect(enemyArtSrc("lantern_smother")).toBe(ART_ASSET_PATHS.enemies.lantern_smother);
    expect(combatantArtSrc("entity", "smothering_shroud")).toBe(ART_ASSET_PATHS.entities.smothering_shroud);
    expect(intentArtSrc("special")).toBe(ART_ASSET_PATHS.intents.special);
    expect(cardFrameArtSrc()).toBe(ART_ASSET_PATHS.cards.frame);
  });

  it("supports mixed runtime formats without changing content IDs", () => {
    expect(heroArtSrc("vanguard")).toBe("/art/heroes/vanguard.webp");
    expect(heroArtSrc("aether_weaver")).toBe("/art/heroes/aether_weaver.webp");
    expect(enemyArtSrc("gloomfang_hound")).toBe("/art/enemies/gloomfang_hound.webp");
    expect(enemyArtSrc("shattered_husk")).toBe("/art/enemies/shattered_husk.webp");
    expect(enemyArtSrc("mire_imp")).toBe("/art/enemies/mire_imp.webp");
    expect(enemyArtSrc("lantern_smother")).toBe("/art/enemies/lantern_smother.webp");
    expect(combatantArtSrc("entity", "smothering_shroud")).toBe("/art/entities/smothering_shroud.webp");
    expect(reviewItemArtSrc("hewn_sword")).toBe("/art/items/hewn_sword.webp");
  });

  it("keeps the SVG convention for unknown future IDs", () => {
    expect(heroArtSrc("future_class")).toBe("/art/heroes/future_class.svg");
    expect(enemyArtSrc("future_enemy")).toBe("/art/enemies/future_enemy.svg");
    expect(reviewItemArtSrc("future_item")).toBe("/art/items/future_item.svg");
  });
});
