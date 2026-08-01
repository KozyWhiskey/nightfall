import type { RouteEdgeSnapshot, RouteNodeSnapshot } from "@nightfall/contracts";

export type NodePresentationState = "resolved" | "current" | "available" | "ahead" | "bypassed";
export type EdgePresentationState = "walked" | "available" | "ahead" | "bypassed";

export interface LaidOutNode {
  readonly id: string;
  readonly node: RouteNodeSnapshot;
  readonly depth: number;
  readonly row: number;
  readonly state: NodePresentationState;
  /** Edge used to travel here when available; undefined otherwise. */
  readonly edgeId?: string;
  readonly x: number;
  readonly y: number;
}

export interface LaidOutEdge {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly state: EdgePresentationState;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

export interface RouteLayout {
  readonly nodes: readonly LaidOutNode[];
  readonly edges: readonly LaidOutEdge[];
  readonly width: number;
  readonly height: number;
  readonly columns: number;
  readonly maxRows: number;
}

const COL_GAP = 112;
const ROW_GAP = 88;
const PAD_X = 48;
const PAD_Y = 40;
const NODE_W = 72;
const NODE_H = 64;

function longestPathDepths(
  nodeIds: readonly string[],
  edges: readonly RouteEdgeSnapshot[],
  rootId: string
): Map<string, number> {
  const incoming = new Map<string, string[]>();
  for (const id of nodeIds) incoming.set(id, []);
  for (const edge of edges) incoming.get(edge.to)?.push(edge.from);

  const depths = new Map<string, number>();
  const visit = (id: string): number => {
    const cached = depths.get(id);
    if (cached !== undefined) return cached;
    if (id === rootId) {
      depths.set(id, 0);
      return 0;
    }
    const parents = incoming.get(id) ?? [];
    const depth = parents.length === 0
      ? 0
      : Math.max(...parents.map((parent) => visit(parent))) + 1;
    depths.set(id, depth);
    return depth;
  };

  for (const id of nodeIds) visit(id);
  return depths;
}

function reachableFrom(
  startId: string,
  edges: readonly RouteEdgeSnapshot[]
): Set<string> {
  const outgoing = new Map<string, string[]>();
  for (const edge of edges) {
    const list = outgoing.get(edge.from) ?? [];
    list.push(edge.to);
    outgoing.set(edge.from, list);
  }
  const seen = new Set<string>();
  const stack = [startId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    for (const next of outgoing.get(id) ?? []) stack.push(next);
  }
  return seen;
}

export function isFoggedEvent(node: RouteNodeSnapshot): boolean {
  return (node.type === "event" || node.type === "return_event") && node.visibility === "hidden";
}

export function displayCategory(node: RouteNodeSnapshot): string {
  if (isFoggedEvent(node)) return "Unknown event";
  switch (node.type) {
    case "haven": return "Haven";
    case "combat":
    case "return_combat": return "Combat";
    case "event":
    case "return_event": return "Event";
    case "rest": return "Rest";
    case "safe_craft": return "Safe craft";
    case "boss": return "Boss";
    case "waypoint": return "Waypoint";
    default: return node.type;
  }
}

export function isDangerousCombat(node: RouteNodeSnapshot): boolean {
  return node.id === "combat_6" || node.contentId === "stalking_choir";
}

export function nodeIconKind(node: RouteNodeSnapshot): "haven" | "combat" | "event" | "rest" | "craft" | "boss" | "waypoint" | "dangerous" {
  if (isFoggedEvent(node) || node.type === "event" || node.type === "return_event") return "event";
  if (isDangerousCombat(node)) return "dangerous";
  if (node.type === "combat" || node.type === "return_combat") return "combat";
  if (node.type === "safe_craft") return "craft";
  if (node.type === "haven") return "haven";
  if (node.type === "rest") return "rest";
  if (node.type === "boss") return "boss";
  return "waypoint";
}

export function nodeStateLabel(state: NodePresentationState): string {
  switch (state) {
    case "current": return "You are here";
    case "available": return "Travel · +5 Run Gloom";
    case "resolved": return "Visited";
    case "ahead": return "Ahead on the road";
    case "bypassed": return "Path not taken";
  }
}

export function layoutRoute(input: {
  nodes: readonly RouteNodeSnapshot[];
  edges: readonly RouteEdgeSnapshot[];
  currentNodeId: string;
  visitedNodeIds: readonly string[];
  rootId?: string;
}): RouteLayout {
  const rootId = input.rootId ?? "haven_gate";
  const nodeOrder = input.nodes.map((node) => node.id);
  const byId = new Map(input.nodes.map((node) => [node.id, node]));
  const depths = longestPathDepths(nodeOrder, input.edges, rootId);
  const visited = new Set(input.visitedNodeIds);
  const reachable = reachableFrom(input.currentNodeId, input.edges);
  const availableEdgeByTo = new Map<string, string>();
  for (const edge of input.edges) {
    if (edge.from === input.currentNodeId) availableEdgeByTo.set(edge.to, edge.id);
  }

  const columns = new Map<number, string[]>();
  for (const id of nodeOrder) {
    const depth = depths.get(id) ?? 0;
    const list = columns.get(depth) ?? [];
    list.push(id);
    columns.set(depth, list);
  }

  const maxDepth = columns.size === 0 ? 0 : Math.max(...columns.keys());
  let maxRows = 1;
  for (const ids of columns.values()) maxRows = Math.max(maxRows, ids.length);

  const positions = new Map<string, { depth: number; row: number; x: number; y: number }>();
  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const ids = columns.get(depth) ?? [];
    ids.forEach((id, row) => {
      const x = PAD_X + depth * COL_GAP + NODE_W / 2;
      const columnHeight = Math.max(ids.length, 1) * ROW_GAP;
      const startY = PAD_Y + (maxRows * ROW_GAP - columnHeight) / 2 + ROW_GAP / 2;
      const y = startY + row * ROW_GAP;
      positions.set(id, { depth, row, x, y });
    });
  }

