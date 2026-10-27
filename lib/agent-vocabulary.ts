export function submissionMethods(rawStatus?: string | null): string[] {
  if (typeof rawStatus !== "string") return [];
  const labels: Record<string, string> = {
    "e-mail": "Email", email: "Email", "online form": "Online Form",
    "querymanager form": "QueryManager Form", "postal mail": "Postal Mail", mail: "Postal Mail",
  };
  const parts = rawStatus.trim().toLowerCase().replace(/\s+/g, " ").split(",").map((part) => part.trim());
  return parts.every((part) => Object.hasOwn(labels, part))
    ? [...new Set(parts.map((part) => labels[part]))] : [];
}

export const TRAIT_GROUPS = ["genres", "subgenres", "themes", "formats", "audiences"] as const;
export type TraitGroup = typeof TRAIT_GROUPS[number];
export const TRAIT_GROUP_LABELS: Record<TraitGroup, string> = {
  genres: "Genres", subgenres: "Subgenres", themes: "Themes", formats: "Formats", audiences: "Audiences",
};
export interface ReviewedTrait {
  trait_id: string;
  trait_type: string;
  canonical_value: string;
  display_value: string;
}
export interface TraitMatches {
  version: number;
  build_id: string;
  workspace_id: string;
  basis: "reviewed_trait_overlap" | "structured_preference_evidence";
  score_basis: "legacy_matcher" | "manuscript_fit_v2";
  groups: Partial<Record<TraitGroup, (ReviewedTrait & {
    match_type: "direct" | "alias" | "explicit" | "broader" | "conditional"; selected_values: string[];
  })[]>>;
}
export interface AgentVocabulary {
  version: number;
  build_id: string;
  workspace_id: string;
  submission_status?: "open" | "closed" | "unknown" | null;
  trait_details: Partial<Record<TraitGroup, ReviewedTrait[]>>;
  raw_genre_statements?: string[];
  raw_negative_statements?: string[];
  negative_preferences?: (ReviewedTrait & {
    clause_id?: string | null; raw_value: string;
    requires_exception_aware_matching: boolean;
  })[];
  negative_clauses?: {
    clause_id: string; raw_value: string; status: string; effect: string;
    original_raw_value?: string | null;
    classification?: string | null; qualifier_text?: string | null;
  }[];
}
export interface MatchingContext {
  status: "available" | "unavailable";
  basis?: "latest_saved_search";
  writer_project_id: string;
  searched_at?: string;
}

export function matchingTraits(matches: TraitMatches | null | undefined, group: TraitGroup) {
  // The cards' Matching Genres section includes typed genre and subgenre hits.
  // Keep their typed IDs intact so profiles can highlight the same interests.
  const traits = group === "genres"
    ? [...(matches?.groups.genres ?? []), ...(matches?.groups.subgenres ?? [])]
    : matches?.groups[group] ?? [];
  return [...new Map(traits.map((trait) => [trait.trait_id, trait])).values()];
}

export function matchingLabels(matches: TraitMatches | null | undefined, group: TraitGroup): string[] {
  return [...new Set(matchingTraits(matches, group).map((item) => item.display_value))];
}

export function sameVocabularyScope(vocabulary: AgentVocabulary, matches: TraitMatches): boolean {
  return vocabulary.build_id === matches.build_id && vocabulary.workspace_id === matches.workspace_id;
}

// The API includes complete source statements and extracted clause fragments.
// Display each statement once, keeping its punctuation and any exceptions intact.
export function statementParagraph(statements: string[]): string {
  const unique = new Map<string, string>();
  for (const statement of statements) {
    const text = statement.trim().replace(/\s+/g, " ");
    const key = text.toLowerCase();
    if (text && !unique.has(key)) unique.set(key, text);
  }
  const entries = [...unique];
  return entries.filter(([key]) => !entries.some(([other]) => {
    if (other.length <= key.length) return false;
    let offset = other.indexOf(key);
    while (offset !== -1) {
      if (!/[\p{L}\p{N}]$/u.test(other.slice(0, offset))
        && !/^[\p{L}\p{N}]/u.test(other.slice(offset + key.length))) return true;
      offset = other.indexOf(key, offset + 1);
    }
    return false;
  })).map(([, text]) => text).join(" ");
}

export function negativeBubbles(vocabulary: AgentVocabulary) {
  // Group only the displayed labels; retain all source wording and conditions.
  const bubbles = new Map<string, { label: string; statements: string[]; conditional: boolean }>();
  for (const preference of vocabulary.negative_preferences ?? []) {
    const key = preference.display_value.trim().toLowerCase();
    if (!key) continue;
    const bubble = bubbles.get(key) ?? { label: preference.display_value, statements: [], conditional: false };
    bubble.statements.push(preference.raw_value);
    bubble.conditional ||= preference.requires_exception_aware_matching;
    bubbles.set(key, bubble);
  }
  return [...bubbles.values()].map((bubble) => ({
    label: bubble.label,
    text: statementParagraph(bubble.statements),
    conditional: bubble.conditional,
  }));
}


export function negativeStatementParagraph(vocabulary?: AgentVocabulary | null): string {
  if (!vocabulary) return "";
  const clauses = vocabulary.negative_clauses ?? [];
  const isRefusal = (clause: typeof clauses[number]) => clause.status !== "nontrait"
    && ["refusal", "refuse", "soft"].includes(clause.effect);
  const refusalStatements = [
    ...(vocabulary.negative_preferences?.map((preference) => preference.raw_value) ?? []),
    ...clauses.filter(isRefusal).map((clause) =>
      statementParagraph([clause.raw_value, clause.qualifier_text ?? ""])),
  ];
  const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();
  const phrasePattern = (value: string) => new RegExp(
    `(?<![\\p{L}\\p{N}])${normalize(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "gu");
  const ignoredStatements = clauses.filter((clause) => clause.status === "nontrait"
    || ["nontrait", "context", "policy"].includes(clause.effect))
    .flatMap((clause) => [clause.raw_value, clause.original_raw_value ?? ""])
    .filter((value) => value.trim());
  const rawStatements = (vocabulary.raw_negative_statements ?? []).filter((statement) => {
    // Preserve complete source wording for refusals and unclassified statements.
    // Omit text only when reviewed non-refusal clauses cover the whole statement.
    const text = normalize(statement);
    if (refusalStatements.some((refusal) => refusal.trim() && phrasePattern(refusal).test(text))) return true;
    const remainder = ignoredStatements.reduce((remaining, ignored) =>
      remaining.replace(phrasePattern(ignored), " "), text);
    return /[\p{L}\p{N}]/u.test(remainder);
  });
  return statementParagraph([...rawStatements, ...refusalStatements]);
}
