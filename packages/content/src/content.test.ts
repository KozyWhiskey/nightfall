import { describe, expect, it } from "vitest";
import { build1Pack, canonicalSerialize, hashCanonicalContent, rawBuild1Pack, validateAffixCompatibility, validateContentPack } from "./index.js";

describe("Build 1 content", () => {
  it("validates, freezes, and hashes canonically", () => {
    expect(build1Pack.contentVersion).toBe("nightfall.vslice.1");
    expect(build1Pack.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.isFrozen(build1Pack)).toBe(true);
    expect(canonicalSerialize({ z: 1, a: { y: 2, b: 3 } })).toBe('{"a":{"b":3,"y":2},"z":1}');
    expect(hashCanonicalContent({ b: 2, a: 1 })).toBe(hashCanonicalContent({ a: 1, b: 2 }));
  });

  it("rejects future schools and archived content", () => {
    const future = structuredClone(rawBuild1Pack);
    const blackThread = future.cards.find((card) => card.id === "black_thread");
    if (blackThread !== undefined) blackThread.learnable = true;
    expect(() => validateContentPack(future)).toThrow(/future Umbra school/);

    const archived = structuredClone(rawBuild1Pack);
    archived.events[0] = { ...archived.events[0]!, id: "survivor_lantern_child" };
    expect(() => validateContentPack(archived)).toThrow(/Archived event/);
  });

  it("rejects incompatible affixes", () => {
    const item = build1Pack.items.find((entry) => entry.id === "cracked_way_lens")!;
    const anchored = build1Pack.affixes.find((entry) => entry.id === "anchored")!;
    expect(() => validateAffixCompatibility(item, [anchored])).toThrow(/requires a granted card/);
  });
});
