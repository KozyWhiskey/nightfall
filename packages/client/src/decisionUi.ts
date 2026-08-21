import type { CardInstanceSnapshot, DecisionChoiceSnapshot, ExpeditionRunSnapshot, GameSnapshot, HeroCombatResources, ItemInstance } from "@nightfall/contracts";

const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const NON_MATERIAL_COST_KEYS = new Set(["unlearned_scroll", "gear", "target"]);

export function costLabel(cost: Readonly<Record<string, number>> | undefined): string {
  if (cost === undefined) return "No cost";
  const entries = Object.entries(cost).filter(([, amount]) => amount > 0);
  if (entries.length === 0) return "No cost";
  return entries.map(([id, amount]) => `${amount} ${titleCase(id)}`).join(" · ");
}

export function cardAffordability(
  resources: HeroCombatResources | undefined,
  card: Pick<CardInstanceSnapshot, "presentation">
): { ok: boolean; reason?: string } {
  if (resources === undefined) return { ok: false, reason: "Not your turn" };
  const { apCost, manaCost, staminaCost } = card.presentation;
  if (resources.ap < apCost) return { ok: false, reason: `Need ${apCost} AP · have ${resources.ap}` };
  if (resources.mana < manaCost) return { ok: false, reason: `Need ${manaCost} Mana · have ${resources.mana}` };
  if (resources.stamina < staminaCost) return { ok: false, reason: `Need ${staminaCost} Stamina · have ${resources.stamina}` };
  return { ok: true };
}

export function basicAffordability(
  resources: HeroCombatResources | undefined,
  apCost: number
): { ok: boolean; reason?: string } {
  if (resources === undefined) return { ok: false, reason: "Not your turn" };
  if (resources.ap < apCost) return { ok: false, reason: `Need ${apCost} AP · have ${resources.ap}` };
  return { ok: true };
}

export function affordability(
  run: ExpeditionRunSnapshot,
  cost: Readonly<Record<string, number>> | undefined
): { ok: boolean; missing: string[] } {
  if (cost === undefined) return { ok: true, missing: [] };
  const missing: string[] = [];
  for (const [id, amount] of Object.entries(cost)) {
    if (amount <= 0) continue;
    if (id === "unlearned_scroll") {
      const have = run.holdings.filter((item) => item.itemKind === "scroll" && item.location.kind === "held_by_expedition").length;
      if (have < amount) missing.push(`Need ${amount} unlearned scroll · have ${have}`);
      continue;
    }
    if (id === "gear" || id === "target") {
      const have = run.holdings.filter((item) => item.itemKind === "equipment" && item.location.kind !== "lost" && item.location.kind !== "consumed").length;
      if (have < amount) missing.push(`Need ${amount} gear · have ${have}`);
      continue;
    }
    const have = run.materials[id as keyof typeof run.materials] ?? 0;
    if (have < amount) missing.push(`Need ${amount} ${titleCase(id)} · have ${have}`);
  }
  return { ok: missing.length === 0, missing };
}

export function packItems(snapshot: GameSnapshot): ItemInstance[] {
  const run = snapshot.activeRun;
  if (run === undefined) return snapshot.haven.holdings.filter((item) => item.location.kind === "haven");
  return run.holdings.filter((item) => item.location.kind === "held_by_expedition");
}

export function equippableItems(snapshot: GameSnapshot): ItemInstance[] {
  return packItems(snapshot).filter((item) => item.itemKind === "equipment");
}

export function learnableScrolls(snapshot: GameSnapshot): ItemInstance[] {
  return packItems(snapshot).filter((item) => item.itemKind === "scroll");
}

export function materialLines(run: ExpeditionRunSnapshot): { id: string; amount: number }[] {
  return Object.entries(run.materials).map(([id, amount]) => ({ id, amount }));
}

/** Materials referenced by any choice cost or grant (excludes scroll/gear target keys). */
export function relevantMaterials(
  run: ExpeditionRunSnapshot,
  choices: readonly DecisionChoiceSnapshot[]
): { id: string; amount: number }[] {
  const ids = new Set<string>();
  for (const choice of choices) {
    if (choice.cost !== undefined) {
      for (const [id, amount] of Object.entries(choice.cost)) {
        if (amount <= 0 || NON_MATERIAL_COST_KEYS.has(id)) continue;
        if (id in run.materials) ids.add(id);
      }
    }
    if (choice.grantMaterials !== undefined) {
      for (const [id, amount] of Object.entries(choice.grantMaterials)) {
        if (amount <= 0) continue;
        if (id in run.materials) ids.add(id);
      }
    }
  }
  return [...ids]
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({ id, amount: run.materials[id as keyof typeof run.materials] ?? 0 }));
}

export function choicePresentation(choice: DecisionChoiceSnapshot): {
  cost: string;
  outcomes: string[];
  odds: string[];
  guaranteed: boolean;
  structured: boolean;
} {
  const cost = costLabel(choice.cost);
  const structured = choice.effectLines !== undefined || choice.outcomeBands !== undefined;
  if (!structured) {
    return {
      cost,
      outcomes: choice.detail.length > 0 ? [choice.detail] : [],
      odds: ["Guaranteed result"],
      guaranteed: true,
      structured: false
    };
  }
  const bands = choice.outcomeBands ?? [];
  const guaranteed = bands.length === 0;
  const effectLines = choice.effectLines ?? [];
  const outcomes = effectLines.length > 0
    ? [...effectLines]
    : guaranteed
      ? []
      : ["One of the chance bands below"];
  const odds = guaranteed
    ? ["Guaranteed result"]
    : bands.map((band) => `${band.weight}% ${titleCase(band.label)}`);
  return { cost, outcomes, odds, guaranteed, structured: true };
}

export function choiceConfirmSummary(choice: DecisionChoiceSnapshot): string {
  const presentation = choicePresentation(choice);
  const parts = [
    `Cost: ${presentation.cost}`,
    presentation.outcomes.length > 0 ? `Outcome: ${presentation.outcomes.join("; ")}` : undefined,
    `Odds: ${presentation.odds.join("; ")}`
  ].filter((part): part is string => part !== undefined);
  return `${choice.label}\n${parts.join("\n")}\nProceed?`;
}

export function gloomPressure(value: number): {
  band: string;
  nextAt: number | null;
  nextBand: string | null;
  nextEffect: string;
} {
  if (value < 40) {
    return {
      band: "Held at Bay",
      nextAt: 40,
      nextBand: "Encroaching",
      nextEffect: "At 40: enemies gain +3 Gloom Block on combat start"
    };
  }
  if (value < 70) {
    return {
      band: "Encroaching",
      nextAt: 70,
      nextBand: "Pressing",
      nextEffect: "At 70: one hero begins combat with Strain"
    };
  }
  if (value < 90) {
    return {
      band: "Pressing",
      nextAt: 90,
      nextBand: "Overrun",
      nextEffect: "At 90: all heroes begin combat with Strain"
    };
  }
  return {
    band: "Overrun",
    nextAt: null,
    nextBand: null,
    nextEffect: "Overrun: all heroes begin combat with Strain"
  };
}

export function humanizeEventChoice(raw: string): string {
  return raw
    .split(".")
    .map((part) => titleCase(part))
    .join(" · ");
}

export function choiceRiskLabel(choice: DecisionChoiceSnapshot): string | undefined {
  if (choice.riskTier === "dire") return "Dire risk";
  if (choice.riskTier === "risky") return "Risky";
  if (choice.riskTier === "safe") return "Safe";
  return undefined;
}

export { titleCase };
