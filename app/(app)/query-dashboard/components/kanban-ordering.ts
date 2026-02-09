import { KanbanCardData } from "./kanban-card";

export const FIRST_COLUMN_ID = "agents-to-research";

function parseTimestamp(value?: string): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

export function sortFirstColumnByNewest(cards: KanbanCardData[]): KanbanCardData[] {
  const firstColumnCards = cards
    .filter((card) => card.columnId === FIRST_COLUMN_ID)
    .sort((a, b) => {
      const timestampDiff = parseTimestamp(b.created_at) - parseTimestamp(a.created_at);
      if (timestampDiff !== 0) return timestampDiff;

      const idDiff = b.id.localeCompare(a.id);
      if (idDiff !== 0) return idDiff;

      return 0;
    });

  let firstColumnIndex = 0;
  return cards.map((card) => {
    if (card.columnId !== FIRST_COLUMN_ID) return card;
    const nextCard = firstColumnCards[firstColumnIndex];
    firstColumnIndex += 1;
    return nextCard;
  });
}
