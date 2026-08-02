export const QUERY_ROUND_SELECTIONS = [
  "round-1",
  "round-2",
  "round-3",
  "hold",
  "unassigned",
] as const;

export type QueryRoundSelection = (typeof QUERY_ROUND_SELECTIONS)[number];
export type QueryRoundFilter = "all" | QueryRoundSelection;
export type QueryRoundNumber = 1 | 2 | 3;
export type QueryRoundSortDirection = "ASC" | "DESC";

export type QueryRoundState = {
  queryRound: number | null;
  queryOnHold: boolean;
};

export const QUERY_ROUND_LABELS: Record<QueryRoundSelection, string> = {
  "round-1": "Round 1",
  "round-2": "Round 2",
  "round-3": "Round 3",
  hold: "Hold",
  unassigned: "Unassigned",
};

export function isQueryRoundSelection(
  value: unknown,
): value is QueryRoundSelection {
  return QUERY_ROUND_SELECTIONS.includes(value as QueryRoundSelection);
}

export function isQueryRoundFilter(value: unknown): value is QueryRoundFilter {
  return value === "all" || isQueryRoundSelection(value);
}

export function getQueryRoundState(
  selection: QueryRoundSelection,
): QueryRoundState {
  if (selection === "hold") {
    return { queryRound: null, queryOnHold: true };
  }

  if (selection === "unassigned") {
    return { queryRound: null, queryOnHold: false };
  }

  return {
    queryRound: Number(selection.slice(-1)) as QueryRoundNumber,
    queryOnHold: false,
  };
}

export function getQueryRoundSelection(
  state: QueryRoundState,
): QueryRoundSelection {
  if (state.queryOnHold) return "hold";
  if (
    state.queryRound === 1 ||
    state.queryRound === 2 ||
    state.queryRound === 3
  ) {
    return `round-${state.queryRound}`;
  }
  return "unassigned";
}

export function getQueryRoundLabel(state: QueryRoundState) {
  return QUERY_ROUND_LABELS[getQueryRoundSelection(state)];
}

export function isSameQueryRoundState(
  left: QueryRoundState,
  right: QueryRoundState,
) {
  return (
    left.queryRound === right.queryRound &&
    left.queryOnHold === right.queryOnHold
  );
}

export function matchesQueryRoundFilter(
  state: QueryRoundState,
  filter: QueryRoundFilter,
) {
  return filter === "all" || getQueryRoundSelection(state) === filter;
}

const QUERY_ROUND_SORT_RANK: Record<QueryRoundSelection, number> = {
  "round-1": 0,
  "round-2": 1,
  "round-3": 2,
  hold: 3,
  unassigned: 4,
};

export function sortByQueryRound<T extends QueryRoundState>(
  items: readonly T[],
  direction: QueryRoundSortDirection,
) {
  const multiplier = direction === "ASC" ? 1 : -1;

  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const rankDifference =
        QUERY_ROUND_SORT_RANK[getQueryRoundSelection(left.item)] -
        QUERY_ROUND_SORT_RANK[getQueryRoundSelection(right.item)];

      return rankDifference === 0
        ? left.index - right.index
        : rankDifference * multiplier;
    })
    .map(({ item }) => item);
}

export function applyQueryRoundState<T extends QueryRoundState & { id: string }>(
  items: readonly T[],
  recordId: string,
  nextState: QueryRoundState,
) {
  return items.map((item) =>
    item.id === recordId ? { ...item, ...nextState } : item,
  );
}

/** Roll back only if no newer optimistic change has superseded this request. */
export function rollbackQueryRoundState<
  T extends QueryRoundState & { id: string },
>(
  items: readonly T[],
  recordId: string,
  optimisticState: QueryRoundState,
  previousState: QueryRoundState,
) {
  return items.map((item) =>
    item.id === recordId && isSameQueryRoundState(item, optimisticState)
      ? { ...item, ...previousState }
      : item,
  );
}
