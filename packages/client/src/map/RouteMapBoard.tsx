import type { ExpeditionRunSnapshot } from "@nightfall/contracts";
import {
  displayCategory,
  isFoggedEvent,
  layoutRoute,
  nodeIconKind,
  nodeStateLabel,
  ROUTE_NODE_SIZE,
  type LaidOutNode
} from "./routeLayout.js";
import { mapGreedHint } from "./mapGreedUi.js";

function NodeGlyph({ kind }: { kind: ReturnType<typeof nodeIconKind> }) {
  switch (kind) {
    case "combat":
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18 L10 8 L14 12 L20 4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M7 18 H17" stroke="currentColor" strokeWidth="2" /></svg>;
    case "dangerous":
      return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" opacity=".22" /><path d="M4 18 L10 8 L14 12 L20 4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M7 18 H17" stroke="currentColor" strokeWidth="2" /><path d="M12 3 V7" stroke="currentColor" strokeWidth="1.6" /></svg>;
    case "event":
      return <span className="route-node-q" aria-hidden="true">?</span>;
    case "rest":
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 V10 L12 5 L18 10 V18 Z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="13" r="2.2" fill="currentColor" /></svg>;
    case "craft":
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16 H19 V19 H5 Z" fill="currentColor" opacity=".55" /><path d="M8 16 V9 H16 V16" fill="none" stroke="currentColor" strokeWidth="2" /></svg>;
    case "boss":
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 L19 8 L17 18 H7 L5 8 Z" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="11" r="2.5" fill="currentColor" /></svg>;
    case "waypoint":
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 L15 10 H21 L16 14 L18 21 L12 17 L6 21 L8 14 L3 10 H9 Z" fill="currentColor" opacity=".85" /></svg>;
    case "haven":
    default:
      return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 20 V9 L12 5 L16 9 V20" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M10 12 H14 V20 H10 Z" fill="currentColor" opacity=".55" /></svg>;
  }
}

function nodeTitle(laid: LaidOutNode): string {
  if (isFoggedEvent(laid.node) && laid.state !== "resolved" && laid.state !== "current") return "?";
  return laid.node.label.replace(/^\?\s*/, "");
}

export function RouteMapBoard({
  run,
  onChooseEdge
}: {
  run: ExpeditionRunSnapshot;
  onChooseEdge: (edgeId: string) => void;
}) {
  const layout = layoutRoute({
    nodes: run.nodes,
    edges: run.edges,
    currentNodeId: run.currentNodeId,
    visitedNodeIds: run.visitedNodeIds
  });

  return (
    <section className="route-board" aria-label="Expedition path">
      <div className="route-board-scroll">
        <div className="route-board-canvas" style={{ width: layout.width, height: layout.height }}>
          <svg className="route-board-edges" width={layout.width} height={layout.height} aria-hidden="true">
            {layout.edges.map((edge) => (
              <line
                key={edge.id}
                className={`route-edge is-${edge.state}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
              />
            ))}
          </svg>

          {layout.nodes.map((laid) => {
            const kind = nodeIconKind(laid.node);
            const category = displayCategory(laid.node);
            const title = nodeTitle(laid);
            const fullTitle = isFoggedEvent(laid.node) && laid.state !== "resolved" && laid.state !== "current"
              ? "Unknown event"
              : laid.node.label.replace(/^\?\s*/, "");
            const stateText = nodeStateLabel(laid.state);
            const dangerNote = kind === "dangerous" ? " High-risk optional fight." : "";
            const greedHint = mapGreedHint(laid.node.contentId);
            const greedNote = greedHint !== undefined ? ` ${greedHint}.` : "";
            const available = laid.state === "available" && laid.edgeId !== undefined;
            const style = {
              left: laid.x - ROUTE_NODE_SIZE.width / 2,
              top: laid.y - ROUTE_NODE_SIZE.height / 2,
              width: ROUTE_NODE_SIZE.width,
              height: ROUTE_NODE_SIZE.height
            };
            const className = `route-node is-${laid.state} is-${kind}`;
            const aria = `${category}: ${fullTitle}. ${stateText}.${dangerNote}${greedNote}`;

            if (available) {
              return (
                <button
                  key={laid.id}
                  type="button"
                  className={className}
                  style={style}
                  title={`${fullTitle} — ${stateText}${dangerNote}${greedHint !== undefined ? ` · ${greedHint}` : ""}`}
                  onClick={() => onChooseEdge(laid.edgeId!)}
                  aria-label={`${aria} Activate to travel`}
                >
                  <span className="route-node-icon"><NodeGlyph kind={kind} /></span>
                  <strong>{title}</strong>
                  <small>{kind === "dangerous" ? "Danger · +5 Gloom" : stateText}</small>
                </button>
              );
            }

            return (
              <div
                key={laid.id}
                className={className}
                style={style}
                title={`${fullTitle} — ${stateText}${dangerNote}${greedHint !== undefined ? ` · ${greedHint}` : ""}`}
                aria-label={aria}
                role="img"
              >
                <span className="route-node-icon"><NodeGlyph kind={kind} /></span>
                <strong>{title}</strong>
                <small>{kind === "dangerous" && laid.state === "ahead" ? "High-risk ahead" : stateText}</small>
              </div>
            );
          })}
        </div>
      </div>
      <p className="route-board-legend">
        <span><i className="is-walked" /> Walked</span>
        <span><i className="is-current" /> You are here</span>
        <span><i className="is-available" /> Next road (+5 Gloom)</span>
        <span><i className="is-bypassed" /> Not taken</span>
        <span><i className="is-dangerous" /> Black lantern — dangerous</span>
      </p>
    </section>
  );
}
