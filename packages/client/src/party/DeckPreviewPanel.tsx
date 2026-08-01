import { useMemo } from "react";
import type { DeckCardPreviewSnapshot, HeroSnapshot } from "@nightfall/contracts";

function costLine(card: DeckCardPreviewSnapshot): string {
  const parts = [`${card.apCost} AP`];
  if (card.manaCost > 0) parts.push(`${card.manaCost} mana`);
  if (card.staminaCost > 0) parts.push(`${card.staminaCost} stamina`);
  return parts.join(" · ");
}

export function DeckPreviewPanel({
  hero,
  focusCardId,
  onSelectCard
}: {
  hero: HeroSnapshot;
  focusCardId: string | null;
  onSelectCard: (cardId: string) => void;
}) {
  const groups = useMemo(() => {
    const cards = hero.deckPreview ?? [];
    const order: string[] = [];
    const map = new Map<string, DeckCardPreviewSnapshot[]>();
    for (const card of cards) {
      if (!map.has(card.sourceLabel)) {
        map.set(card.sourceLabel, []);
        order.push(card.sourceLabel);
      }
      map.get(card.sourceLabel)!.push(card);
    }
    return order.map((label) => ({ label, cards: map.get(label)! }));
  }, [hero.deckPreview]);

  if (groups.length === 0) {
    return <p className="empty">No deck preview available for {hero.name}.</p>;
  }

  return <div className="deck-preview-groups">
    {groups.map(({ label, cards }) => <section key={label} className="deck-preview-group" aria-label={label}>
      <header className="deck-preview-group-head">
        <h3>{label}</h3>
        <span>{cards.length} card{cards.length === 1 ? "" : "s"}</span>
      </header>
      <div className="deck-preview-cards">
        {cards.map((card) => <button
          key={`${card.cardId}:${label}`}
          type="button"
          className={`deck-preview-card${focusCardId === card.cardId ? " is-selected" : ""}`}
          aria-pressed={focusCardId === card.cardId}
          onClick={() => onSelectCard(card.cardId)}
        >
          <strong>{card.name}</strong>
          <span className="deck-preview-cost">{costLine(card)}</span>
          <small>{card.summary}</small>
        </button>)}
      </div>
    </section>)}
  </div>;
}

export function DeckCardDetail({ card }: { card: DeckCardPreviewSnapshot | undefined }) {
  if (card === undefined) return <p className="empty">Select a card to inspect its combat preview.</p>;
  return <>
    <small>{card.sourceLabel}</small>
    <h3>{card.name}</h3>
    <p className="deck-preview-detail-cost">{costLine(card)}</p>
    <p className="inventory-detail-effect">{card.summary}</p>
  </>;
}
