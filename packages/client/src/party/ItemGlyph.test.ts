import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { ItemInstance } from "@nightfall/contracts";
import { describe, expect, it } from "vitest";
import { ItemGlyph } from "./ItemGlyph.js";

function item(definitionId: string, itemKind: ItemInstance["itemKind"] = "equipment"): ItemInstance {
  return {
    instanceId: `test:${definitionId}`,
    definitionId,
    itemKind,
    generationVersion: "test",
    seed: 1,
    rarityId: "salvaged",
    prefixIds: [],
    suffixIds: [],
    mechanicSnapshot: { modifiers: [], equipmentSlot: itemKind === "equipment" ? "mainHand" : undefined },
    displaySnapshot: { name: definitionId, description: "" },
    location: { kind: "haven", havenId: "test" }
  };
}

describe("ItemGlyph", () => {
  it("requests registered base-vessel art for equipment", () => {
    const markup = renderToStaticMarkup(createElement(ItemGlyph, { item: item("hewn_sword") }));
    expect(markup).toContain('src="/art/items/hewn_sword.webp"');
    expect(markup).toContain('class="item-glyph-art"');
  });

  it("keeps non-equipment and explicit slot glyphs on authored SVG marks", () => {
    const supply = renderToStaticMarkup(createElement(ItemGlyph, { item: item("mana_phial", "supply") }));
    const slot = renderToStaticMarkup(createElement(ItemGlyph, { item: item("hewn_sword"), showArt: false }));
    expect(supply).not.toContain("<img");
    expect(supply).toContain("<svg");
    expect(slot).not.toContain("<img");
    expect(slot).toContain("<svg");
  });
});
