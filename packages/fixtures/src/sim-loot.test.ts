import { describe, expect, it } from "vitest";
import { build1Pack } from "@nightfall/content";
import { rollGearAffixIds, signatureForDefinition } from "@nightfall/sim";

function sequenceDraw(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[Math.min(index, values.length - 1)] ?? 0;
    index += 1;
    return value;
  };
}

describe("SIM-LOOT procedural affix rolls", () => {
  it("SIM-LOOT-01 Salvaged stays affix-free; Imbued/Rare/Legendary follow registry budgets", () => {
    expect(rollGearAffixIds(build1Pack, "hewn_sword", "salvaged", sequenceDraw([0]))).toEqual([]);

    const imbuedPrefix = rollGearAffixIds(build1Pack, "hewn_sword", "imbued", sequenceDraw([0.1, 0]));
    expect(imbuedPrefix).toHaveLength(1);
    const prefix = build1Pack.affixes.find((entry) => entry.id === imbuedPrefix[0]);
    expect(prefix?.affixKind).toBe("prefix");

    const imbuedSuffix = rollGearAffixIds(build1Pack, "hewn_sword", "imbued", sequenceDraw([0.8, 0]));
    expect(imbuedSuffix).toHaveLength(1);
    expect(build1Pack.affixes.find((entry) => entry.id === imbuedSuffix[0])?.affixKind).toBe("suffix");

    const rare = rollGearAffixIds(build1Pack, "hewn_sword", "rare", sequenceDraw([0, 0, 0.99]));
    expect(rare.length).toBeGreaterThanOrEqual(2);
    const rareKinds = rare.map((id) => build1Pack.affixes.find((entry) => entry.id === id)?.affixKind);
    expect(rareKinds).toContain("prefix");
    expect(rareKinds).toContain("suffix");
    expect(rareKinds).not.toContain("curse");

    const rareCursed = rollGearAffixIds(build1Pack, "hewn_sword", "rare", sequenceDraw([0, 0, 0, 0]));
    expect(rareCursed.map((id) => build1Pack.affixes.find((entry) => entry.id === id)?.affixKind)).toContain("curse");

    const legendary = rollGearAffixIds(build1Pack, "gloomwood_spear", "legendary", sequenceDraw([0, 0, 0.99]));
    expect(legendary).toContain("hounds_pursuit");
    expect(signatureForDefinition("gloomwood_spear")).toBe("hounds_pursuit");
    const legendaryKinds = legendary.map((id) => build1Pack.affixes.find((entry) => entry.id === id)?.affixKind);
    expect(legendaryKinds).toContain("signature");
    expect(legendaryKinds).toContain("prefix");
    expect(legendaryKinds).toContain("suffix");
  });

  it("SIM-LOOT-02 rejects incompatible and tag-mismatched modules", () => {
    const withoutCard = rollGearAffixIds(build1Pack, "emberglass_cowl", "imbued", sequenceDraw([0.1, 0]));
    expect(withoutCard.every((id) => {
      const affix = build1Pack.affixes.find((entry) => entry.id === id)!;
      return !affix.requiresGrantedCard;
    })).toBe(true);

    const anchored = rollGearAffixIds(build1Pack, "hewn_sword", "rare", sequenceDraw([
      // pick anchored among prefixes — force by scanning: use many draws; instead assert filter via known pair
      0, 0, 0.99
    ]));
    // Force anchored + try long_vigil through a synthetic second call path:
    const forced = rollGearAffixIds(build1Pack, "hewn_sword", "rare", sequenceDraw([0, 0, 0.99]), ["anchored"]);
    expect(forced).toContain("anchored");
    expect(forced).not.toContain("long_vigil");

    const archivists = rollGearAffixIds(build1Pack, "archivists_focus", "rare", sequenceDraw([0, 0, 0.99]));
    expect(archivists).not.toContain("veiled_road");

    expect(anchored.length).toBeGreaterThan(0);
  });

  it("SIM-LOOT-03 different draw sequences produce different affix identities on the same vessel", () => {
    const a = rollGearAffixIds(build1Pack, "aether_rod", "rare", sequenceDraw([0, 0.1, 0.99]));
    const b = rollGearAffixIds(build1Pack, "aether_rod", "rare", sequenceDraw([0.5, 0.7, 0.99]));
    expect(a).not.toEqual(b);
  });
});
