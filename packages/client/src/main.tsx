import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { AnchorArtReview } from "./art/AnchorArtReview.js";
import { EquipmentOverlayProofReview } from "./art/EquipmentOverlayProofReview.js";
import "./styles.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Nightfall root element is missing");
const artReview = new URLSearchParams(globalThis.location.search).get("artReview");
createRoot(root).render(<StrictMode>{artReview === "anchors" ? <AnchorArtReview /> : artReview === "equipment" ? <EquipmentOverlayProofReview /> : <App />}</StrictMode>);
