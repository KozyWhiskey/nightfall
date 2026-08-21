import type { DecisionChoiceSnapshot, ExpeditionRunSnapshot } from "@nightfall/contracts";
import { describe, expect, it } from "vitest";
import { choiceConfirmSummary, choicePresentation, relevantMaterials } from "./decisionUi.js";

function runWithMaterials(overrides: Partial<ExpeditionRunSnapshot["materials"]> = {}): ExpeditionRunSnapshot {
  return {
    materials: {
      salvage: 2,
      emberglass: 1,
      rations: 1,
      timber: 1,
      stone: 1,
      wick: 0,
      ember_shard: 0,
      ...overrides
    }
  } as ExpeditionRunSnapshot;
}

describe("relevantMaterials", () => {
  it("returns only material ids referenced by choice costs", () => {
    const choices: DecisionChoiceSnapshot[] = [
      { id: "a", label: "A", detail: "", cost: { emberglass: 2 } },
      { id: "b", label: "B", detail: "", cost: { emberglass: 1, rations: 1 } },
      { id: "c", label: "C", detail: "" }
    ];
    expect(relevantMaterials(runWithMaterials(), choices)).toEqual([
      { id: "emberglass", amount: 1 },
      { id: "rations", amount: 1 }
    ]);
  });

  it("includes materials an option can grant even without a cost", () => {
    const choices: DecisionChoiceSnapshot[] = [
      { id: "haul", label: "Haul", detail: "", grantMaterials: { emberglass: 3 } },
      { id: "cache", label: "Cache", detail: "", grantMaterials: { salvage: 2, emberglass: 1 } }
    ];
    expect(relevantMaterials(runWithMaterials(), choices)).toEqual([
      { id: "emberglass", amount: 1 },
      { id: "salvage", amount: 2 }
    ]);
  });

  it("ignores scroll/gear target keys and yields empty when no material costs", () => {
    const choices: DecisionChoiceSnapshot[] = [
      { id: "toss", label: "Toss", detail: "", cost: { unlearned_scroll: 1, gear: 1 } },
      { id: "free", label: "Free", detail: "No cost" }
    ];
    expect(relevantMaterials(runWithMaterials(), choices)).toEqual([]);
  });
});

describe("choicePresentation", () => {
  it("splits Choir-style structured fields into Cost / Outcome / Odds", () => {
    const freeNames: DecisionChoiceSnapshot = {
      id: "free_names",
      label: "Carve the names free",
      detail: "legacy",
      effectLines: ["-10 Run Gloom", "gain next combat block"],
      outcomeBands: [
        { id: "steady", weight: 50, label: "steady" },
        { id: "strained", weight: 50, label: "strained" }
      ],
      riskTier: "risky"
    };
    const familiar: DecisionChoiceSnapshot = {
      id: "familiar_voice",
      label: "Follow a familiar voice",
      detail: "legacy",
      effectLines: [],
      outcomeBands: [
        { id: "rare_scroll", weight: 40, label: "rare scroll" },
        { id: "imbued_relic", weight: 30, label: "imbued relic" },
        { id: "ambush", weight: 30, label: "ambush" }
      ],
      riskTier: "risky"
    };
    const resin: DecisionChoiceSnapshot = {
      id: "black_resin",
      label: "Cut the black resin",
      detail: "legacy",
      effectLines: ["gain unstable resin"],
      outcomeBands: []
    };

    expect(choicePresentation(freeNames)).toMatchObject({
      cost: "No cost",
      outcomes: ["-10 Run Gloom", "gain next combat block"],
      odds: ["50% Steady", "50% Strained"],
      guaranteed: false,
      structured: true
    });
    expect(choicePresentation(familiar)).toMatchObject({
      cost: "No cost",
      outcomes: ["One of the chance bands below"],
      odds: ["40% Rare Scroll", "30% Imbued Relic", "30% Ambush"],
      guaranteed: false
    });
    expect(choicePresentation(resin)).toMatchObject({
      cost: "No cost",
      outcomes: ["gain unstable resin"],
      odds: ["Guaranteed result"],
      guaranteed: true
    });
  });

  it("falls back to detail when structured fields are absent", () => {
    const rest: DecisionChoiceSnapshot = {
      id: "resupply",
      label: "Resupply",
      detail: "Fully restore both heroes' Mana and Stamina."
    };
    expect(choicePresentation(rest)).toEqual({
      cost: "No cost",
      outcomes: ["Fully restore both heroes' Mana and Stamina."],
      odds: ["Guaranteed result"],
      guaranteed: true,
      structured: false
    });
  });

  it("confirm summary reprints Cost, Outcome, and Odds", () => {
    const summary = choiceConfirmSummary({
      id: "free_names",
      label: "Carve the names free",
      detail: "legacy",
      effectLines: ["-10 Run Gloom"],
      outcomeBands: [{ id: "steady", weight: 50, label: "steady" }],
      riskTier: "risky"
    });
    expect(summary).toContain("Carve the names free");
    expect(summary).toContain("Cost: No cost");
    expect(summary).toContain("Outcome: -10 Run Gloom");
    expect(summary).toContain("Odds: 50% Steady");
  });
});
