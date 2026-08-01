import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { AnchorArtReview } from "./art/AnchorArtReview.js";
import "./styles.css";

const root = document.getElementById("root");
if (root === null) throw new Error("Nightfall root element is missing");
const isAnchorArtReview = new URLSearchParams(globalThis.location.search).get("artReview") === "anchors";
createRoot(root).render(<StrictMode>{isAnchorArtReview ? <AnchorArtReview /> : <App />}</StrictMode>);
