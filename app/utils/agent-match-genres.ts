type MatchHitGroup = {
  genres?: unknown;
  subgenres?: unknown;
  themes?: unknown;
};

type MatchHits = {
  direct?: MatchHitGroup;
  cluster?: MatchHitGroup;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeTokens(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(normalizeTokens);
  }

  if (typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return normalizeTokens(parsed);
    }
  } catch {
    // Plain comma-separated strings are expected from some agent metadata rows.
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeMatchHits(value: unknown): MatchHits | null {
  return isRecord(value) ? (value as MatchHits) : null;
}

export function getGenresThemesSummary(source: {
  genres?: unknown;
  match_hits?: unknown;
  subgenres?: unknown;
  themes?: unknown;
}) {
  const matchHits = normalizeMatchHits(source.match_hits);
  const tokens = [
    ...normalizeTokens(matchHits?.direct?.genres),
    ...normalizeTokens(matchHits?.cluster?.genres),
    ...normalizeTokens(matchHits?.direct?.subgenres),
    ...normalizeTokens(matchHits?.cluster?.subgenres),
    ...normalizeTokens(matchHits?.direct?.themes),
    ...normalizeTokens(matchHits?.cluster?.themes),
    ...normalizeTokens(source.genres),
    ...normalizeTokens(source.subgenres),
    ...normalizeTokens(source.themes),
  ];
  const seen = new Set<string>();
  const deduped: string[] = [];

  for (const token of tokens) {
    const key = token.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(token);
  }

  return deduped.join(", ");
}
