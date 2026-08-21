/** Mirrors Build 1 `pack.tuning.encounterRewards` for map greed copy (client stays snapshot-safe). */
const ENCOUNTER_GREED: Readonly<Record<string, { readonly carrierChance: number; readonly offerKinds: readonly string[] }>> = {
  roadside_trail: { carrierChance: 0, offerKinds: ["gear", "scroll"] },
  lost_mile: { carrierChance: 0.1, offerKinds: ["scroll", "scroll"] },
  whisperwood_threshold: { carrierChance: 0.05, offerKinds: ["gear", "scroll"] },
  rootbound_remains: { carrierChance: 0.18, offerKinds: ["gear", "gear"] },
  houndpack_fog: { carrierChance: 0.25, offerKinds: ["scroll", "scroll"] },
  stalking_choir: { carrierChance: 0.35, offerKinds: ["gear", "scroll"] },
  lantern_approach: { carrierChance: 0.1, offerKinds: ["gear", "supply"] },
  return_roadwardens: { carrierChance: 0, offerKinds: ["gear", "scroll"] },
  voice_ambush: { carrierChance: 0, offerKinds: ["gear", "scroll"] }
};

export type CarrierGreedBand = "none" | "scarce" | "uncommon" | "likely";

export function carrierGreedBand(carrierChance: number): CarrierGreedBand {
  if (carrierChance <= 0) return "none";
  if (carrierChance <= 0.1) return "scarce";
  if (carrierChance <= 0.2) return "uncommon";
  return "likely";
}

export function carrierGreedLine(band: CarrierGreedBand): string | undefined {
  if (band === "none") return undefined;
  if (band === "scarce") return "scarce chase";
  if (band === "uncommon") return "uncommon chase";
  return "marked prey more likely";
}

export function tableGreedLine(offerKinds: readonly string[]): string | undefined {
  const gear = offerKinds.filter((kind) => kind === "gear").length;
  const scroll = offerKinds.filter((kind) => kind === "scroll").length;
  const supply = offerKinds.filter((kind) => kind === "supply").length;
  if (gear === 0 && scroll === 0 && supply === 0) return undefined;
  if (gear > 0 && scroll === 0 && supply === 0) return "gear-leaning table";
  if (scroll > 0 && gear === 0 && supply === 0) return "scroll-leaning table";
  if (supply > 0 && gear === 0 && scroll === 0) return "supply-leaning table";
  if (gear > 0 && scroll > 0 && gear >= scroll) return "gear-leaning mixed table";
  if (scroll > 0 && gear > 0) return "scroll-leaning mixed table";
  return "mixed ordinary table";
}

/** Qualitative greed hint for a combat encounter content id. Never includes %. */
export function mapGreedHint(contentId: string | undefined): string | undefined {
  if (contentId === undefined) return undefined;
  const tuning = ENCOUNTER_GREED[contentId];
  if (tuning === undefined) return undefined;
  const chase = carrierGreedLine(carrierGreedBand(tuning.carrierChance));
  const table = tableGreedLine(tuning.offerKinds);
  const parts = [chase, table].filter((entry): entry is string => entry !== undefined);
  if (parts.length === 0) return undefined;
  return parts.join(" · ");
}

export function encounterGreedTable(): typeof ENCOUNTER_GREED {
  return ENCOUNTER_GREED;
}
