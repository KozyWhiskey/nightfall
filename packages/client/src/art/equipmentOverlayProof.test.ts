import { describe, expect, it } from "vitest";
import {
  VANGUARD_OVERLAY_PROFILES,
  VANGUARD_PROOF_POSE_ANCHORS,
  anchorForVanguardOverlay
} from "./equipmentOverlayProof.js";

describe("Vanguard equipment-overlay proof data", () => {
  it("uses the locked proof canvas and normalized attachment points", () => {
    expect(VANGUARD_PROOF_POSE_ANCHORS.canvas).toEqual({ width: 992, height: 1152 });
    for (const point of Object.values(VANGUARD_PROOF_POSE_ANCHORS).filter(
      (value): value is { x: number; y: number } => "x" in value
    )) {
      expect(point.x).toBeGreaterThan(0);
      expect(point.x).toBeLessThan(1);
      expect(point.y).toBeGreaterThan(0);
      expect(point.y).toBeLessThan(1);
    }
  });

  it("keeps the two main-hand items attached to the same pose anchor", () => {
    expect(anchorForVanguardOverlay("hewn_sword")).toBe(VANGUARD_PROOF_POSE_ANCHORS.mainHand);
    expect(anchorForVanguardOverlay("gloomwood_spear")).toBe(VANGUARD_PROOF_POSE_ANCHORS.mainHand);
    expect(anchorForVanguardOverlay("kite_shield")).toBe(VANGUARD_PROOF_POSE_ANCHORS.offHand);
    expect(VANGUARD_OVERLAY_PROFILES.gloomwood_spear.gripAnchor)
      .not.toEqual(VANGUARD_OVERLAY_PROFILES.hewn_sword.gripAnchor);
  });
});
