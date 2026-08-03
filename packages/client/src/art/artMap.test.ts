import { describe, expect, it } from "vitest";
import {
  ART_ASSET_PATHS,
  cardFrameArtSrc,
  combatantArtSrc,
  enemyArtSrc,
  heroArtSrc,
  intentArtSrc,
  itemArtSrc
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
    expect(enemyArtSrc("mist_chanter")).toBe("/art/enemies/mist_chanter.webp");
    expect(enemyArtSrc("gloom_spore")).toBe("/art/enemies/gloom_spore.webp");
    expect(enemyArtSrc("lantern_smother")).toBe("/art/enemies/lantern_smother.webp");
    expect(combatantArtSrc("entity", "smothering_shroud")).toBe("/art/entities/smothering_shroud.webp");
    expect(itemArtSrc("hewn_sword")).toBe("/art/items/hewn_sword.webp");
    expect(itemArtSrc("gloomwood_spear")).toBe("/art/items/gloomwood_spear.webp");
    expect(itemArtSrc("aether_rod")).toBe("/art/items/aether_rod.webp");
    expect(itemArtSrc("cinder_scepter")).toBe("/art/items/cinder_scepter.webp");
    expect(itemArtSrc("kite_shield")).toBe("/art/items/kite_shield.webp");
    expect(itemArtSrc("way_lantern_buckler")).toBe("/art/items/way_lantern_buckler.webp");
    expect(itemArtSrc("archivists_focus")).toBe("/art/items/archivists_focus.webp");
    expect(itemArtSrc("cracked_way_lens")).toBe("/art/items/cracked_way_lens.webp");
    expect(itemArtSrc("pilgrims_knot")).toBe("/art/items/pilgrims_knot.webp");
    expect(itemArtSrc("emberglass_cowl")).toBe("/art/items/emberglass_cowl.webp");
    expect(itemArtSrc("wayfarers_coat")).toBe("/art/items/wayfarers_coat.webp");
    expect(itemArtSrc("ironweave_gloves")).toBe("/art/items/ironweave_gloves.webp");
  });

  it("keeps the SVG convention for unknown future IDs", () => {
    expect(heroArtSrc("future_class")).toBe("/art/heroes/future_class.svg");
    expect(enemyArtSrc("future_enemy")).toBe("/art/enemies/future_enemy.svg");
    expect(itemArtSrc("future_item")).toBe("/art/items/future_item.svg");
  });

  it("resolves every Build 1 base vessel independently", () => {
    const ids = [
      "hewn_sword",
      "gloomwood_spear",
      "aether_rod",
      "cinder_scepter",
      "kite_shield",
      "way_lantern_buckler",
      "archivists_focus",
      "cracked_way_lens",
      "pilgrims_knot",
      "name_thread_charm",
      "emberglass_cowl",
      "wayfarers_coat",
      "ironweave_gloves"
    ];
    const paths = ids.map(itemArtSrc);
    expect(new Set(paths).size).toBe(ids.length);
    expect(paths[0]).toBe("/art/items/hewn_sword.webp");
    expect(paths[1]).toBe("/art/items/gloomwood_spear.webp");
    expect(paths[2]).toBe("/art/items/aether_rod.webp");
    expect(paths[3]).toBe("/art/items/cinder_scepter.webp");
    expect(paths[4]).toBe("/art/items/kite_shield.webp");
    expect(paths[5]).toBe("/art/items/way_lantern_buckler.webp");
    expect(paths[6]).toBe("/art/items/archivists_focus.webp");
    expect(paths[7]).toBe("/art/items/cracked_way_lens.webp");
    expect(paths[8]).toBe("/art/items/pilgrims_knot.webp");
    expect(paths[9]).toBe("/art/items/name_thread_charm.svg");
    expect(paths[10]).toBe("/art/items/emberglass_cowl.webp");
    expect(paths[11]).toBe("/art/items/wayfarers_coat.webp");
    expect(paths[12]).toBe("/art/items/ironweave_gloves.webp");
  });
});
