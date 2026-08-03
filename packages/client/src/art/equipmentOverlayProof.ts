/**
 * Presentation-only data for the bounded Vanguard equipment-layer proof.
 * Coordinates are normalized against the 992 × 1152 proof base canvas.
 * This deliberately has no simulation or inventory dependency.
 */
export type NormalizedPoint = Readonly<{ x: number; y: number }>;

export type VanguardPoseAnchors = Readonly<{
  canvas: Readonly<{ width: 992; height: 1152 }>;
  mainHand: NormalizedPoint;
  offHand: NormalizedPoint;
}>;

export const VANGUARD_PROOF_POSE_ANCHORS: VanguardPoseAnchors = {
  canvas: { width: 992, height: 1152 },
  // New proof-base fist centres: lowered screen-left and raised screen-right.
  mainHand: { x: 0.307, y: 0.497 },
  offHand: { x: 0.68, y: 0.428 }
};

export type VanguardOverlayId = "hewn_sword" | "gloomwood_spear" | "kite_shield";

export type VanguardOverlayProfile = Readonly<{
  id: VanguardOverlayId;
  slot: "mainHand" | "offHand";
  /** Grip/strap position within the overlay source, normalized 0–1. */
  gripAnchor: NormalizedPoint;
  rotationDeg: number;
  scale: number;
  /** Allows the base hand to render over a weapon grip or shield strap. */
  layer: "behindBase" | "front";
}>;

/**
 * The spear deliberately uses a different rotation and shaft grip from the sword.
 * Direction is an asset profile, never inferred from item category.
 */
export const VANGUARD_OVERLAY_PROFILES: Readonly<Record<VanguardOverlayId, VanguardOverlayProfile>> = {
  hewn_sword: {
    id: "hewn_sword",
    slot: "mainHand",
    gripAnchor: { x: 0.73, y: 0.2 },
    rotationDeg: 0,
    scale: 1,
    layer: "behindBase"
  },
  gloomwood_spear: {
    id: "gloomwood_spear",
    slot: "mainHand",
    gripAnchor: { x: 0.79, y: 0.84 },
    rotationDeg: 0,
    scale: 1,
    layer: "behindBase"
  },
  kite_shield: {
    id: "kite_shield",
    slot: "offHand",
    gripAnchor: { x: 0.12, y: 0.5 },
    rotationDeg: 0,
    scale: 1,
    layer: "behindBase"
  }
};

export function anchorForVanguardOverlay(id: VanguardOverlayId): NormalizedPoint {
  return VANGUARD_OVERLAY_PROFILES[id].slot === "mainHand"
    ? VANGUARD_PROOF_POSE_ANCHORS.mainHand
    : VANGUARD_PROOF_POSE_ANCHORS.offHand;
}
