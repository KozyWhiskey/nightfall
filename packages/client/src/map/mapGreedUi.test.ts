import { describe, expect, it } from "vitest";
import { build1Pack } from "@nightfall/content";
import {
  carrierGreedBand,
  carrierGreedLine,
  mapGreedHint,
  tableGreedLine
} from "./mapGreedUi.js";

describe("mapGreedUi", () => {
  it("bands carrier chance without exposing percents", () => {
    expect(carrierGreedBand(0)).toBe("none");
    expect(carrierGreedBand(0.05)).toBe("scarce");
    expect(carrierGreedBand(0.1)).toBe("scarce");
    expect(carrierGreedBand(0.18)).toBe("uncommon");
    expect(carrierGreedBand(0.35)).toBe("likely");
    expect(carrierGreedLine("likely")).toBe("marked prey more likely");
    expect(carrierGreedLine("likely")).not.toMatch(/%/);
  });

  it("describes offer tables qualitatively", () => {
    expect(tableGreedLine(["gear", "scroll"])).toBe("gear-leaning mixed table");
    expect(tableGreedLine(["scroll", "scroll"])).toBe("scroll-leaning table");
    expect(tableGreedLine(["gear", "gear"])).toBe("gear-leaning table");
  });

  it("builds pack-backed hints for Unlit Road encounters", () => {
    expect(mapGreedHint("roadside_trail")).toBe("gear-leaning mixed table");
    expect(mapGreedHint("stalking_choir")).toContain("marked prey more likely");
    expect(mapGreedHint("stalking_choir")).not.toMatch(/0\.|%/);
    expect(mapGreedHint("houndpack_fog")).toContain("marked prey more likely");
    expect(mapGreedHint("lost_mile")).toContain("scarce chase");
    expect(mapGreedHint(undefined)).toBeUndefined();
    expect(mapGreedHint("not_a_real_encounter")).toBeUndefined();
  });

  it("mirrors Build 1 encounter reward ids for combat greed", () => {
    for (const [id, tuning] of Object.entries(build1Pack.tuning.encounterRewards)) {
      const hint = mapGreedHint(id);
      if (tuning.carrierChance <= 0 && tuning.offerKinds.length === 0) {
        expect(hint).toBeUndefined();
      } else {
        expect(hint).toBeTruthy();
        expect(hint).not.toMatch(/%|\d\.\d/);
      }
    }
  });
});
