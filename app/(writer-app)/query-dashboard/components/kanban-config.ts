import type { ColumnData } from "./kanban-column";

export const QUERY_DASH_COLUMNS = [
  { id: "agents-to-research", title: "Agents to Research" },
  { id: "submitted-query", title: "Submitted Query" },
  { id: "pages-requested", title: "Pages Requested" },
  { id: "rejected", title: "Rejected" },
  { id: "offer-made", title: "Offer Made" },
] as const satisfies readonly ColumnData[];

export type QueryDashColumnId = (typeof QUERY_DASH_COLUMNS)[number]["id"];

export function isQueryDashColumnId(value: string): value is QueryDashColumnId {
  return QUERY_DASH_COLUMNS.some((column) => column.id === value);
}
