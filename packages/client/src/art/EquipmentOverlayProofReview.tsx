import { useState } from "react";
import { VANGUARD_OVERLAY_PROFILES, type VanguardOverlayId } from "./equipmentOverlayProof.js";
import "./equipmentOverlayProof.css";

const overlays: Record<VanguardOverlayId, { label: string; src: string }> = {
  hewn_sword: { label: "Hewn Sword", src: "/art/proofs/hewn_sword_overlay_v1.png" },
  gloomwood_spear: { label: "Gloomwood Spear", src: "/art/proofs/gloomwood_spear_overlay_v1.png" },
  kite_shield: { label: "Kite Shield", src: "/art/proofs/kite_shield_overlay_v1.png" }
};

function ProofComposite({ id, size }: { id: VanguardOverlayId; size: "desktop" | "narrow" }) {
  const profile = VANGUARD_OVERLAY_PROFILES[id];
  const target = profile.slot === "mainHand" ? { x: 30.7, y: 49.7 } : { x: 68, y: 42.8 };
  return <div className={`equipment-proof-swatch is-${size}`}>
    <img className="equipment-proof-overlay" src={overlays[id].src} alt="" style={{ left: `${target.x}%`, top: `${target.y}%` }} />
    <img className="equipment-proof-base" src="/art/proofs/vanguard_base_v2.png" alt="Vanguard proof base" />
  </div>;
}

export function EquipmentOverlayProofReview() {
  const [active, setActive] = useState<VanguardOverlayId>("hewn_sword");
  return <main className="equipment-proof-page">
    <header><span>Development fixture · ?artReview=equipment</span><h1>Vanguard equipment-layer proof</h1><p>Proof-only anchor data; no gameplay state or production standee is changed.</p></header>
    <div className="equipment-proof-tabs">{(Object.keys(overlays) as VanguardOverlayId[]).map((id) => <button key={id} className={active === id ? "is-active" : ""} onClick={() => setActive(id)}>{overlays[id].label}</button>)}</div>
    <section className="equipment-proof-review"><div><ProofComposite id={active} size="desktop" /><small>86 × 115</small></div><div><ProofComposite id={active} size="narrow" /><small>72 × 96</small></div></section>
    <p>Anchor: {VANGUARD_OVERLAY_PROFILES[active].slot} · grip ({VANGUARD_OVERLAY_PROFILES[active].gripAnchor.x}, {VANGUARD_OVERLAY_PROFILES[active].gripAnchor.y}) · layer {VANGUARD_OVERLAY_PROFILES[active].layer}</p>
  </main>;
}
