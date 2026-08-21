import { describe, expect, it } from "vitest";
import { build1Pack } from "@nightfall/content";
import { createItemInstance } from "@nightfall/sim";

describe("Item display description grammar", () => {
  it("uses full Frayed curse sentence with section-friendly prefix", () => {
    const item = createItemInstance(
      build1Pack,
      "hewn_sword",
      "imbued",
      7,
      "desc:frayed",
      { kind: "held_by_expedition", runId: "run-1" },
      ["frayed"]
    );
    expect(item.curseId).toBe("frayed");
    expect(item.displaySnapshot.description).toContain(
      "Curse — Frayed: Granted card deals 1 direct damage to its caster on play."
    );
    expect(item.displaySnapshot.description).not.toMatch(/^Frayed$/m);
    expect(item.displaySnapshot.description).not.toContain("Curse: Frayed");
    expect(item.displaySnapshot.description).not.toContain("Granted card deals 1 self damage");
  });

  it("uses full Hollow curse sentence and keeps deck inject prefix", () => {
    const item = createItemInstance(
      build1Pack,
      "hewn_sword",
      "imbued",
      8,
      "desc:hollow",
      { kind: "held_by_expedition", runId: "run-1" },
      ["hollow"]
    );
    expect(item.displaySnapshot.description).toMatch(/^Adds to deck:/m);
    expect(item.displaySnapshot.description).toContain(
      "Curse — Hollow: Granted card Exhausts after use."
    );
    expect(item.displaySnapshot.description).not.toContain("Granted card exhausts");
  });

  it("uses full Overdrawn curse sentence", () => {
    const item = createItemInstance(
      build1Pack,
      "hewn_sword",
      "imbued",
      9,
      "desc:overdrawn",
      { kind: "held_by_expedition", runId: "run-1" },
      ["overdrawn"]
    );
    expect(item.displaySnapshot.description).toContain(
      "Curse — Overdrawn: Granted card costs +1 of its existing secondary resource."
    );
    expect(item.displaySnapshot.description).not.toContain("secondary cost on the granted card");
  });

  it("keeps Learn prefix for scrolls", () => {
    const item = createItemInstance(
      build1Pack,
      "scroll_still_wall",
      "salvaged",
      3,
      "desc:scroll",
      { kind: "held_by_expedition", runId: "run-1" }
    );
    expect(item.displaySnapshot.description).toMatch(/^Learn /m);
  });
});
