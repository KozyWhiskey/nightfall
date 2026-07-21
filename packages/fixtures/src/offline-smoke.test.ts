import { describe, expect, it } from "vitest";
import type { CommandEnvelope, CommandType, GameSnapshot } from "@nightfall/contracts";
import { build1Pack } from "@nightfall/content";
import { LocalGameHost } from "@nightfall/host";
import { InMemoryGameStore } from "@nightfall/persistence";
import { createInitialSnapshot } from "@nightfall/sim";

async function accepted(host: LocalGameHost, snapshot: GameSnapshot, type: CommandType, payload: Record<string, unknown> = {}, actorId?: string): Promise<GameSnapshot> {
  const envelope: CommandEnvelope = { commandId: `smoke:${snapshot.revision + 1}:${type}`, expectedRevision: snapshot.revision, type, ...(actorId === undefined ? {} : { actorId }), payload };
  const result = await host.submit(envelope);
  if (result.status !== "accepted") throw new Error(`${type} rejected at revision ${snapshot.revision}: ${result.reasonCode}`);
  return result.snapshot;
}

async function playCombat(host: LocalGameHost, initial: GameSnapshot): Promise<GameSnapshot> {
  let snapshot = initial; const blockedTurns = new Set<string>();
  for (let step = 0; step < 500 && snapshot.view === "combat"; step += 1) {
    const combat = snapshot.activeRun!.combat!; const actor = combat.combatants.find((entry) => entry.id === combat.activeCombatantId)!;
    if (actor.side !== "heroes") throw new Error("Host returned control during an enemy turn");
    const resources = combat.heroResources.find((entry) => entry.heroId === actor.id)!;
    if (resources.ap <= 0) { snapshot = await accepted(host, snapshot, "endTurn", {}, actor.id); continue; }
    const enemies = combat.combatants.filter((entry) => entry.side === "enemies" && !entry.destroyed && entry.targetable);
    const target = enemies.find((entry) => entry.definitionId === "smothering_shroud") ?? [...enemies].sort((left, right) => left.hp - right.hp || left.id.localeCompare(right.id))[0];
    if (target === undefined) { snapshot = await host.getSnapshot(); continue; }
    const turnKey = `${combat.combatId}:${combat.round}:${actor.id}`;
    if (actor.hp / actor.maxHp < 0.42 && !blockedTurns.has(turnKey)) {
      blockedTurns.add(turnKey); snapshot = await accepted(host, snapshot, "useBasicBlock", {}, actor.id); continue;
    }
    const playable = combat.cards.filter((card) => card.ownerId === actor.id && card.zone === "hand" && card.presentation.summary.startsWith("Deal") && card.presentation.apCost <= resources.ap && card.presentation.manaCost <= resources.mana && card.presentation.staminaCost <= resources.stamina).sort((left, right) => (right.presentation.manaCost + right.presentation.staminaCost) - (left.presentation.manaCost + left.presentation.staminaCost));
    if (playable.length > 0) {
      const card = playable[0]!; const needsTarget = card.presentation.targetSpec === "enemy" || card.presentation.targetSpec === "ally";
      snapshot = await accepted(host, snapshot, "playCard", { cardInstanceId: card.cardInstanceId, ...(needsTarget ? { targetId: target.id } : {}) }, actor.id);
    } else snapshot = await accepted(host, snapshot, "useBasicAttack", { targetId: target.id }, actor.id);
  }
  if (snapshot.view === "combat") throw new Error("Combat smoke exceeded 500 commands");
  return snapshot;
}

describe("offline end-to-end smoke", () => {
  it("plays an authoritative saveable route through boss, waypoint, Return, and Haven", async () => {
    const initial = createInitialSnapshot(build1Pack, 9001, "Ashwake"); const store = new InMemoryGameStore(); const host = await LocalGameHost.open(store, build1Pack, initial); let snapshot = initial;
    snapshot = await accepted(host, snapshot, "commitEmbark");
    const route: Record<string, string> = { haven_gate: "edge_01", combat_1: "edge_03", early_event: "edge_05", combat_3: "edge_06", rest: "edge_08", combat_5: "edge_12", deep_event: "edge_16", combat_7: "edge_18", return_event: "edge_23" };
    for (let boundary = 0; boundary < 80 && snapshot.activeRun?.terminalResult === undefined; boundary += 1) {
      if (snapshot.view === "combat") snapshot = await playCombat(host, snapshot);
      else if (snapshot.view === "reward") {
        const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== "reward") throw new Error("Missing reward"); const scroll = decision.offers.find((offer) => offer.kind === "scroll"); snapshot = await accepted(host, snapshot, "chooseReward", { offerId: (scroll ?? decision.offers[0]!).id });
      } else if (snapshot.view === "map") {
        const edgeId = route[snapshot.activeRun!.currentNodeId]; if (edgeId === undefined) throw new Error(`No smoke route from ${snapshot.activeRun!.currentNodeId}`); snapshot = await accepted(host, snapshot, "chooseMapEdge", { edgeId });
      } else if (snapshot.view === "event") {
        const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== "event") throw new Error("Missing event"); const preferred: Record<string, string> = { last_courier: "feed_lantern", choir_in_the_bark: "free_names", fallen_waystation: "rekindle", cache_ember_pit: "haul", returning_echo: "fading_lamps" }; snapshot = await accepted(host, snapshot, "chooseEventOption", { optionId: preferred[decision.eventId] ?? decision.optionIds[0]! });
      } else if (snapshot.view === "rest") snapshot = await accepted(host, snapshot, "chooseRestOption", { optionId: "resupply" });
      else if (snapshot.view === "growth") {
        const decision = snapshot.activeRun!.pendingDecision; if (decision?.kind !== "temporary_growth") throw new Error("Missing growth"); snapshot = await accepted(host, snapshot, "assignTemporaryStat", { heroId: decision.heroIds[0]!, stat: "vit" });
      } else if (snapshot.view === "waypoint") snapshot = await accepted(host, snapshot, "chooseReturnEdge", { edgeId: "edge_21" });
      else throw new Error(`Unexpected smoke view ${snapshot.view}`);
    }
    expect(snapshot.activeRun?.terminalResult).toBe("return");
    expect(snapshot.campaign.claimedWaypointIds).toContain("whisperwood_waypoint");
    expect(snapshot.campaign.blueprintIds).toContain("ember_vault");
    expect(snapshot.haven.heroes).toHaveLength(2);
    expect((await store.listRunRecords())[0]?.result).toBe("return");
    snapshot = await accepted(host, snapshot, "continueToHaven");
    expect(snapshot.view).toBe("postReturn");
    snapshot = await accepted(host, snapshot, "continueToHaven");
    expect(snapshot.view).toBe("haven");
    expect(snapshot.activeRun).toBeUndefined();
  });
});