  const laidNodes: LaidOutNode[] = [];
  for (const id of nodeOrder) {
    const node = byId.get(id)!;
    const pos = positions.get(id)!;
    let state: NodePresentationState;
    if (id === input.currentNodeId) state = "current";
    else if (availableEdgeByTo.has(id)) state = "available";
    else if (visited.has(id)) state = "resolved";
    else if (reachable.has(id)) state = "ahead";
    else state = "bypassed";

    laidNodes.push({
      id,
      node,
      depth: pos.depth,
      row: pos.row,
      state,
      edgeId: availableEdgeByTo.get(id),
      x: pos.x,
      y: pos.y
    });
  }

  const walkedPairs = new Set<string>();
  for (let index = 0; index < input.visitedNodeIds.length - 1; index += 1) {
    walkedPairs.add(`${input.visitedNodeIds[index]}→${input.visitedNodeIds[index + 1]}`);
  }

  const laidEdges: LaidOutEdge[] = input.edges.map((edge) => {
    const from = positions.get(edge.from)!;
    const to = positions.get(edge.to)!;
    const pairKey = `${edge.from}→${edge.to}`;

    let state: EdgePresentationState;
    if (edge.from === input.currentNodeId && availableEdgeByTo.has(edge.to)) state = "available";
    else if (walkedPairs.has(pairKey)) state = "walked";
    else if (reachable.has(edge.from) && reachable.has(edge.to)) state = "ahead";
    else state = "bypassed";

    return {
      id: edge.id,
      fromId: edge.from,
      toId: edge.to,
      state,
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y
    };
  });

  return {
    nodes: laidNodes,
    edges: laidEdges,
    width: PAD_X * 2 + maxDepth * COL_GAP + NODE_W,
    height: PAD_Y * 2 + maxRows * ROW_GAP,
    columns: maxDepth + 1,
    maxRows
  };
}

export const ROUTE_NODE_SIZE = { width: NODE_W, height: NODE_H } as const;
